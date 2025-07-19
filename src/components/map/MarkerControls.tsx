'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface Marker {
  id: string;
  label: string;
  lat: number;
  lng: number;
  type: string;
}

interface MarkerControlsProps {
  markers: Marker[];
  onAddMarker: (marker: { label: string; lat: number; lng: number; type: string }) => void;
  onDeleteMarker: (id: string) => void;
  teamName: string;
}

export default function MarkerControls({ 
  markers, 
  onAddMarker, 
  onDeleteMarker, 
  teamName 
}: MarkerControlsProps) {
  const [newMarkerLabel, setNewMarkerLabel] = useState('');
  const [isAddingMarker, setIsAddingMarker] = useState(false);

  const handleAddMarker = () => {
    if (!newMarkerLabel.trim()) return;

    // Add marker at center of map (will be improved later with click placement)
    onAddMarker({
      label: newMarkerLabel,
      lat: 40.0,
      lng: -74.5,
      type: 'location'
    });

    setNewMarkerLabel('');
    setIsAddingMarker(false);
  };

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 w-80 z-10">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{teamName} Markers</h3>
        
        {/* Add Marker Section */}
        <div className="space-y-2">
          {!isAddingMarker ? (
            <Button 
              onClick={() => setIsAddingMarker(true)}
              className="w-full"
            >
              Add Marker
            </Button>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Marker label"
                value={newMarkerLabel}
                onChange={(e) => setNewMarkerLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMarker()}
                autoFocus
              />
              <div className="flex gap-2">
                <Button onClick={handleAddMarker} size="sm">
                  Add
                </Button>
                <Button 
                  onClick={() => {
                    setIsAddingMarker(false);
                    setNewMarkerLabel('');
                  }}
                  variant="outline" 
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Markers List */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">
            Markers ({markers.length})
          </h4>
          {markers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No markers yet</p>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {markers.map((marker) => (
                <div 
                  key={marker.id}
                  className="flex items-center justify-between p-2 border rounded text-sm"
                >
                  <span className="truncate">{marker.label}</span>
                  <Button
                    onClick={() => onDeleteMarker(marker.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}