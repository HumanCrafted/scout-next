'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function MapContainer({ teamName, onLogout }: MapContainerProps) {
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

  // Get current team
  const currentTeam = getCurrentTeam();

  useEffect(() => {
    if (map.current) return; // initialize map only once
    
    // Get token from environment variable
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    
    if (!token) {
      console.error('Mapbox access token is required');
      return;
    }

    mapboxgl.accessToken = token;

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
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
      });
    }
  }, []);

  // Load team data from API
  const loadTeamData = async () => {
    if (!currentTeam) return;

    try {
      const response = await fetch(`/api/maps?team=${currentTeam.name}`);
      if (response.ok) {
        const data = await response.json();
        if (data.maps && data.maps.length > 0) {
          const defaultMap = data.maps[0];
          setMapId(defaultMap.id);
          setMarkers(defaultMap.markers || []);
          if (defaultMap.title) {
            setMapTitle(defaultMap.title);
          }
        } else {
          await createDefaultMap();
        }
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
          title: mapTitle,
          centerLat: 39.8283,
          centerLng: -98.5795,
          zoom: 4.2,
          style: 'mapbox://styles/mapbox/satellite-streets-v12'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMapId(data.map.id);
        setMarkers(data.map.markers || []);
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
      ? 'mapbox://styles/mapbox/satellite-streets-v12'
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

  // Clear all markers
  const clearMarkers = () => {
    if (markers.length === 0) return;
    
    const confirmClear = confirm(
      `You have ${markers.length} marker(s) currently placed.\n\n` +
      'Clearing will permanently remove all markers and groups.\n\n' +
      'Do you want to continue?'
    );
    
    if (confirmClear) {
      // Remove visual markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      setMarkers([]);
      
      // TODO: Delete from database
      console.log('All markers cleared');
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

  // Edit map title
  const editMapTitle = () => {
    const newTitle = prompt('Enter map title:', mapTitle);
    if (newTitle && newTitle.trim() !== '') {
      setMapTitle(newTitle.trim());
      // TODO: Save to database
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
            <Input
              placeholder="Search for address or coordinates..."
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
        className="absolute top-0 bottom-0 left-[280px] right-0 w-[calc(100%-280px)]"
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
                className="w-8 h-8 bg-foreground border-2 border-border rounded-full cursor-grab flex items-center justify-center text-white text-xs font-bold transition-all hover:bg-foreground/80 hover:scale-105"
                draggable={true}
                title={`Location ${num}`}
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
              className="w-8 h-8 bg-muted border-2 border-border rounded-full cursor-grab flex items-center justify-center text-foreground transition-all hover:bg-muted/80 hover:scale-105"
              draggable={true}
              title="Memory Device"
            >
              <span className="material-icons text-base">memory</span>
            </div>
            <div
              className="w-8 h-8 bg-muted border-2 border-border rounded-full cursor-grab flex items-center justify-center text-foreground transition-all hover:bg-muted/80 hover:scale-105"
              draggable={true}
              title="WiFi Device"
            >
              <span className="material-icons text-base">wifi</span>
            </div>
            <div
              className="w-8 h-8 bg-muted border-2 border-border rounded-full cursor-grab flex items-center justify-center text-foreground transition-all hover:bg-muted/80 hover:scale-105"
              draggable={true}
              title="Solar Panel"
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
              className="w-8 h-8 bg-muted border-2 border-border rounded-full cursor-grab flex items-center justify-center text-foreground transition-all hover:bg-muted/80 hover:scale-105"
              draggable={true}
              title="Build Tool"
            >
              <span className="material-icons text-base">build</span>
            </div>
            <div
              className="w-8 h-8 bg-muted border-2 border-border rounded-full cursor-grab flex items-center justify-center text-foreground transition-all hover:bg-muted/80 hover:scale-105"
              draggable={true}
              title="Network"
            >
              <span className="material-icons text-base">lan</span>
            </div>
            <div
              className="w-8 h-8 bg-muted border-2 border-border rounded-full cursor-grab flex items-center justify-center text-foreground transition-all hover:bg-muted/80 hover:scale-105"
              draggable={true}
              title="Warning"
            >
              <span className="material-icons text-base">warning</span>
            </div>
            <div
              className="w-8 h-8 bg-muted border-2 border-border rounded-full cursor-grab flex items-center justify-center text-foreground transition-all hover:bg-muted/80 hover:scale-105"
              draggable={true}
              title="Power"
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