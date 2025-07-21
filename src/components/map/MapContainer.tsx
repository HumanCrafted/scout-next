'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getCurrentTeam } from '@/lib/auth';


interface Marker {
  id: string;
  label: string;
  lat: number;
  lng: number;
  type: string;
  categoryId?: string | null;
  categoryIconId?: string | null;
  category?: MarkerCategory | null;
  categoryIcon?: CategoryIcon | null;
  zoneNumber?: number;
  deviceIcon?: string;
  assetIcon?: string;
  locked?: boolean;
  parentId?: string | null;
  position?: number | null;
  childPosition?: number | null;
  children?: Marker[];
}

interface CategoryIcon {
  id: string;
  name: string;
  icon: string;
  backgroundColor: string;
  isNumbered: boolean;
  displayOrder: number;
}

interface MarkerCategory {
  id: string;
  name: string;
  displayOrder: number;
  isVisible: boolean;
  icons?: CategoryIcon[];
}

interface MapContainerProps {
  teamName: string;
  onLogout: () => void;
  onOpenSettings?: () => void;
}

export default function MapContainer({ teamName, onLogout, onOpenSettings }: MapContainerProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [markerCategories, setMarkerCategories] = useState<MarkerCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [mapId, setMapId] = useState<string | null>(null);
  const [mapTitle, setMapTitle] = useState('Untitled Map');
  const [zoom, setZoom] = useState(4.2);
  const [currentStyle, setCurrentStyle] = useState<'satellite' | 'street'>('satellite');
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [screenshotMode, setScreenshotMode] = useState(false);
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

  // Alert and confirmation dialog state
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: 'error' | 'success' | 'warning';
  }>({ isOpen: false, title: '', description: '', type: 'error' });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({ isOpen: false, title: '', description: '', onConfirm: () => {}, confirmText: 'Confirm', cancelText: 'Cancel' });
  
  // Multi-map state
  const [maps, setMaps] = useState<{id: string, title: string, markers: Marker[], isActive: boolean}[]>([]);
  const [activeMapId, setActiveMapId] = useState<string | null>(null);
  
  // Drag and drop state
  const [draggedPinType, setDraggedPinType] = useState<{
    categoryId: string;
    categoryIconId: string;
    categoryName: string;
    iconName: string;
    icon: string;
    zoneNumber?: number; // For numbered icons (1-10)
  } | null>(null);
  
  // Marker grouping state
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [draggedMarkerId, setDraggedMarkerId] = useState<string | null>(null);
  const [dragOverMarkerId, setDragOverMarkerId] = useState<string | null>(null);
  const [dragInsertPosition, setDragInsertPosition] = useState<{markerId: string, position: 'before' | 'after'} | null>(null);
  const [dragOperation, setDragOperation] = useState<'reorder' | 'group' | null>(null);

  // Get current team - memoize to prevent unnecessary re-renders
  const currentTeam = useMemo(() => getCurrentTeam(), []);
  const teamSlug = currentTeam?.name || 'masen'; // Fallback to masen for now

  // Helper functions for dialogs
  const showAlert = (title: string, description: string, type: 'error' | 'success' | 'warning' = 'error') => {
    setAlertDialog({ isOpen: true, title, description, type });
  };

  const showConfirm = (
    title: string, 
    description: string, 
    onConfirm: () => void,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    setConfirmDialog({ 
      isOpen: true, 
      title, 
      description, 
      onConfirm, 
      confirmText, 
      cancelText 
    });
  };

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
          loadMarkerCategories();
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

  // Load marker categories for the team
  const loadMarkerCategories = async () => {
    if (!teamSlug) return;

    try {
      setCategoriesLoading(true);
      const response = await fetch(`/api/teams/${teamSlug}/categories`);
      if (response.ok) {
        const data = await response.json();
        setMarkerCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error loading marker categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Get next auto-number for a category
  const getNextCategoryNumber = (categoryName: string): number => {
    const existingMarkers = markers.filter(marker => 
      marker.label.toLowerCase().startsWith(categoryName.toLowerCase())
    );
    
    let maxNumber = 0;
    existingMarkers.forEach(marker => {
      const match = marker.label.match(new RegExp(`^${categoryName}\\s+(\\d+)$`, 'i'));
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    
    return maxNumber + 1;
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
      
      // Set background color and content based on category icon
      if (marker.type === 'search') {
        // Search result pin - use location_on icon like v1
        el.style.backgroundColor = 'rgb(243, 243, 243)';
        el.style.borderColor = 'hsl(214.3 31.8% 91.4%)';
        el.innerHTML = '<span class="material-icons" style="font-size: 20px; color: hsl(222.2 84% 4.9%);">location_on</span>';
      } else if (marker.categoryIcon) {
        // Use categoryIcon data for styling
        const categoryIcon = marker.categoryIcon;
        
        const getMarkerBackgroundColor = (bgColor: string) => {
          switch (bgColor) {
            case 'dark': return { bg: 'hsl(222.2 84% 4.9%)', text: 'hsl(210 40% 98%)', border: 'hsl(214.3 31.8% 91.4%)' };
            case 'light': return { bg: 'rgb(243, 243, 243)', text: 'hsl(222.2 84% 4.9%)', border: 'hsl(214.3 31.8% 91.4%)' };
            case 'blue': return { bg: 'rgb(59, 130, 246)', text: 'white', border: 'hsl(214.3 31.8% 91.4%)' };
            case 'green': return { bg: 'rgb(16, 185, 129)', text: 'white', border: 'hsl(214.3 31.8% 91.4%)' };
            case 'red': return { bg: 'rgb(239, 68, 68)', text: 'white', border: 'hsl(214.3 31.8% 91.4%)' };
            case 'yellow': return { bg: 'rgb(245, 158, 11)', text: 'white', border: 'hsl(214.3 31.8% 91.4%)' };
            case 'purple': return { bg: 'rgb(139, 92, 246)', text: 'white', border: 'hsl(214.3 31.8% 91.4%)' };
            case 'orange': return { bg: 'rgb(249, 115, 22)', text: 'white', border: 'hsl(214.3 31.8% 91.4%)' };
            default: return { bg: 'rgb(243, 243, 243)', text: 'hsl(222.2 84% 4.9%)', border: 'hsl(214.3 31.8% 91.4%)' };
          }
        };
        
        const colors = getMarkerBackgroundColor(categoryIcon.backgroundColor);
        el.style.backgroundColor = colors.bg;
        el.style.color = colors.text;
        el.style.borderColor = colors.border;
        
        // Check if this is a numbered marker (contains number in label)
        const numberMatch = marker.label.match(/(\d+)$/);
        if (numberMatch && categoryIcon.isNumbered) {
          el.textContent = numberMatch[1];
        } else if (categoryIcon.icon === 'solar-panel') {
          el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: ${colors.text};">
            <path d="M4,2H20A2,2 0 0,1 22,4V14A2,2 0 0,1 20,16H15V20H18V22H13V16H11V22H6V20H9V16H4A2,2 0 0,1 2,14V4A2,2 0 0,1 4,2M4,4V8H11V4H4M4,14H11V10H4V14M20,14V10H13V14H20M20,4H13V8H20V4Z" />
          </svg>`;
        } else {
          el.innerHTML = `<span class="material-icons" style="font-size: 16px; color: ${colors.text};">${categoryIcon.icon}</span>`;
        }
      } else {
        // Fallback for legacy markers without categoryIcon
        if (marker.type === 'location') {
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
      }
      
      // Create popup with slot styling - marker sits inside left rounded end
      const popup = new mapboxgl.Popup({ 
        offset: [-17, 0], // Position so marker center is concentric with slot's left rounded end (slot radius = 17px)
        anchor: 'left',
        closeButton: false,
        closeOnClick: false
      }).setHTML(`<div style="
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 6px 16px 6px 42px;
        border-radius: 17px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        height: 34px;
        display: flex;
        align-items: center;
        min-width: 80px;
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
        
        await addMarkerToMap(lng, lat, placeName, 'search');
      } else {
        showAlert('No Results', 'No results found for: ' + query, 'warning');
      }
    } catch (error) {
      console.error('Geocoding search error:', error);
      showAlert('Search Failed', 'Search failed. Please try again.');
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
        addMarkerToMap(lng, lat, label, 'search');
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
    
    showConfirm(
      'Clear All Markers',
      `You have ${markers.length} marker(s) currently placed.\n\nClearing will permanently remove all markers and groups.\n\nDo you want to continue?`,
      () => performClearMarkers(),
      'Clear All',
      'Cancel'
    );
  };

  const performClearMarkers = async () => {
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
        showAlert('Error', 'Error clearing markers. Please try again.');
      }
  };

  // Delete a map
  const deleteMap = async (mapId: string) => {
    const mapToDelete = maps.find(m => m.id === mapId);
    if (!mapToDelete) return;

    showConfirm(
      'Delete Map',
      `Are you sure you want to delete "${mapToDelete.title}"?\n\nThis will permanently remove the map and all ${mapToDelete.markers.length} marker(s).\n\nThis action cannot be undone.`,
      () => performDeleteMap(mapId),
      'Delete Map',
      'Cancel'
    );
  };

  const performDeleteMap = async (mapId: string) => {
    const mapToDelete = maps.find(m => m.id === mapId);
    if (!mapToDelete) return;

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
        showAlert('Failed to Delete Map', 'Failed to delete map. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting map:', error);
      showAlert('Error', 'Error deleting map. Please try again.');
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
        showAlert('Failed to Create Map', 'Failed to create new map. Please try again.');
      }
    } catch (error) {
      console.error('Error creating new map:', error);
      showAlert('Error', 'Error creating new map. Please try again.');
    }
  };

  // Delete individual marker
  const deleteMarker = async (markerId: string) => {
    try {
      // Check if this marker has children
      const markerToDelete = markers.find(m => m.id === markerId);
      const children = getChildMarkers(markers, markerId);
      
      if (children.length > 0) {
        showConfirm(
          'Delete Parent Marker',
          `This marker has ${children.length} child marker(s).\n\nDeleting the parent will make all child markers independent.\n\nDo you want to continue?`,
          () => performDeleteMarker(markerId),
          'Delete',
          'Cancel'
        );
        return;
      }
      
      await performDeleteMarker(markerId);
    } catch (error) {
      console.error('Error in deleteMarker:', error);
      showAlert('Error', 'Error deleting marker. Please try again.');
    }
  };

  const performDeleteMarker = async (markerId: string) => {
    try {
      const markerToDelete = markers.find(m => m.id === markerId);
      const children = getChildMarkers(markers, markerId);

      const response = await fetch(`/api/markers/${markerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // If this was a parent marker, make all children independent
        if (children.length > 0) {
          for (const child of children) {
            try {
              await fetch(`/api/markers/${child.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  parentId: null,
                }),
              });
            } catch (error) {
              console.error('Error making child marker independent:', error);
            }
          }
        }

        // Remove from state
        setMarkers(prev => {
          return prev
            .filter(m => m.id !== markerId)
            .map(m => 
              // Make children independent
              m.parentId === markerId ? { ...m, parentId: null } : m
            );
        });
        
        // Update maps state
        setMaps(prev => prev.map(m => 
          m.isActive 
            ? { 
                ...m, 
                markers: m.markers
                  .filter(marker => marker.id !== markerId)
                  .map(marker => 
                    // Make children independent
                    marker.parentId === markerId ? { ...marker, parentId: null } : marker
                  )
              }
            : m
        ));
        
        // Remove visual marker from map
        if (markersRef.current[markerId]) {
          markersRef.current[markerId].remove();
          delete markersRef.current[markerId];
        }
      } else {
        console.error('Failed to delete marker:', response.status);
        showAlert('Failed to Delete Marker', 'Failed to delete marker. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting marker:', error);
      showAlert('Error', 'Error deleting marker. Please try again.');
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
          showAlert('Failed to Update Title', 'Failed to update map title. Please try again.');
        }
      } catch (error) {
        console.error('Error updating map title:', error);
        showAlert('Error', 'Error updating map title. Please try again.');
      }
    }
  };

  // Toggle marker lock state
  const toggleMarkerLock = async (markerId: string) => {
    try {
      // Find the marker in state
      const marker = markers.find(m => m.id === markerId);
      if (!marker) return;
      
      const newLockedState = !marker.locked;
      
      // Update in database
      const response = await fetch(`/api/markers/${markerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locked: newLockedState,
        }),
      });

      if (response.ok) {
        // Update local state
        setMarkers(prev => prev.map(m => 
          m.id === markerId ? { ...m, locked: newLockedState } : m
        ));
        
        // Update maps state
        setMaps(prev => prev.map(m => 
          m.isActive 
            ? { 
                ...m, 
                markers: m.markers.map(marker => 
                  marker.id === markerId 
                    ? { ...marker, locked: newLockedState }
                    : marker
                )
              }
            : m
        ));
        
        // Update draggable state on the map marker
        const mapboxMarker = markersRef.current[markerId];
        if (mapboxMarker) {
          mapboxMarker.setDraggable(!newLockedState);
        }
      } else {
        console.error('Failed to toggle marker lock:', response.status);
        showAlert('Failed to Toggle Lock', 'Failed to toggle marker lock. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling marker lock:', error);
      showAlert('Error', 'Error toggling marker lock. Please try again.');
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
      showAlert('Invalid Coordinates', 'Please enter valid coordinates (lat: -90 to 90, lng: -180 to 180)', 'warning');
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
              padding: 6px 16px 6px 42px;
              border-radius: 17px;
              height: 34px;
              display: flex;
              align-items: center;
              min-width: 80px;
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
        showAlert('Failed to Update Marker', 'Failed to update marker. Please try again.');
      }
    } catch (error) {
      console.error('Error updating marker:', error);
      showAlert('Error', 'Error updating marker. Please try again.');
    }
  };

  // Add marker to map and database
  const addMarkerToMap = useCallback(async (lng: number, lat: number, label: string, categoryId: string, categoryIconId?: string) => {
    const currentMapId = mapIdRef.current;
    
    if (!currentMapId) {
      console.error('No mapId available for adding marker');
      return;
    }
    
    if (!map.current) {
      console.error('No map instance available for adding marker');
      return;
    }

    // Find the category and icon for styling (or handle special search case)
    let category;
    let categoryIcon;
    if (categoryId === 'search') {
      // Special case for search result markers
      category = { id: 'search', name: 'Search' };
      categoryIcon = { id: 'search', name: 'Search', icon: 'location_on', backgroundColor: 'light', isNumbered: false };
    } else {
      category = markerCategories.find(cat => cat.id === categoryId);
      if (!category) {
        console.error('Category not found for marker creation');
        return;
      }
      
      if (categoryIconId) {
        categoryIcon = category.icons?.find(icon => icon.id === categoryIconId);
        if (!categoryIcon) {
          console.error('Category icon not found for marker creation');
          return;
        }
      } else {
        console.error('Category icon ID required for marker creation');
        return;
      }
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
          ...(categoryId !== 'search' && { categoryId, categoryIconId }),
          ...(categoryId === 'search' && { type: 'search' })
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
        
        // Create custom marker element based on category icon
        const el = document.createElement('div');
        el.className = `custom-marker category-${category.id} icon-${categoryIcon.id}`;
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
        
        // Set background color and content based on category icon
        const getMarkerBackgroundColor = (bgColor: string) => {
          switch (bgColor) {
            case 'dark': return { bg: 'hsl(222.2 84% 4.9%)', text: 'hsl(210 40% 98%)', border: 'hsl(214.3 31.8% 91.4%)' };
            case 'light': return { bg: 'rgb(243, 243, 243)', text: 'hsl(222.2 84% 4.9%)', border: 'hsl(214.3 31.8% 91.4%)' };
            case 'blue': return { bg: 'rgb(59, 130, 246)', text: 'white', border: 'hsl(214.3 31.8% 91.4%)' };
            case 'green': return { bg: 'rgb(16, 185, 129)', text: 'white', border: 'hsl(214.3 31.8% 91.4%)' };
            case 'red': return { bg: 'rgb(239, 68, 68)', text: 'white', border: 'hsl(214.3 31.8% 91.4%)' };
            case 'yellow': return { bg: 'rgb(245, 158, 11)', text: 'white', border: 'hsl(214.3 31.8% 91.4%)' };
            case 'purple': return { bg: 'rgb(139, 92, 246)', text: 'white', border: 'hsl(214.3 31.8% 91.4%)' };
            case 'orange': return { bg: 'rgb(249, 115, 22)', text: 'white', border: 'hsl(214.3 31.8% 91.4%)' };
            default: return { bg: 'rgb(243, 243, 243)', text: 'hsl(222.2 84% 4.9%)', border: 'hsl(214.3 31.8% 91.4%)' };
          }
        };
        
        const colors = getMarkerBackgroundColor(categoryIcon.backgroundColor);
        el.style.backgroundColor = colors.bg;
        el.style.color = colors.text;
        el.style.borderColor = colors.border;
        
        // Check if this is a numbered marker (contains number in label)
        const numberMatch = label.match(/(\d+)$/);
        if (numberMatch && categoryIcon.isNumbered) {
          el.textContent = numberMatch[1];
        } else if (categoryIcon.icon === 'solar-panel') {
          el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: ${colors.text};">
            <path d="M4,2H20A2,2 0 0,1 22,4V14A2,2 0 0,1 20,16H15V20H18V22H13V16H11V22H6V20H9V16H4A2,2 0 0,1 2,14V4A2,2 0 0,1 4,2M4,4V8H11V4H4M4,14H11V10H4V14M20,14V10H13V14H20M20,4H13V8H20V4Z" />
          </svg>`;
        } else {
          el.innerHTML = `<span class="material-icons" style="font-size: 16px; color: ${colors.text};">${categoryIcon.icon}</span>`;
        }
        
        // Create popup with slot styling - marker sits inside left rounded end
        const popup = new mapboxgl.Popup({ 
          offset: [-17, 0], // Position so marker center is concentric with slot's left rounded end (slot radius = 17px)
          anchor: 'left',
          closeButton: false,
          closeOnClick: false
        }).setHTML(`<div style="
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 6px 16px 6px 42px;
          border-radius: 17px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          height: 34px;
          display: flex;
          align-items: center;
          min-width: 80px;
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
  }, [markerCategories]);

  // Helper functions for marker grouping
  const getParentMarkers = (markers: Marker[]) => {
    return markers
      .filter(marker => !marker.parentId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
  };

  const getChildMarkers = (markers: Marker[], parentId: string) => {
    return markers
      .filter(marker => marker.parentId === parentId)
      .sort((a, b) => (a.childPosition || 0) - (b.childPosition || 0));
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Handle marker drag and drop for both reordering and grouping
  const handleMarkerDragStart = (e: React.DragEvent, markerId: string) => {
    // Allow dragging both individual markers and groups
    setDraggedMarkerId(markerId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleMarkerDragOver = (e: React.DragEvent, targetMarkerId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedMarkerId) return;
    
    const draggedMarker = markers.find(m => m.id === draggedMarkerId);
    const targetMarker = markers.find(m => m.id === targetMarkerId);
    
    if (!draggedMarker || !targetMarker) return;
    
    // Check if markers are in same parent context (for reordering)
    const sameParent = draggedMarker.parentId === targetMarker.parentId;
    
    // Check if dragged marker is a group (has children)
    const draggedIsGroup = getChildMarkers(markers, draggedMarkerId).length > 0;
    
    // Get mouse position relative to the target element
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY;
    const elementMiddle = rect.top + rect.height / 2;
    
    // Determine if this should be a reorder or group operation
    // Only treat as reorder if in same parent AND mouse is close to edges (within 25% of height)
    const heightThreshold = rect.height * 0.25;
    const nearTopEdge = mouseY - rect.top < heightThreshold;
    const nearBottomEdge = rect.bottom - mouseY < heightThreshold;
    const isReorderPosition = nearTopEdge || nearBottomEdge;
    
    if (draggedIsGroup) {
      // Groups can only be reordered, not grouped with other markers
      if (sameParent && isReorderPosition) {
        const position = mouseY < elementMiddle ? 'before' : 'after';
        setDragInsertPosition({ markerId: targetMarkerId, position });
        setDragOperation('reorder');
        setDragOverMarkerId(null);
      } else {
        // No operation allowed for groups except reordering
        setDragOverMarkerId(null);
        setDragOperation(null);
        setDragInsertPosition(null);
      }
    } else if (sameParent && isReorderPosition) {
      // This is a reorder operation - show insertion line
      const position = mouseY < elementMiddle ? 'before' : 'after';
      setDragInsertPosition({ markerId: targetMarkerId, position });
      setDragOperation('reorder');
      setDragOverMarkerId(null);
    } else if (targetMarker.parentId === null) {
      // This is a grouping operation - only allow grouping onto root/parent markers
      // Child markers (those with parentId) cannot be group targets
      setDragOverMarkerId(targetMarkerId);
      setDragOperation('group');
      setDragInsertPosition(null);
    } else {
      // Target is a child marker - no operation allowed
      setDragOverMarkerId(null);
      setDragOperation(null);
      setDragInsertPosition(null);
    }
  };

  const handleMarkerDragLeave = () => {
    setDragOverMarkerId(null);
    setDragInsertPosition(null);
    setDragOperation(null);
  };

  const handleMarkerDrop = async (e: React.DragEvent, targetMarkerId: string) => {
    e.preventDefault();
    
    if (!draggedMarkerId || draggedMarkerId === targetMarkerId) {
      setDraggedMarkerId(null);
      setDragOverMarkerId(null);
      setDragInsertPosition(null);
      setDragOperation(null);
      return;
    }

    const draggedMarker = markers.find(m => m.id === draggedMarkerId);
    const targetMarker = markers.find(m => m.id === targetMarkerId);
    
    if (!draggedMarker || !targetMarker) {
      setDraggedMarkerId(null);
      setDragOverMarkerId(null);
      setDragInsertPosition(null);
      setDragOperation(null);
      return;
    }

    if (dragOperation === 'reorder') {
      // Handle reordering
      const insertAfter = dragInsertPosition?.position === 'after';
      await reorderMarkers(draggedMarkerId, targetMarkerId, insertAfter);
    } else if (dragOperation === 'group') {
      // Handle grouping - only allow grouping onto root/parent markers
      const draggedIsGroup = getChildMarkers(markers, draggedMarkerId).length > 0;
      
      if (targetMarker.parentId !== null || draggedIsGroup) {
        // Cannot group onto child markers, and groups cannot be grouped
        setDraggedMarkerId(null);
        setDragOverMarkerId(null);
        setDragInsertPosition(null);
        setDragOperation(null);
        return;
      }
      
      try {
        // Calculate position for grouping operation
        const existingChildren = getChildMarkers(markers, targetMarkerId);
        const nextChildPosition = existingChildren.length;

        // Update marker to have new parent
        const response = await fetch(`/api/markers/${draggedMarkerId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            parentId: targetMarkerId,
            childPosition: nextChildPosition,
            position: null, // Clear root position since it's now a child
          }),
        });

        if (response.ok) {
          // Update local state
          setMarkers(prev => prev.map(m => 
            m.id === draggedMarkerId 
              ? { ...m, parentId: targetMarkerId, childPosition: nextChildPosition, position: null }
              : m
          ));
          
          // Update maps state
          setMaps(prev => prev.map(m => 
            m.isActive 
              ? { 
                  ...m, 
                  markers: m.markers.map(marker => 
                    marker.id === draggedMarkerId 
                      ? { ...marker, parentId: targetMarkerId, childPosition: nextChildPosition, position: null }
                      : marker
                  )
                }
              : m
          ));
        } else {
          console.error('Failed to update marker parent:', response.status);
        }
      } catch (error) {
        console.error('Error updating marker parent:', error);
      }
    }

    // Clean up drag state
    setDraggedMarkerId(null);
    setDragOverMarkerId(null);
    setDragInsertPosition(null);
    setDragOperation(null);
  };

  const handleMarkerDragEnd = () => {
    setDraggedMarkerId(null);
    setDragOverMarkerId(null);
    setDragInsertPosition(null);
    setDragOperation(null);
  };

  // Handle ungrouping by dragging away
  const handleUngroupMarker = async (markerId: string) => {
    try {
      // Get next position for ungrouped marker (becomes root marker)
      const parentMarkers = getParentMarkers(markers);
      const nextPosition = parentMarkers.length;

      const response = await fetch(`/api/markers/${markerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentId: null,
          position: nextPosition,
          childPosition: null,
        }),
      });

      if (response.ok) {
        // Update local state
        setMarkers(prev => prev.map(m => 
          m.id === markerId 
            ? { ...m, parentId: null, position: nextPosition, childPosition: null }
            : m
        ));
        
        // Update maps state
        setMaps(prev => prev.map(m => 
          m.isActive 
            ? { 
                ...m, 
                markers: m.markers.map(marker => 
                  marker.id === markerId 
                    ? { ...marker, parentId: null, position: nextPosition, childPosition: null }
                    : marker
                )
              }
            : m
        ));
      } else {
        console.error('Failed to ungroup marker:', response.status);
      }
    } catch (error) {
      console.error('Error ungrouping marker:', error);
    }
  };

  // Reorder markers within the same level
  const reorderMarkers = async (draggedId: string, targetId: string, insertAfter: boolean = false) => {
    const draggedMarker = markers.find(m => m.id === draggedId);
    const targetMarker = markers.find(m => m.id === targetId);
    
    if (!draggedMarker || !targetMarker) return;

    // Check if they're in the same context (both root or both children of same parent)
    const sameParent = draggedMarker.parentId === targetMarker.parentId;
    if (!sameParent) return;

    try {
      const isChildLevel = !!draggedMarker.parentId;
      const contextMarkers = isChildLevel 
        ? getChildMarkers(markers, draggedMarker.parentId!)
        : getParentMarkers(markers);

      // Calculate new positions
      const updates: Array<{id: string, position?: number, childPosition?: number}> = [];
      
      // Remove dragged marker from current position
      const filteredMarkers = contextMarkers.filter(m => m.id !== draggedId);
      
      // Find target position
      const targetIndex = filteredMarkers.findIndex(m => m.id === targetId);
      const insertIndex = insertAfter ? targetIndex + 1 : targetIndex;
      
      // Insert dragged marker at new position
      filteredMarkers.splice(insertIndex, 0, draggedMarker);
      
      // Reassign positions
      filteredMarkers.forEach((marker, index) => {
        if (isChildLevel) {
          updates.push({ id: marker.id, childPosition: index });
        } else {
          updates.push({ id: marker.id, position: index });
        }
      });

      // Update all affected markers
      for (const update of updates) {
        await fetch(`/api/markers/${update.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(update),
        });
      }

      // Update local state
      setMarkers(prev => prev.map(m => {
        const update = updates.find(u => u.id === m.id);
        if (update) {
          return {
            ...m,
            ...(update.position !== undefined && { position: update.position }),
            ...(update.childPosition !== undefined && { childPosition: update.childPosition })
          };
        }
        return m;
      }));

      // Update maps state
      setMaps(prev => prev.map(m => 
        m.isActive 
          ? { 
              ...m, 
              markers: m.markers.map(marker => {
                const update = updates.find(u => u.id === marker.id);
                if (update) {
                  return {
                    ...marker,
                    ...(update.position !== undefined && { position: update.position }),
                    ...(update.childPosition !== undefined && { childPosition: update.childPosition })
                  };
                }
                return marker;
              })
            }
          : m
      ));

    } catch (error) {
      console.error('Error reordering markers:', error);
    }
  };

  return (
    <div className="relative h-screen">
      {/* Left Sidebar */}
      <div className="left-sidebar fixed top-0 left-0 h-screen w-[280px] bg-white border-r border-border z-[1000] flex flex-col">
        {/* Header */}
        <div className="px-2 py-3 border-b border-border">
          <h1 className="text-lg font-semibold text-foreground ml-2">{teamName}</h1>
        </div>

        {/* Search */}
        <div className="px-2 py-3 border-b border-border">
          <div 
            id="search-box"
            className="w-full"
          />
        </div>

        {/* Maps/Files Section */}
        <div className="flex-1 px-1 py-3 overflow-y-auto">
          {/* Maps Header */}
          <div className="flex items-center justify-between mb-3 px-2">
            <h4 className="text-xs font-medium text-muted-foreground">MAPS</h4>
            <button 
              className="text-primary hover:text-primary/80 transition-colors"
              onClick={startNewMap}
              title="Add new map"
            >
              <span className="material-icons" style={{fontSize: '16px'}}>add_circle</span>
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
                      getParentMarkers(mapItem.markers).map((marker) => {
                        const children = getChildMarkers(mapItem.markers, marker.id);
                        const isCollapsed = collapsedGroups.has(marker.id);
                        const hasChildren = children.length > 0;
                        
                        return (
                          <div key={marker.id} className="relative">
                            {/* Insertion line before */}
                            {dragInsertPosition?.markerId === marker.id && dragInsertPosition.position === 'before' && (
                              <div className="absolute -top-px left-2 right-2 h-0.5 bg-primary rounded-full z-10" />
                            )}
                            
                            {/* Parent Marker */}
                            <div 
                              className={`group flex items-center justify-between px-2 py-1 hover:bg-muted rounded-md transition-colors ${
                                dragOverMarkerId === marker.id && dragOperation === 'group' ? 'bg-primary/10 border-l-2 border-primary' : ''
                              } cursor-grab`}
                              draggable={!marker.locked}
                              onDragStart={(e) => handleMarkerDragStart(e, marker.id)}
                              onDragOver={(e) => handleMarkerDragOver(e, marker.id)}
                              onDragLeave={handleMarkerDragLeave}
                              onDrop={(e) => handleMarkerDrop(e, marker.id)}
                              onDragEnd={handleMarkerDragEnd}
                            >
                              <div className="flex items-center flex-1 min-w-0">
                                {hasChildren && (
                                  <button 
                                    className="mr-1 p-0.5 hover:bg-muted-foreground/10 rounded"
                                    onClick={() => toggleGroupCollapse(marker.id)}
                                    title={isCollapsed ? "Expand group" : "Collapse group"}
                                  >
                                    <span className="material-icons text-muted-foreground" style={{fontSize: '12px'}}>
                                      {isCollapsed ? 'chevron_right' : 'expand_more'}
                                    </span>
                                  </button>
                                )}
                                <span className="material-icons mr-2 text-muted-foreground" style={{fontSize: '14px'}}>
                                  {marker.type === 'search' ? 'place' : 
                                   marker.categoryIcon ? marker.categoryIcon.icon :
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
                                {hasChildren && (
                                  <span className="ml-1 text-xs text-muted-foreground">({children.length})</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  title={marker.locked ? 'Unlock marker' : 'Lock marker'}
                                  onClick={() => toggleMarkerLock(marker.id)}
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
                            
                            {/* Insertion line after */}
                            {dragInsertPosition?.markerId === marker.id && dragInsertPosition.position === 'after' && (
                              <div className="absolute -bottom-px left-2 right-2 h-0.5 bg-primary rounded-full z-10" />
                            )}
                            
                            {/* Child Markers */}
                            {hasChildren && !isCollapsed && (
                              <div className="ml-6 border-l-2 border-border space-y-0.5 pl-2">
                                {children.map((childMarker) => (
                                  <div key={childMarker.id} className="relative">
                                    {/* Insertion line before child */}
                                    {dragInsertPosition?.markerId === childMarker.id && dragInsertPosition.position === 'before' && (
                                      <div className="absolute -top-px left-2 right-2 h-0.5 bg-primary rounded-full z-10" />
                                    )}
                                    
                                    <div 
                                      className={`group flex items-center justify-between px-2 py-1 hover:bg-muted rounded-md transition-colors cursor-grab ${
                                        dragOverMarkerId === childMarker.id && dragOperation === 'group' ? 'bg-primary/10 border-l-2 border-primary' : ''
                                      }`}
                                      draggable={!childMarker.locked}
                                      onDragStart={(e) => handleMarkerDragStart(e, childMarker.id)}
                                      onDragOver={(e) => handleMarkerDragOver(e, childMarker.id)}
                                      onDragLeave={handleMarkerDragLeave}
                                      onDrop={(e) => handleMarkerDrop(e, childMarker.id)}
                                      onDragEnd={handleMarkerDragEnd}
                                    >
                                    <div className="flex items-center flex-1 min-w-0">
                                      <span className="material-icons mr-2 text-muted-foreground" style={{fontSize: '14px'}}>
                                        {childMarker.type === 'search' ? 'place' : 
                                         childMarker.categoryIcon ? childMarker.categoryIcon.icon :
                                         childMarker.type === 'location' ? 'location_on' :
                                         childMarker.type === 'device' ? 'memory' : 'build'}
                                      </span>
                                      <span 
                                        className="text-xs text-foreground cursor-pointer hover:text-primary transition-colors truncate"
                                        title="Click to center on marker"
                                        onClick={() => centerOnMarker(childMarker)}
                                      >
                                        {childMarker.label}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        title="Ungroup marker"
                                        onClick={() => handleUngroupMarker(childMarker.id)}
                                      >
                                        <span className="material-icons" style={{fontSize: '12px'}}>call_split</span>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        title={childMarker.locked ? 'Unlock marker' : 'Lock marker'}
                                        onClick={() => toggleMarkerLock(childMarker.id)}
                                      >
                                        <span className="material-icons" style={{fontSize: '12px'}}>
                                          {childMarker.locked ? 'lock' : 'lock_open'}
                                        </span>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        title="Edit marker"
                                        onClick={() => editMarker(childMarker)}
                                      >
                                        <span className="material-icons" style={{fontSize: '12px'}}>edit</span>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                        title="Delete marker"
                                        onClick={() => deleteMarker(childMarker.id)}
                                      >
                                        <span className="material-icons" style={{fontSize: '12px'}}>delete</span>
                                      </Button>
                                    </div>
                                    </div>
                                    
                                    {/* Insertion line after child */}
                                    {dragInsertPosition?.markerId === childMarker.id && dragInsertPosition.position === 'after' && (
                                      <div className="absolute -bottom-px left-2 right-2 h-0.5 bg-primary rounded-full z-10" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
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
            className={`w-full flex items-center px-2 py-2 hover:bg-muted rounded-md transition-colors ${
              screenshotMode ? 'text-primary bg-primary/10' : 'text-muted-foreground'
            }`}
            style={{fontSize: '0.75rem', fontWeight: '500'}}
            title="Screenshot mode"
            onClick={() => {
              const newScreenshotMode = !screenshotMode;
              setScreenshotMode(newScreenshotMode);
              
              if (newScreenshotMode) {
                // Enable labels for screenshots
                if (!labelsVisible) {
                  setLabelsVisible(true);
                  // Show all popups
                  Object.values(markersRef.current).forEach(marker => {
                    const popup = marker.getPopup();
                    if (popup) {
                      popup.addTo(map.current!);
                    }
                  });
                }
                // Add CSS class to body for screenshot mode
                document.body.classList.add('screenshot-mode');
              } else {
                // Remove CSS class from body 
                document.body.classList.remove('screenshot-mode');
              }
              
              // Force map resize after screenshot mode change
              setTimeout(() => {
                if (map.current) {
                  map.current.resize();
                }
              }, 50);
            }}
          >
            <span className="material-icons mr-3" style={{fontSize: '14px'}}>photo_camera</span>
            Screenshot Mode
          </button>
          <button 
            className="w-full flex items-center px-2 py-2 text-muted-foreground hover:bg-muted rounded-md transition-colors"
            style={{fontSize: '0.75rem', fontWeight: '500'}}
            title="Settings"
            onClick={onOpenSettings}
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
        className="map-container absolute top-0 bottom-0 left-[280px] right-0 w-[calc(100%-280px)] h-full"
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
          
          // Generate label with auto-numbering
          let label;
          if (draggedPinType.zoneNumber) {
            // For numbered icons (1-10) - use category name
            label = `${draggedPinType.categoryName} ${draggedPinType.zoneNumber}`;
          } else {
            // For regular icons, auto-number them by category
            const nextNumber = getNextCategoryNumber(draggedPinType.categoryName);
            label = `${draggedPinType.categoryName} ${nextNumber}`;
          }
          
          addMarkerToMap(
            lngLat.lng, 
            lngLat.lat, 
            label, 
            draggedPinType.categoryId,
            draggedPinType.categoryIconId
          );
          
          setDraggedPinType(null);
        }}
      />

      {/* Bottom Controls */}
      <div className="bottom-controls fixed bottom-8 right-3 bg-white text-foreground p-3 rounded-lg text-xs font-medium z-[1000] border border-border shadow-lg flex items-center gap-3">
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

      {/* Right Pin Toolbar - Dynamic Categories with Icons */}
      <div className="right-sidebar fixed top-3 right-3 z-[1000] bg-white p-2 rounded-lg border border-border shadow-lg">
        {categoriesLoading ? (
          <div className="text-center text-xs text-muted-foreground p-2">
            <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
            Loading...
          </div>
        ) : markerCategories.filter(category => category.isVisible).length === 0 ? (
          <div className="text-center text-xs text-muted-foreground p-2">
            {markerCategories.length === 0 
              ? "No categories configured. Add categories in Settings."
              : "All categories hidden. Toggle visibility in Settings."
            }
          </div>
        ) : (
          markerCategories.filter(category => category.isVisible).map((category) => {
            // Get background color class for icons
            const getBgClass = (bgColor: string) => {
              switch (bgColor) {
                case 'dark': return 'bg-foreground text-white';
                case 'light': return 'bg-muted text-foreground';
                case 'blue': return 'bg-blue-500 text-white';
                case 'green': return 'bg-green-500 text-white';
                case 'red': return 'bg-red-500 text-white';
                case 'yellow': return 'bg-yellow-500 text-white';
                case 'purple': return 'bg-purple-500 text-white';
                case 'orange': return 'bg-orange-500 text-white';
                default: return 'bg-muted text-foreground';
              }
            };

            return (
              <div key={category.id} className="mb-3">
                <h4 className="text-xs font-medium mb-2 text-muted-foreground">{category.name}</h4>
                <div className="grid grid-cols-2 gap-1">
                  {category.icons && category.icons.length > 0 ? (
                    category.icons.map((icon) => {
                      // Handle numbered icons (show 1-10)
                      if (icon.isNumbered) {
                        return [1,2,3,4,5,6,7,8,9,10].map(num => (
                          <div
                            key={`${icon.id}-${num}`}
                            className={`w-9 h-9 border-2 border-border rounded-full cursor-grab flex items-center justify-center text-xs font-bold transition-all hover:opacity-80 hover:scale-105 active:cursor-grabbing ${getBgClass(icon.backgroundColor)}`}
                            draggable={true}
                            title={`${icon.name} ${num}`}
                            onDragStart={(e) => {
                              setDraggedPinType({
                                categoryId: category.id,
                                categoryIconId: icon.id,
                                categoryName: category.name,
                                iconName: icon.name,
                                icon: icon.icon,
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
                        ));
                      } else {
                        // Regular icon (single instance)
                        return (
                          <div
                            key={icon.id}
                            className={`w-9 h-9 border-2 border-border rounded-full cursor-grab flex items-center justify-center transition-all hover:opacity-80 hover:scale-105 active:cursor-grabbing ${getBgClass(icon.backgroundColor)}`}
                            draggable={true}
                            title={icon.name}
                            onDragStart={(e) => {
                              setDraggedPinType({
                                categoryId: category.id,
                                categoryIconId: icon.id,
                                categoryName: category.name,
                                iconName: icon.name,
                                icon: icon.icon
                              });
                              e.dataTransfer.effectAllowed = 'copy';
                            }}
                            onDragEnd={() => {
                              setDraggedPinType(null);
                            }}
                          >
                            <span className="material-icons" style={{fontSize: '16px'}}>{icon.icon}</span>
                          </div>
                        );
                      }
                    })
                  ) : (
                    <div className="text-center text-xs text-muted-foreground p-1">
                      No icons in this category
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Screenshot Mode Exit Button */}
      <button 
        className={`fixed bottom-3 left-1/2 transform -translate-x-1/2 z-[2000] bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-lg transition-colors ${
          screenshotMode ? 'block' : 'hidden'
        }`}
        onClick={() => {
          setScreenshotMode(false);
          document.body.classList.remove('screenshot-mode');
          // Force map resize when exiting screenshot mode
          setTimeout(() => {
            if (map.current) {
              map.current.resize();
            }
          }, 50);
        }}
      >
        Exit Screenshot Mode
      </button>

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

      {/* Alert Dialog */}
      <AlertDialog open={alertDialog.isOpen} onOpenChange={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={alertDialog.type === 'error' ? 'text-destructive' : alertDialog.type === 'warning' ? 'text-orange-600' : 'text-green-600'}>
              {alertDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {alertDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.isOpen} onOpenChange={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}>
              {confirmDialog.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {confirmDialog.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}