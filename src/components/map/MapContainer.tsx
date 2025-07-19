'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MarkerControls from './MarkerControls';
import { getCurrentTeam } from '@/lib/auth';

interface Marker {
  id: string;
  label: string;
  lat: number;
  lng: number;
  type: string;
}

interface MapContainerProps {
  className?: string;
}

export default function MapContainer({ className }: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [mapId, setMapId] = useState<string | null>(null);
  const [isPlacementMode, setIsPlacementMode] = useState(false);
  const [pendingMarkerLabel, setPendingMarkerLabel] = useState('');
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
        center: [-74.5, 40], // starting position [lng, lat]
        zoom: 9, // starting zoom
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Load team's maps and markers when map is ready
      map.current.on('load', loadTeamData);

      // Add click handler for marker placement
      map.current.on('click', handleMapClick);
    }
  }, []);

  // Handle map clicks for marker placement
  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    if (!isPlacementMode || !pendingMarkerLabel) return;

    const { lng, lat } = e.lngLat;
    
    // Place the marker
    handleAddMarkerAtLocation({
      label: pendingMarkerLabel,
      lat,
      lng,
      type: 'location'
    });

    // Exit placement mode
    setIsPlacementMode(false);
    setPendingMarkerLabel('');
  };

  // Load team data from API
  const loadTeamData = async () => {
    if (!currentTeam) return;

    try {
      const response = await fetch(`/api/maps?team=${currentTeam.name}`);
      if (response.ok) {
        const data = await response.json();
        if (data.maps && data.maps.length > 0) {
          const defaultMap = data.maps[0]; // Use first map for now
          setMapId(defaultMap.id);
          setMarkers(defaultMap.markers || []);
        } else {
          // Create default map if none exists
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
          title: `${currentTeam.displayName} Map`,
          centerLat: 40.0,
          centerLng: -74.5,
          zoom: 9.0,
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

  // Add marker at specific location to map and database
  const handleAddMarkerAtLocation = async (newMarker: { label: string; lat: number; lng: number; type: string }) => {
    if (!mapId) return;

    try {
      const response = await fetch('/api/markers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mapId,
          ...newMarker
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const marker = data.marker;
        setMarkers(prev => [...prev, marker]);
        
        // Add visual marker to map
        if (map.current) {
          const mapboxMarker = new mapboxgl.Marker()
            .setLngLat([marker.lng, marker.lat])
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>${marker.label}</h3>`))
            .addTo(map.current);
          
          markersRef.current[marker.id] = mapboxMarker;
        }
      }
    } catch (error) {
      console.error('Error adding marker:', error);
    }
  };

  // Delete marker from map and database
  const handleDeleteMarker = async (markerId: string) => {
    try {
      const response = await fetch(`/api/markers/${markerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMarkers(prev => prev.filter(m => m.id !== markerId));
        
        // Remove visual marker from map
        if (markersRef.current[markerId]) {
          markersRef.current[markerId].remove();
          delete markersRef.current[markerId];
        }
      }
    } catch (error) {
      console.error('Error deleting marker:', error);
    }
  };

  // Update visual markers when markers array changes
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add current markers
    markers.forEach(marker => {
      const mapboxMarker = new mapboxgl.Marker()
        .setLngLat([marker.lng, marker.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${marker.label}</h3>`))
        .addTo(map.current!);
      
      markersRef.current[marker.id] = mapboxMarker;
    });
  }, [markers]);

  // Toggle placement mode
  const handleTogglePlacementMode = () => {
    setIsPlacementMode(!isPlacementMode);
    if (!isPlacementMode) {
      // Entering placement mode - we'll get the label from MarkerControls
    } else {
      // Exiting placement mode
      setPendingMarkerLabel('');
    }
  };

  // Update map cursor style based on placement mode
  useEffect(() => {
    if (map.current) {
      const canvas = map.current.getCanvas();
      canvas.style.cursor = isPlacementMode ? 'crosshair' : '';
    }
  }, [isPlacementMode]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainer} 
        className={`w-full h-full ${className}`}
      />
      {currentTeam && (
        <MarkerControls
          markers={markers}
          onStartPlacement={(label) => {
            setPendingMarkerLabel(label);
            setIsPlacementMode(true);
          }}
          onDeleteMarker={handleDeleteMarker}
          teamName={currentTeam.displayName}
          isPlacementMode={isPlacementMode}
          onTogglePlacementMode={handleTogglePlacementMode}
        />
      )}
    </div>
  );
}