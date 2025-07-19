'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { getCurrentTeam } from '@/lib/auth';


interface Marker {
  id: string;
  label: string;
  lat: number;
  lng: number;
  type: string;
  zoneNumber?: number;
  deviceIcon?: string;
  assetIcon?: string;
  locked?: boolean;
  isSearchResult?: boolean;
}

interface MapContainerProps {
  teamName: string;
  onLogout: () => void;
}

export default function MapContainer({ teamName, onLogout }: MapContainerProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  console.log('MapContainer rendering with new v1 layout');
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [mapId, setMapId] = useState<string | null>(null);
  const [mapTitle, setMapTitle] = useState('Untitled Map');
  const [zoom, setZoom] = useState(4.2);
  const [currentStyle, setCurrentStyle] = useState<'satellite' | 'street'>('satellite');
  const [labelsVisible, setLabelsVisible] = useState(false);
  const [lastSearchLocation, setLastSearchLocation] = useState<{lng: number; lat: number; zoom: number} | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  
  // Drag and drop state
  const [draggedPinType, setDraggedPinType] = useState<{
    type: string;
    zoneNumber?: number;
    deviceIcon?: string;
    assetIcon?: string;
  } | null>(null);

  // Get current team
  const currentTeam = getCurrentTeam();


  useEffect(() => {
    if (map.current) return; // initialize map only once
    
    // Get token from environment variable
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    
    console.log('Mapbox token check:', token ? 'Token found' : 'No token found');
    console.log('Environment:', process.env.NODE_ENV);
    
    if (!token) {
      console.error('Mapbox access token is required. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN');
      return;
    }

    mapboxgl.accessToken = token;

    if (mapContainer.current) {
      console.log('Creating Mapbox map...');
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/nginear/clkd3dq69005u01qk6q7a6z7r', // Custom satellite style from v1
          center: [-98.5795, 39.8283], // Center of United States
          zoom: 4.2,
        });

        console.log('Map created successfully');

        // Update zoom display
        const updateZoom = () => {
          if (map.current) {
            setZoom(Math.round(map.current.getZoom() * 10) / 10);
          }
        };

        map.current.on('zoom', updateZoom);
        map.current.on('load', () => {
          console.log('Map loaded successfully');
          updateZoom();
          loadTeamData();
          initializeSearchBox();
          
          // Debug container dimensions
          if (mapContainer.current) {
            const rect = mapContainer.current.getBoundingClientRect();
            console.log('Map container dimensions:', rect.width, 'x', rect.height);
          }
          
          // Force resize after a short delay
          setTimeout(() => {
            if (map.current) {
              console.log('Forcing map resize...');
              map.current.resize();
            }
          }, 100);
        });
        
        map.current.on('error', (e) => {
          console.error('Map error:', e);
        });
      } catch (error) {
        console.error('Error creating map:', error);
      }
    } else {
      console.error('Map container not found');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load team data from API
  const loadTeamData = async () => {
    console.log('loadTeamData called, currentTeam:', currentTeam);
    if (!currentTeam) {
      console.error('No currentTeam available');
      return;
    }

    try {
      console.log('Fetching maps for team:', currentTeam.name);
      const response = await fetch(`/api/maps?team=${currentTeam.name}`);
      console.log('API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API response data:', data);
        
        if (data.maps && data.maps.length > 0) {
          const defaultMap = data.maps[0];
          console.log('Found existing map:', defaultMap.id);
          setMapId(defaultMap.id);
          setMarkers(defaultMap.markers || []);
          if (defaultMap.title) {
            setMapTitle(defaultMap.title);
          }
          console.log('Map ID set to:', defaultMap.id);
        } else {
          console.log('No maps found, creating default map');
          await createDefaultMap();
        }
      } else {
        console.error('API response not ok:', response.status);
        const errorData = await response.json();
        console.error('Error data:', errorData);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
    }
  };

  // Create default map for team
  const createDefaultMap = async () => {
    console.log('createDefaultMap called, currentTeam:', currentTeam);
    if (!currentTeam) {
      console.error('No currentTeam available for creating default map');
      return;
    }

    try {
      console.log('Creating default map for team:', currentTeam.name);
      const response = await fetch('/api/maps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: currentTeam.name,
          title: mapTitle,
          centerLat: 39.8283,
          centerLng: -98.5795,
          zoom: 4.2,
          style: 'mapbox://styles/nginear/clkd3dq69005u01qk6q7a6z7r'
        }),
      });

      console.log('Create map response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Create map response data:', data);
        setMapId(data.map.id);
        setMarkers(data.map.markers || []);
        console.log('Default map created with ID:', data.map.id);
      } else {
        console.error('Create map response not ok:', response.status);
        const errorData = await response.json();
        console.error('Create map error data:', errorData);
      }
    } catch (error) {
      console.error('Error creating default map:', error);
    }
  };

  // Toggle map style
  const toggleMapStyle = (style: 'satellite' | 'street') => {
    if (!map.current || style === currentStyle) return;
    
    setCurrentStyle(style);
    const styleUrl = style === 'satellite' 
      ? 'mapbox://styles/nginear/clkd3dq69005u01qk6q7a6z7r' // Custom satellite style from v1
      : 'mapbox://styles/mapbox/streets-v12';
    
    map.current.setStyle(styleUrl);
  };

  // Re-center to last search location
  const recenterToSearch = () => {
    if (lastSearchLocation && map.current) {
      map.current.flyTo({
        center: [lastSearchLocation.lng, lastSearchLocation.lat],
        zoom: lastSearchLocation.zoom,
        speed: 2.0
      });
    }
  };


  // Handle geocoding search using Mapbox Geocoding API
  const handleGeocodingSearch = async (query: string) => {
    console.log('Geocoding search for:', query);
    const token = mapboxgl.accessToken || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.error('No token available for geocoding');
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&country=US&limit=1`
      );
      
      if (!response.ok) {
        console.error('Geocoding API error:', response.status);
        return;
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;
        const placeName = feature.place_name || query;
        
        console.log('Geocoding result:', placeName, 'at', lng, lat);
        console.log('About to add marker...');
        
        setLastSearchLocation({ lng, lat, zoom: 16 });
        
        if (map.current) {
          map.current.flyTo({ 
            center: [lng, lat], 
            zoom: 16,
            speed: 2.0
          });
        }
        
        await addMarkerToMap(lng, lat, placeName, 'location', undefined, undefined, undefined);
        console.log('Marker should be added now');
      } else {
        console.warn('No geocoding results found for:', query);
        alert('No results found for: ' + query);
      }
    } catch (error) {
      console.error('Geocoding search error:', error);
      alert('Search failed. Please try again.');
    }
  };

  // Handle direct GPS coordinate input
  const handleCoordinateSearch = (input: string): boolean => {
    const coordPattern = /^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/;
    const match = input.trim().match(coordPattern);
    
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        console.log('Direct coordinate search:', { lat, lng });
        
        setLastSearchLocation({ lng, lat, zoom: 16 });
        
        if (map.current) {
          map.current.flyTo({ 
            center: [lng, lat], 
            zoom: 16,
            speed: 2.0
          });
        }
        
        const label = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        addMarkerToMap(lng, lat, label, 'location', undefined, undefined, undefined);
        return true;
      }
    }
    return false;
  };

  // Initialize simple search input using Geocoding API
  const initializeSearchBox = () => {
    const searchContainer = document.getElementById('search-box');
    if (!searchContainer) return;
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search for address or coordinates...';
    searchInput.className = 'w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring';
    
    searchInput.addEventListener('keydown', async (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const query = (e.target as HTMLInputElement).value.trim();
        if (!query) return;
        
        if (handleCoordinateSearch(query)) {
          (e.target as HTMLInputElement).value = '';
          return;
        }
        
        await handleGeocodingSearch(query);
        (e.target as HTMLInputElement).value = '';
      }
    });

    searchContainer.appendChild(searchInput);
  };


  // Clear all markers
  const clearMarkers = async () => {
    if (markers.length === 0) return;
    
    const confirmClear = confirm(
      `You have ${markers.length} marker(s) currently placed.\n\n` +
      'Clearing will permanently remove all markers and groups.\n\n' +
      'Do you want to continue?'
    );
    
    if (confirmClear) {
      try {
        // Delete all markers from database
        for (const marker of markers) {
          await fetch(`/api/markers/${marker.id}`, {
            method: 'DELETE',
          });
        }
        
        // Remove visual markers
        Object.values(markersRef.current).forEach(marker => marker.remove());
        markersRef.current = {};
        setMarkers([]);
        
        console.log('All markers cleared from database');
      } catch (error) {
        console.error('Error clearing markers:', error);
        alert('Error clearing markers. Please try again.');
      }
    }
  };

  // Start new map
  const startNewMap = () => {
    if (markers.length > 0) {
      const confirmNew = confirm(
        `You have ${markers.length} marker(s) currently placed.\n\n` +
        'Starting a new map will clear all current work.\n\n' +
        'Do you want to continue?'
      );
      
      if (!confirmNew) return;
    }
    
    // Clear everything and reset
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    setMarkers([]);
    setMapTitle('Untitled Map');
    setLastSearchLocation(null);
    
    if (map.current) {
      map.current.flyTo({
        center: [-98.5795, 39.8283],
        zoom: 4.2,
        speed: 1.5
      });
    }
  };

  // Delete individual marker
  const deleteMarker = async (markerId: string) => {
    try {
      const response = await fetch(`/api/markers/${markerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from state
        setMarkers(prev => prev.filter(m => m.id !== markerId));
        
        // Remove visual marker from map
        if (markersRef.current[markerId]) {
          markersRef.current[markerId].remove();
          delete markersRef.current[markerId];
        }
        
        console.log('Marker deleted:', markerId);
      } else {
        console.error('Failed to delete marker:', response.status);
        alert('Failed to delete marker. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting marker:', error);
      alert('Error deleting marker. Please try again.');
    }
  };

  // Edit map title
  const editMapTitle = () => {
    const newTitle = prompt('Enter map title:', mapTitle);
    if (newTitle && newTitle.trim() !== '') {
      setMapTitle(newTitle.trim());
      // TODO: Save to database
    }
  };

  // Add marker to map and database
  const addMarkerToMap = async (lng: number, lat: number, label: string, type: string, zoneNumber?: number, deviceIcon?: string, assetIcon?: string) => {
    console.log('addMarkerToMap called with:', { lng, lat, label, type, mapId: mapId, mapExists: !!map.current });
    
    if (!mapId) {
      console.error('No mapId available for adding marker');
      return;
    }
    
    if (!map.current) {
      console.error('No map instance available for adding marker');
      return;
    }

    try {
      // Add to database
      const response = await fetch('/api/markers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mapId,
          label,
          lat,
          lng,
          type,
          zoneNumber,
          deviceIcon,
          assetIcon
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const marker = data.marker;
        setMarkers(prev => [...prev, marker]);
        
        // Create custom marker element based on type
        const el = document.createElement('div');
        el.className = `custom-marker ${type}`;
        el.style.cssText = `
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;
        
        // Set background color and content based on type
        if (type === 'location') {
          el.style.backgroundColor = 'hsl(222.2 84% 4.9%)';
          el.style.borderColor = 'hsl(214.3 31.8% 91.4%)';
          el.style.color = 'hsl(210 40% 98%)';
          el.textContent = zoneNumber?.toString() || 'L';
        } else if (type === 'device') {
          el.style.backgroundColor = 'rgb(243, 243, 243)';
          el.style.borderColor = 'hsl(214.3 31.8% 91.4%)';
          const icon = deviceIcon || 'memory';
          
          if (icon === 'solar-panel') {
            el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: hsl(222.2 84% 4.9%);">
              <path d="M4,2H20A2,2 0 0,1 22,4V14A2,2 0 0,1 20,16H15V20H18V22H13V16H11V22H6V20H9V16H4A2,2 0 0,1 2,14V4A2,2 0 0,1 4,2M4,4V8H11V4H4M4,14H11V10H4V14M20,14V10H13V14H20M20,4H13V8H20V4Z" />
            </svg>`;
          } else {
            el.innerHTML = `<span class="material-icons" style="font-size: 16px; color: hsl(222.2 84% 4.9%);">${icon}</span>`;
          }
        } else if (type === 'assets') {
          el.style.backgroundColor = 'rgb(243, 243, 243)';
          el.style.borderColor = 'hsl(214.3 31.8% 91.4%)';
          const icon = assetIcon || 'build';
          el.innerHTML = `<span class="material-icons" style="font-size: 16px; color: hsl(222.2 84% 4.9%);">${icon}</span>`;
        }
        
        // Create popup
        const popup = new mapboxgl.Popup({ 
          offset: [25, 0],
          anchor: 'left',
          closeButton: false,
          closeOnClick: false
        }).setHTML(`<div style="font-weight: 500;">${label}</div>`);
        
        // Add marker to map
        const mapboxMarker = new mapboxgl.Marker({ element: el, draggable: true })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map.current);
        
        // Add drag end event
        mapboxMarker.on('dragend', () => {
          const lngLat = mapboxMarker.getLngLat();
          // TODO: Update marker position in database
          console.log('Marker moved to:', lngLat.lng, lngLat.lat);
        });
        
        markersRef.current[marker.id] = mapboxMarker;
        console.log('Added marker:', label, 'at', lng, lat);
      }
    } catch (error) {
      console.error('Error adding marker:', error);
    }
  };

  return (
    <div className="relative h-screen">
      {/* Left Sidebar */}
      <div className="fixed top-0 left-0 h-screen w-[280px] bg-white border-r border-border z-[1000] overflow-y-auto p-4 box-border flex flex-col">
        {/* Controls Section */}
        <div className="mb-6">
          <Button 
            onClick={startNewMap}
            className="w-full mb-4"
          >
            Start New Map
          </Button>
          
          {/* Search Box */}
          <div className="mb-4">
            <div 
              id="search-box"
              className="w-full"
            />
          </div>
        </div>

        {/* Map Title Section */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <h2 
              className="flex-1 m-0 cursor-pointer text-xl font-semibold text-foreground"
              onClick={editMapTitle}
              title="Click to edit title"
            >
              {mapTitle}
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={editMapTitle}
              className="w-6 h-6 p-0"
              title="Edit map title"
            >
              <span className="material-icons text-xs">edit</span>
            </Button>
          </div>
          
          <h3 className="text-base font-semibold mb-3 text-foreground">Placed Markers</h3>
          <div className="space-y-2">
            {markers.length === 0 ? (
              <div className="text-sm text-muted-foreground">No markers placed</div>
            ) : (
              markers.map((marker) => (
                <div key={marker.id} className="flex items-center justify-between py-2 text-sm">
                  <span 
                    className="flex-1 cursor-pointer text-foreground"
                    title="Click to center on marker"
                  >
                    {marker.label}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-6 h-6 p-0"
                      title={marker.locked ? 'Unlock marker' : 'Lock marker'}
                    >
                      <span className="material-icons text-xs">
                        {marker.locked ? 'lock' : 'lock_open'}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-6 h-6 p-0"
                      title="Edit marker"
                    >
                      <span className="material-icons text-xs">edit</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-6 h-6 p-0"
                      title="Delete marker"
                      onClick={() => deleteMarker(marker.id)}
                    >
                      <span className="material-icons text-xs">delete</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto pt-4">
          <div className="flex gap-2">
            <Button 
              className="flex-1"
              title="Click to save map, drag file here to load"
            >
              Save/Load Map
            </Button>
            <Button 
              variant="outline"
              className="w-10 h-9 p-0"
              title="Enter screenshot mode - hides UI, shows all labels"
            >
              <span className="material-icons text-lg">photo_camera</span>
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onLogout}
            className="w-full mt-2"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainer}
        className="absolute top-0 bottom-0 left-[280px] right-0 w-[calc(100%-280px)] h-full"
        style={{ minHeight: '100vh' }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (!draggedPinType || !map.current) return;
          
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const lngLat = map.current.unproject([x, y]);
          
          let label;
          if (draggedPinType.type === 'location') {
            label = `Location ${draggedPinType.zoneNumber}`;
          } else if (draggedPinType.type === 'device') {
            label = 'Device';
          } else if (draggedPinType.type === 'assets') {
            label = 'Asset';
          } else {
            label = draggedPinType.type.charAt(0).toUpperCase() + draggedPinType.type.slice(1);
          }
          
          addMarkerToMap(
            lngLat.lng, 
            lngLat.lat, 
            label, 
            draggedPinType.type, 
            draggedPinType.zoneNumber,
            draggedPinType.deviceIcon,
            draggedPinType.assetIcon
          );
          
          setDraggedPinType(null);
        }}
      />

      {/* Bottom Controls */}
      <div className="fixed bottom-8 right-3 bg-white text-foreground p-3 rounded-lg text-xs font-medium z-[1000] border border-border shadow-lg flex items-center gap-3">
        <div className="text-foreground">Zoom: {zoom}</div>
        <div className="flex gap-1">
          <Button
            variant={currentStyle === 'satellite' ? 'default' : 'outline'}
            size="sm"
            className="text-xs px-2 py-1 h-auto"
            onClick={() => toggleMapStyle('satellite')}
          >
            Satellite
          </Button>
          <Button
            variant={currentStyle === 'street' ? 'default' : 'outline'}
            size="sm"
            className="text-xs px-2 py-1 h-auto"
            onClick={() => toggleMapStyle('street')}
          >
            Street
          </Button>
        </div>
        <Button
          variant={labelsVisible ? 'default' : 'outline'}
          size="sm"
          className="text-xs px-2 py-1 h-auto"
          onClick={() => setLabelsVisible(!labelsVisible)}
        >
          Labels
        </Button>
        <Button
          size="sm"
          className="text-xs px-3 py-1 h-auto"
          disabled={!lastSearchLocation}
          onClick={recenterToSearch}
        >
          Re-center
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs px-2 py-1 h-auto"
          title="Help & Tutorial"
        >
          <span className="text-sm font-bold">?</span>
        </Button>
      </div>

      {/* Right Pin Toolbar */}
      <div className="fixed top-3 right-3 z-[1000] bg-white p-2 rounded-lg border border-border shadow-lg w-[95px] max-w-[95px]">
        {/* Locations */}
        <div className="mb-4">
          <h4 className="text-xs font-medium mb-2 text-muted-foreground">Locations</h4>
          <div className="flex flex-wrap gap-1 justify-start">
            {[1,2,3,4,5,6,7,8,9,10].map(num => (
              <div
                key={num}
                className="w-8 h-8 bg-foreground border-2 border-border rounded-full cursor-grab flex items-center justify-center text-white text-xs font-bold transition-all hover:bg-foreground/80 hover:scale-105 active:cursor-grabbing"
                draggable={true}
                title={`Location ${num}`}
                onDragStart={(e) => {
                  setDraggedPinType({
                    type: 'location',
                    zoneNumber: num
                  });
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onDragEnd={() => {
                  setDraggedPinType(null);
                }}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="mb-4">
          <h4 className="text-xs font-medium mb-2 text-muted-foreground">Devices</h4>
          <div className="flex flex-wrap gap-1">
            <div
              className="w-8 h-8 bg-muted border-2 border-border rounded-full cursor-grab flex items-center justify-center text-foreground transition-all hover:bg-muted/80 hover:scale-105 active:cursor-grabbing"
              draggable={true}
              title="Memory Device"
              onDragStart={(e) => {
                setDraggedPinType({
                  type: 'device',
                  deviceIcon: 'memory'
                });
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onDragEnd={() => {
                setDraggedPinType(null);
              }}
            >
              <span className="material-icons text-base">memory</span>
            </div>
            <div
              className="w-8 h-8 bg-muted border-2 border-border rounded-full cursor-grab flex items-center justify-center text-foreground transition-all hover:bg-muted/80 hover:scale-105 active:cursor-grabbing"
              draggable={true}
              title="WiFi Device"
              onDragStart={(e) => {
                setDraggedPinType({
                  type: 'device',
                  deviceIcon: 'wifi'
                });
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onDragEnd={() => {
                setDraggedPinType(null);
              }}
            >
              <span className="material-icons text-base">wifi</span>
            </div>
            <div
              className="w-8 h-8 bg-muted border-2 border-border rounded-full cursor-grab flex items-center justify-center text-foreground transition-all hover:bg-muted/80 hover:scale-105 active:cursor-grabbing"
              draggable={true}
              title="Solar Panel"
              onDragStart={(e) => {
                setDraggedPinType({
                  type: 'device',
                  deviceIcon: 'solar-panel'
                });
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onDragEnd={() => {
                setDraggedPinType(null);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M4,2H20A2,2 0 0,1 22,4V14A2,2 0 0,1 20,16H15V20H18V22H13V16H11V22H6V20H9V16H4A2,2 0 0,1 2,14V4A2,2 0 0,1 4,2M4,4V8H11V4H4M4,14H11V10H4V14M20,14V10H13V14H20M20,4H13V8H20V4Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Assets */}
        <div className="mb-4">
          <h4 className="text-xs font-medium mb-2 text-muted-foreground">Assets</h4>
          <div className="flex flex-wrap gap-1">
            <div
              className="w-8 h-8 bg-muted border-2 border-border rounded-full cursor-grab flex items-center justify-center text-foreground transition-all hover:bg-muted/80 hover:scale-105 active:cursor-grabbing"
              draggable={true}
              title="Build Tool"
              onDragStart={(e) => {
                setDraggedPinType({
                  type: 'assets',
                  assetIcon: 'build'
                });
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onDragEnd={() => {
                setDraggedPinType(null);
              }}
            >
              <span className="material-icons text-base">build</span>
            </div>
            <div
              className="w-8 h-8 bg-muted border-2 border-border rounded-full cursor-grab flex items-center justify-center text-foreground transition-all hover:bg-muted/80 hover:scale-105 active:cursor-grabbing"
              draggable={true}
              title="Network"
              onDragStart={(e) => {
                setDraggedPinType({
                  type: 'assets',
                  assetIcon: 'lan'
                });
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onDragEnd={() => {
                setDraggedPinType(null);
              }}
            >
              <span className="material-icons text-base">lan</span>
            </div>
            <div
              className="w-8 h-8 bg-muted border-2 border-border rounded-full cursor-grab flex items-center justify-center text-foreground transition-all hover:bg-muted/80 hover:scale-105 active:cursor-grabbing"
              draggable={true}
              title="Warning"
              onDragStart={(e) => {
                setDraggedPinType({
                  type: 'assets',
                  assetIcon: 'warning'
                });
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onDragEnd={() => {
                setDraggedPinType(null);
              }}
            >
              <span className="material-icons text-base">warning</span>
            </div>
            <div
              className="w-8 h-8 bg-muted border-2 border-border rounded-full cursor-grab flex items-center justify-center text-foreground transition-all hover:bg-muted/80 hover:scale-105 active:cursor-grabbing"
              draggable={true}
              title="Power"
              onDragStart={(e) => {
                setDraggedPinType({
                  type: 'assets',
                  assetIcon: 'power'
                });
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onDragEnd={() => {
                setDraggedPinType(null);
              }}
            >
              <span className="material-icons text-base">power</span>
            </div>
          </div>
        </div>

        {/* Clear Button */}
        <Button 
          onClick={clearMarkers}
          className="w-full text-xs"
          variant="outline"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}