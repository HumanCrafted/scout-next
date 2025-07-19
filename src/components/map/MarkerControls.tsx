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
  onStartPlacement: (label: string) => void;
  onDeleteMarker: (id: string) => void;
  teamName: string;
  isPlacementMode: boolean;
  onTogglePlacementMode: () => void;
}

export default function MarkerControls({ 
  markers, 
  onStartPlacement, 
  onDeleteMarker, 
  teamName,
  isPlacementMode,
  onTogglePlacementMode
}: MarkerControlsProps) {
  const [newMarkerLabel, setNewMarkerLabel] = useState('');

  const handleStartPlacement = () => {
    if (!newMarkerLabel.trim()) return;
    onStartPlacement(newMarkerLabel);
  };

  const handleCancelPlacement = () => {
    setNewMarkerLabel('');
    if (isPlacementMode) {
      onTogglePlacementMode();
    }
  };

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 w-80 z-10">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{teamName} Markers</h3>
        
        {/* Add Marker Section */}
        <div className="space-y-2">
          {isPlacementMode ? (
            <div className="space-y-2">
              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                <strong>Click on the map</strong> to place &ldquo;{newMarkerLabel}&rdquo;
              </div>
              <Button 
                onClick={handleCancelPlacement}
                variant="outline" 
                className="w-full"
              >
                Cancel Placement
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Enter marker label"
                value={newMarkerLabel}
                onChange={(e) => setNewMarkerLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStartPlacement()}
              />
              <Button 
                onClick={handleStartPlacement}
                disabled={!newMarkerLabel.trim()}
                className="w-full"
              >
                Click to Place Marker
              </Button>
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