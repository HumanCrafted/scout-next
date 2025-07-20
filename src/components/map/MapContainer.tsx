'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
}

interface MapContainerProps {
  teamName: string;
  onLogout: () => void;
}

export default function MapContainer({ teamName, onLogout }: MapContainerProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [mapId, setMapId] = useState<string | null>(null);
  const [mapTitle, setMapTitle] = useState('Untitled Map');
  const [zoom, setZoom] = useState(4.2);
  const [currentStyle, setCurrentStyle] = useState<'satellite' | 'street'>('satellite');
  const [labelsVisible, setLabelsVisible] = useState(true);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const mapIdRef = useRef<string | null>(null);
  
  // Modal states
  const [isEditTitleModalOpen, setIsEditTitleModalOpen] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [isEditMarkerModalOpen, setIsEditMarkerModalOpen] = useState(false);
  const [editingMarker, setEditingMarker] = useState<Marker | null>(null);
  const [editMarkerName, setEditMarkerName] = useState('');
  const [editMarkerLat, setEditMarkerLat] = useState('');
  const [editMarkerLng, setEditMarkerLng] = useState('');
  
  // Multi-map state
  const [maps, setMaps] = useState<{id: string, title: string, markers: Marker[], isActive: boolean}[]>([]);
  const [activeMapId, setActiveMapId] = useState<string | null>(null);
  
  // Drag and drop state
  const [draggedPinType, setDraggedPinType] = useState<{
    type: string;
    zoneNumber?: number;
    deviceIcon?: string;
    assetIcon?: string;
  } | null>(null);

  // Get current team - memoize to prevent unnecessary re-renders
  const currentTeam = useMemo(() => getCurrentTeam(), []);

  // Keep refs in sync with state
  useEffect(() => {
    mapIdRef.current = mapId;
  }, [mapId]);


  useEffect(() => {
    if (map.current) return; // initialize map only once
    
    // Get token from environment variable
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    
    
    if (!token) {
      console.error('Mapbox access token is required. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN');
      return;
    }

    mapboxgl.accessToken = token;

    if (mapContainer.current) {
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/nginear/clkd3dq69005u01qk6q7a6z7r', // Custom satellite style from v1
          center: [-98.5795, 39.8283], // Center of United States
          zoom: 4.2,
        });


        // Update zoom display
        const updateZoom = () => {
          if (map.current) {
            setZoom(Math.round(map.current.getZoom() * 10) / 10);
          }
        };

        map.current.on('zoom', updateZoom);
        
        map.current.on('load', () => {
          updateZoom();
          loadTeamData();
          initializeSearchBox();
          
          // Force resize after a short delay
          setTimeout(() => {
            if (map.current) {
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
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load all team maps from API
  const loadTeamData = async () => {
    if (!currentTeam) return;

    try {
      const response = await fetch(`/api/maps?team=${currentTeam.name}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.maps && data.maps.length > 0) {
          // Set up maps with first one as active
          const mapsWithActiveState = data.maps.map((map: {id: string, title: string, markers: Marker[]}, index: number) => ({
            id: map.id,
            title: map.title && !map.title.includes('Team Map') ? map.title : 'Untitled Map',
            markers: map.markers || [],
            isActive: index === 0 // First map is active
          }));
          
          setMaps(mapsWithActiveState);
          const activeMap = mapsWithActiveState[0];
          setActiveMapId(activeMap.id);
          setMapId(activeMap.id);
          setMarkers(activeMap.markers);
          setMapTitle(activeMap.title);
          
          // Render existing markers on the map
          if (activeMap.markers && activeMap.markers.length > 0) {
            renderExistingMarkers(activeMap.markers);
            // Zoom to fit all markers
            setTimeout(() => {
              fitMapToMarkers(activeMap.markers);
            }, 100);
          }
        } else {
          await createDefaultMap();
        }
      } else {
        console.error('Failed to load team maps:', response.status);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
    }
  };

  // Create default map for team
  const createDefaultMap = async () => {
    if (!currentTeam) return;

    try {
      const response = await fetch('/api/maps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: currentTeam.name,
          title: 'Untitled Map',
          centerLat: 39.8283,
          centerLng: -98.5795,
          zoom: 4.2,
          style: 'mapbox://styles/nginear/clkd3dq69005u01qk6q7a6z7r'
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const newMap = {
          id: data.map.id,
          title: 'Untitled Map',
          markers: [],
          isActive: true
        };
        setMaps([newMap]);
        setActiveMapId(newMap.id);
        setMapId(newMap.id);
        setMarkers([]);
        setMapTitle('Untitled Map');
      } else {
        console.error('Failed to create default map:', response.status);
      }
    } catch (error) {
      console.error('Error creating default map:', error);
    }
  };

  // Fit map to show all markers with padding
  const fitMapToMarkers = (markers: Marker[]) => {
    if (!map.current || markers.length === 0) return;
    
    if (markers.length === 1) {
      // For single marker, center on it with a reasonable zoom
      const marker = markers[0];
      map.current.flyTo({
        center: [marker.lng, marker.lat],
        zoom: 14,
        speed: 1.5
      });
      return;
    }
    
    // Calculate bounds for multiple markers
    let minLng = markers[0].lng;
    let maxLng = markers[0].lng;
    let minLat = markers[0].lat;
    let maxLat = markers[0].lat;
    
    markers.forEach(marker => {
      minLng = Math.min(minLng, marker.lng);
      maxLng = Math.max(maxLng, marker.lng);
      minLat = Math.min(minLat, marker.lat);
      maxLat = Math.max(maxLat, marker.lat);
    });
    
    // Create bounds with padding
    const bounds = new mapboxgl.LngLatBounds([minLng, minLat], [maxLng, maxLat]);
    
    map.current.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      speed: 1.5,
      maxZoom: 16 // Don't zoom too close even for nearby markers
    });
  };

  // Render existing markers on the map (for page refresh)
  const renderExistingMarkers = (markers: Marker[]) => {
    if (!map.current) return;
    
    markers.forEach(marker => {
      // Create custom marker element based on type
      const el = document.createElement('div');
      el.className = `custom-marker ${marker.type}`;
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
      if (marker.type === 'search') {
        // Search result pin - use location_on icon like v1
        el.style.backgroundColor = 'rgb(243, 243, 243)';
        el.style.borderColor = 'hsl(214.3 31.8% 91.4%)';
        el.innerHTML = '<span class="material-icons" style="font-size: 20px; color: hsl(222.2 84% 4.9%);">location_on</span>';
      } else if (marker.type === 'location') {
        el.style.backgroundColor = 'hsl(222.2 84% 4.9%)';
        el.style.borderColor = 'hsl(214.3 31.8% 91.4%)';
        el.style.color = 'hsl(210 40% 98%)';
        el.textContent = marker.zoneNumber?.toString() || 'L';
      } else if (marker.type === 'device') {
        el.style.backgroundColor = 'rgb(243, 243, 243)';
        el.style.borderColor = 'hsl(214.3 31.8% 91.4%)';
        const icon = marker.deviceIcon || 'memory';
        
        if (icon === 'solar-panel') {
          el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: hsl(222.2 84% 4.9%);">
            <path d="M4,2H20A2,2 0 0,1 22,4V14A2,2 0 0,1 20,16H15V20H18V22H13V16H11V22H6V20H9V16H4A2,2 0 0,1 2,14V4A2,2 0 0,1 4,2M4,4V8H11V4H4M4,14H11V10H4V14M20,14V10H13V14H20M20,4H13V8H20V4Z" />
          </svg>`;
        } else {
          el.innerHTML = `<span class="material-icons" style="font-size: 16px; color: hsl(222.2 84% 4.9%);">${icon}</span>`;
        }
      } else if (marker.type === 'assets') {
        el.style.backgroundColor = 'rgb(243, 243, 243)';
        el.style.borderColor = 'hsl(214.3 31.8% 91.4%)';
        const icon = marker.assetIcon || 'build';
        el.innerHTML = `<span class="material-icons" style="font-size: 16px; color: hsl(222.2 84% 4.9%);">${icon}</span>`;
      }
      
      // Create popup with nice styling
      const popup = new mapboxgl.Popup({ 
        offset: [25, 0],
        anchor: 'left',
        closeButton: false,
        closeOnClick: false
      }).setHTML(`<div style="
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${marker.label}</div>`);
      
      // Add marker to map with popup
      const mapboxMarker = new mapboxgl.Marker({ element: el, draggable: !marker.locked })
        .setLngLat([marker.lng, marker.lat])
        .setPopup(popup)
        .addTo(map.current!);
        
      // Show popup immediately if labels are visible
      if (labelsVisible) {
        popup.addTo(map.current!);
      }
      
      // Add drag end event to update position in database
      mapboxMarker.on('dragend', async () => {
        const lngLat = mapboxMarker.getLngLat();
        try {
          const response = await fetch(`/api/markers/${marker.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lat: lngLat.lat,
              lng: lngLat.lng,
            }),
          });
          
          if (response.ok) {
            // Update local state
            setMarkers(prev => prev.map(m => 
              m.id === marker.id 
                ? { ...m, lat: lngLat.lat, lng: lngLat.lng }
                : m
            ));
            
            // Update maps state
            setMaps(prev => prev.map(m => 
              m.isActive 
                ? { 
                    ...m, 
                    markers: m.markers.map(mapMarker => 
                      mapMarker.id === marker.id 
                        ? { ...mapMarker, lat: lngLat.lat, lng: lngLat.lng }
                        : mapMarker
                    )
                  }
                : m
            ));
            
            // Update edit form if this marker is being edited
            if (editingMarker && editingMarker.id === marker.id) {
              setEditMarkerLat(lngLat.lat.toString());
              setEditMarkerLng(lngLat.lng.toString());
            }
          } else {
            console.error('Failed to update marker position:', response.status);
          }
        } catch (error) {
          console.error('Error updating marker position:', error);
        }
      });
      
      markersRef.current[marker.id] = mapboxMarker;
    });
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

  // Fit all markers (like page refresh does)
  const fitAllMarkers = () => {
    if (markers.length > 0) {
      fitMapToMarkers(markers);
    }
  };


  // Handle geocoding search using Mapbox Geocoding API
  const handleGeocodingSearch = async (query: string) => {
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
        
        if (map.current) {
          map.current.flyTo({ 
            center: [lng, lat], 
            zoom: 16,
            speed: 2.0
          });
        }
        
        await addMarkerToMap(lng, lat, placeName, 'search', undefined, undefined, undefined);
      } else {
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
        if (map.current) {
          map.current.flyTo({ 
            center: [lng, lat], 
            zoom: 16,
            speed: 2.0
          });
        }
        
        const label = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        addMarkerToMap(lng, lat, label, 'search', undefined, undefined, undefined);
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

  // Center map on a specific marker
  const centerOnMarker = (marker: Marker) => {
    if (map.current) {
      map.current.flyTo({
        center: [marker.lng, marker.lat],
        zoom: 16,
        speed: 2.0
      });
    }
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
      } catch (error) {
        console.error('Error clearing markers:', error);
        alert('Error clearing markers. Please try again.');
      }
    }
  };

  // Delete a map
  const deleteMap = async (mapId: string) => {
    const mapToDelete = maps.find(m => m.id === mapId);
    if (!mapToDelete) return;

    const confirmDelete = confirm(
      `Are you sure you want to delete "${mapToDelete.title}"?\n\n` +
      `This will permanently remove the map and all ${mapToDelete.markers.length} marker(s).\n\n` +
      'This action cannot be undone.'
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/maps/${mapId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from maps state
        const remainingMaps = maps.filter(m => m.id !== mapId);
        setMaps(remainingMaps);

        // If we deleted the active map, switch to another or create new
        if (mapToDelete.isActive) {
          if (remainingMaps.length > 0) {
            // Switch to first remaining map
            const newActiveMap = remainingMaps[0];
            setMaps(prev => prev.map(m => ({
              ...m,
              isActive: m.id === newActiveMap.id
            })));
            setActiveMapId(newActiveMap.id);
            setMapId(newActiveMap.id);
            setMarkers(newActiveMap.markers);
            setMapTitle(newActiveMap.title);

            // Clear and render new markers
            Object.values(markersRef.current).forEach(marker => marker.remove());
            markersRef.current = {};
            if (newActiveMap.markers.length > 0) {
              renderExistingMarkers(newActiveMap.markers);
              setTimeout(() => fitMapToMarkers(newActiveMap.markers), 100);
            }
          } else {
            // No maps left, create a new default one
            await createDefaultMap();
          }
        }
      } else {
        console.error('Failed to delete map:', response.status);
        alert('Failed to delete map. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting map:', error);
      alert('Error deleting map. Please try again.');
    }
  };

  // Switch to a different map
  const switchToMap = async (targetMapId: string) => {
    if (targetMapId === activeMapId) return; // Already active

    try {
      // Find the target map
      const targetMap = maps.find(m => m.id === targetMapId);
      if (!targetMap) return;

      // Clear current visual markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};

      // Update active states
      setMaps(prev => prev.map(m => ({
        ...m,
        isActive: m.id === targetMapId
      })));

      // Switch to new map
      setActiveMapId(targetMapId);
      setMapId(targetMapId);
      setMarkers(targetMap.markers);
      setMapTitle(targetMap.title);

      // Render new map's markers
      if (targetMap.markers && targetMap.markers.length > 0) {
        renderExistingMarkers(targetMap.markers);
        setTimeout(() => {
          fitMapToMarkers(targetMap.markers);
        }, 100);
      } else {
        // Reset to default view if no markers
        if (map.current) {
          map.current.flyTo({
            center: [-98.5795, 39.8283],
            zoom: 4.2,
            speed: 1.5
          });
        }
      }
    } catch (error) {
      console.error('Error switching maps:', error);
    }
  };

  // Create new map (doesn't overwrite current)
  const startNewMap = async () => {
    if (!currentTeam) return;

    try {
      const response = await fetch('/api/maps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: currentTeam.name,
          title: 'Untitled Map',
          centerLat: 39.8283,
          centerLng: -98.5795,
          zoom: 4.2,
          style: 'mapbox://styles/nginear/clkd3dq69005u01qk6q7a6z7r'
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const newMap = {
          id: data.map.id,
          title: 'Untitled Map',
          markers: [],
          isActive: true
        };
        
        // Add to maps list and make it active
        setMaps(prev => [
          ...prev.map(m => ({ ...m, isActive: false })), // Deactivate all others
          newMap // Add new active map
        ]);
        
        // Clear current map visual state and switch to new map
        Object.values(markersRef.current).forEach(marker => marker.remove());
        markersRef.current = {};
        setActiveMapId(newMap.id);
        setMapId(newMap.id);
        setMarkers([]);
        setMapTitle('Untitled Map');
        
        if (map.current) {
          map.current.flyTo({
            center: [-98.5795, 39.8283],
            zoom: 4.2,
            speed: 1.5
          });
        }
      } else {
        console.error('Failed to create new map:', response.status);
        alert('Failed to create new map. Please try again.');
      }
    } catch (error) {
      console.error('Error creating new map:', error);
      alert('Error creating new map. Please try again.');
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
        
        // Update maps state
        setMaps(prev => prev.map(m => 
          m.isActive 
            ? { ...m, markers: m.markers.filter(marker => marker.id !== markerId) }
            : m
        ));
        
        // Remove visual marker from map
        if (markersRef.current[markerId]) {
          markersRef.current[markerId].remove();
          delete markersRef.current[markerId];
        }
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
    setEditTitleValue(mapTitle);
    setIsEditTitleModalOpen(true);
  };

  // Save map title
  const saveMapTitle = async () => {
    if (editTitleValue.trim() !== '' && mapId) {
      const newTitle = editTitleValue.trim();
      
      try {
        // Update in database
        const response = await fetch(`/api/maps/${mapId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: newTitle,
          }),
        });

        if (response.ok) {
          // Update local state
          setMapTitle(newTitle);
          
          // Update maps array
          setMaps(prev => prev.map(m => 
            m.isActive ? { ...m, title: newTitle } : m
          ));
          
          setIsEditTitleModalOpen(false);
        } else {
          console.error('Failed to update map title:', response.status);
          alert('Failed to update map title. Please try again.');
        }
      } catch (error) {
        console.error('Error updating map title:', error);
        alert('Error updating map title. Please try again.');
      }
    }
  };

  // Edit marker
  const editMarker = (marker: Marker) => {
    setEditingMarker(marker);
    setEditMarkerName(marker.label);
    setEditMarkerLat(marker.lat.toString());
    setEditMarkerLng(marker.lng.toString());
    setIsEditMarkerModalOpen(true);
  };

  // Save marker changes
  const saveMarkerEdit = async () => {
    if (!editingMarker || !editMarkerName.trim()) return;
    
    const lat = parseFloat(editMarkerLat);
    const lng = parseFloat(editMarkerLng);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Please enter valid coordinates (lat: -90 to 90, lng: -180 to 180)');
      return;
    }

    try {
      // Update in database
      const response = await fetch(`/api/markers/${editingMarker.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: editMarkerName.trim(),
          lat,
          lng,
        }),
      });

      if (response.ok) {
        // Update local state
        setMarkers(prev => prev.map(m => 
          m.id === editingMarker.id 
            ? { ...m, label: editMarkerName.trim(), lat, lng }
            : m
        ));
        
        // Update maps state
        setMaps(prev => prev.map(m => 
          m.isActive 
            ? { 
                ...m, 
                markers: m.markers.map(marker => 
                  marker.id === editingMarker.id 
                    ? { ...marker, label: editMarkerName.trim(), lat, lng }
                    : marker
                )
              }
            : m
        ));
        
        // Update visual marker position
        const mapboxMarker = markersRef.current[editingMarker.id];
        if (mapboxMarker) {
          mapboxMarker.setLngLat([lng, lat]);
          // Update popup content
          const popup = mapboxMarker.getPopup();
          if (popup) {
            popup.setHTML(`<div style="
              background: rgba(0, 0, 0, 0.8);
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
              white-space: nowrap;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">${editMarkerName.trim()}</div>`);
          }
        }
        
        setIsEditMarkerModalOpen(false);
        setEditingMarker(null);
      } else {
        console.error('Failed to update marker:', response.status);
        alert('Failed to update marker. Please try again.');
      }
    } catch (error) {
      console.error('Error updating marker:', error);
      alert('Error updating marker. Please try again.');
    }
  };

  // Add marker to map and database
  const addMarkerToMap = useCallback(async (lng: number, lat: number, label: string, type: string, zoneNumber?: number, deviceIcon?: string, assetIcon?: string) => {
    const currentMapId = mapIdRef.current;
    
    if (!currentMapId) {
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
          mapId: currentMapId,
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
        
        // Update maps state
        setMaps(prev => prev.map(m => 
          m.isActive ? { ...m, markers: [...m.markers, marker] } : m
        ));
        
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
        if (type === 'search') {
          // Search result pin - use location_on icon like v1
          el.style.backgroundColor = 'rgb(243, 243, 243)';
          el.style.borderColor = 'hsl(214.3 31.8% 91.4%)';
          el.innerHTML = '<span class="material-icons" style="font-size: 20px; color: hsl(222.2 84% 4.9%);">location_on</span>';
        } else if (type === 'location') {
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
        
        // Create popup with nice styling
        const popup = new mapboxgl.Popup({ 
          offset: [25, 0],
          anchor: 'left',
          closeButton: false,
          closeOnClick: false
        }).setHTML(`<div style="
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">${label}</div>`);
        
        // Add marker to map with popup
        const mapboxMarker = new mapboxgl.Marker({ element: el, draggable: true })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map.current);
          
        // Show popup immediately if labels are visible
        if (labelsVisible) {
          popup.addTo(map.current!);
        }
        
        // Add drag end event to update position in database
        mapboxMarker.on('dragend', async () => {
          const lngLat = mapboxMarker.getLngLat();
          try {
            const response = await fetch(`/api/markers/${marker.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                lat: lngLat.lat,
                lng: lngLat.lng,
              }),
            });
            
            if (response.ok) {
              // Update local state
              setMarkers(prev => prev.map(m => 
                m.id === marker.id 
                  ? { ...m, lat: lngLat.lat, lng: lngLat.lng }
                  : m
              ));
              
              // Update maps state
              setMaps(prev => prev.map(m => 
                m.isActive 
                  ? { 
                      ...m, 
                      markers: m.markers.map(mapMarker => 
                        mapMarker.id === marker.id 
                          ? { ...mapMarker, lat: lngLat.lat, lng: lngLat.lng }
                          : mapMarker
                      )
                    }
                  : m
              ));
              
              // Update edit form if this marker is being edited
              if (editingMarker && editingMarker.id === marker.id) {
                setEditMarkerLat(lngLat.lat.toString());
                setEditMarkerLng(lngLat.lng.toString());
              }
            } else {
              console.error('Failed to update marker position:', response.status);
            }
          } catch (error) {
            console.error('Error updating marker position:', error);
          }
        });
        
        markersRef.current[marker.id] = mapboxMarker;
      }
    } catch (error) {
      console.error('Error adding marker:', error);
    }
  }, []);

  return (
    <div className="relative h-screen">
      {/* Left Sidebar */}
      <div className="fixed top-0 left-0 h-screen w-[280px] bg-white border-r border-border z-[1000] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="px-2 py-3 border-b border-border">
          <h1 className="text-lg font-semibold text-foreground">{teamName.split(' ')[0]}</h1>
        </div>

        {/* Search */}
        <div className="px-2 py-3 border-b border-border">
          <div 
            id="search-box"
            className="w-full"
          />
        </div>

        {/* Maps/Files Section */}
        <div className="flex-1 px-1 py-3">
          {/* Maps Header */}
          <div className="flex items-center justify-between mb-3 px-2">
            <h4 className="text-xs font-medium text-muted-foreground">MAPS</h4>
            <button 
              className="h-4 w-4 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={startNewMap}
              title="Add new map"
            >
              <span className="material-icons" style={{fontSize: '12px'}}>add</span>
            </button>
          </div>
          <div className="space-y-2">
            {maps.map((mapItem) => (
              <div key={mapItem.id} className="space-y-1">
                {/* Map Header */}
                <div className="group flex items-center justify-between px-2 py-1 hover:bg-muted rounded-md transition-colors">
                  <div className="flex items-center flex-1 min-w-0">
                    <button 
                      className="mr-2 p-0.5 hover:bg-muted-foreground/10 rounded"
                      title={mapItem.isActive ? "Collapse markers" : "Switch to this map"}
                      onClick={() => mapItem.isActive ? null : switchToMap(mapItem.id)}
                    >
                      <span className="material-icons text-muted-foreground" style={{fontSize: '12px'}}>
                        {mapItem.isActive ? 'expand_more' : 'chevron_right'}
                      </span>
                    </button>
                    <span className="material-icons mr-2 text-muted-foreground" style={{fontSize: '16px'}}>
                      map
                    </span>
                    <span 
                      className={`text-sm cursor-pointer hover:text-primary transition-colors truncate ${
                        mapItem.isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                      }`}
                      onClick={() => mapItem.isActive ? editMapTitle() : switchToMap(mapItem.id)}
                      title={mapItem.isActive ? "Click to edit map name" : "Click to switch to this map"}
                    >
                      {mapItem.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">{mapItem.markers.length}</span>
                    {maps.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        title="Delete map"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMap(mapItem.id);
                        }}
                      >
                        <span className="material-icons" style={{fontSize: '14px'}}>delete</span>
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Markers as children - only show for active map */}
                {mapItem.isActive && (
                  <div className="ml-4 space-y-0.5">
                    {mapItem.markers.length === 0 ? (
                      <div className="text-xs text-muted-foreground py-2 pl-4">No markers placed</div>
                    ) : (
                      mapItem.markers.map((marker) => (
                        <div key={marker.id} className="group flex items-center justify-between px-2 py-1 hover:bg-muted rounded-md transition-colors">
                          <div className="flex items-center flex-1 min-w-0">
                            <span className="material-icons mr-2 text-muted-foreground" style={{fontSize: '14px'}}>
                              {marker.type === 'search' ? 'place' : 
                               marker.type === 'location' ? 'location_on' :
                               marker.type === 'device' ? 'memory' : 'build'}
                            </span>
                            <span 
                              className="text-xs text-foreground cursor-pointer hover:text-primary transition-colors truncate"
                              title="Click to center on marker"
                              onClick={() => centerOnMarker(marker)}
                            >
                              {marker.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              title={marker.locked ? 'Unlock marker' : 'Lock marker'}
                            >
                              <span className="material-icons" style={{fontSize: '12px'}}>
                                {marker.locked ? 'lock' : 'lock_open'}
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              title="Edit marker"
                              onClick={() => editMarker(marker)}
                            >
                              <span className="material-icons" style={{fontSize: '12px'}}>edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              title="Delete marker"
                              onClick={() => deleteMarker(marker.id)}
                            >
                              <span className="material-icons" style={{fontSize: '12px'}}>delete</span>
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-2 py-3 border-t border-border space-y-0.5">
          <button 
            className="w-full flex items-center px-2 py-2 text-muted-foreground hover:bg-muted rounded-md transition-colors"
            style={{fontSize: '0.75rem', fontWeight: '500'}}
            title="Screenshot mode"
          >
            <span className="material-icons mr-3" style={{fontSize: '14px'}}>photo_camera</span>
            Screenshot Mode
          </button>
          <button 
            className="w-full flex items-center px-2 py-2 text-muted-foreground hover:bg-muted rounded-md transition-colors"
            style={{fontSize: '0.75rem', fontWeight: '500'}}
            title="Settings"
          >
            <span className="material-icons mr-3" style={{fontSize: '14px'}}>settings</span>
            Settings
          </button>
          <button 
            className="w-full flex items-center px-2 py-2 text-muted-foreground hover:bg-muted rounded-md transition-colors"
            style={{fontSize: '0.75rem', fontWeight: '500'}}
            title="Help & Tutorial"
            onClick={() => window.open('https://masen.craft.me/scout-help', '_blank')}
          >
            <span className="material-icons mr-3" style={{fontSize: '14px'}}>help</span>
            Help
          </button>
          <button 
            className="w-full flex items-center px-2 py-2 text-muted-foreground hover:bg-muted rounded-md transition-colors"
            style={{fontSize: '0.75rem', fontWeight: '500'}}
            title="Recently deleted maps"
          >
            <span className="material-icons mr-3" style={{fontSize: '14px'}}>delete</span>
            Recently Deleted
          </button>
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
          onClick={() => {
            const newLabelsVisible = !labelsVisible;
            setLabelsVisible(newLabelsVisible);
            
            // Toggle popups for all current markers
            Object.values(markersRef.current).forEach(marker => {
              const popup = marker.getPopup();
              if (popup) {
                if (newLabelsVisible) {
                  popup.addTo(map.current!);
                } else {
                  popup.remove();
                }
              }
            });
          }}
        >
          Labels
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs px-3 py-1 h-auto"
          disabled={markers.length === 0}
          onClick={fitAllMarkers}
        >
          Fit All
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
              <span className="material-icons" style={{fontSize: '16px'}}>memory</span>
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
              <span className="material-icons" style={{fontSize: '16px'}}>wifi</span>
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
              <span className="material-icons" style={{fontSize: '16px'}}>build</span>
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
              <span className="material-icons" style={{fontSize: '16px'}}>lan</span>
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
              <span className="material-icons" style={{fontSize: '16px'}}>warning</span>
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
              <span className="material-icons" style={{fontSize: '16px'}}>power</span>
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

      {/* Edit Map Title Modal */}
      <Dialog open={isEditTitleModalOpen} onOpenChange={setIsEditTitleModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Map Title</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="map-title" className="text-right">
                Title
              </Label>
              <Input
                id="map-title"
                value={editTitleValue}
                onChange={(e) => setEditTitleValue(e.target.value)}
                className="col-span-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveMapTitle();
                  } else if (e.key === 'Escape') {
                    setIsEditTitleModalOpen(false);
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTitleModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveMapTitle}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Marker Modal */}
      <Dialog open={isEditMarkerModalOpen} onOpenChange={setIsEditMarkerModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Marker</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="marker-name" className="text-right">
                Name
              </Label>
              <Input
                id="marker-name"
                value={editMarkerName}
                onChange={(e) => setEditMarkerName(e.target.value)}
                className="col-span-3"
                placeholder="Enter marker name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveMarkerEdit();
                  } else if (e.key === 'Escape') {
                    setIsEditMarkerModalOpen(false);
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="marker-lat" className="text-right">
                Latitude
              </Label>
              <Input
                id="marker-lat"
                value={editMarkerLat}
                onChange={(e) => setEditMarkerLat(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 40.7128"
                type="number"
                step="any"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveMarkerEdit();
                  } else if (e.key === 'Escape') {
                    setIsEditMarkerModalOpen(false);
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="marker-lng" className="text-right">
                Longitude
              </Label>
              <Input
                id="marker-lng"
                value={editMarkerLng}
                onChange={(e) => setEditMarkerLng(e.target.value)}
                className="col-span-3"
                placeholder="e.g., -74.0060"
                type="number"
                step="any"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveMarkerEdit();
                  } else if (e.key === 'Escape') {
                    setIsEditMarkerModalOpen(false);
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMarkerModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveMarkerEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}