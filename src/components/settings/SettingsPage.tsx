'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface SettingsData {
  // Map Settings
  defaultMapStyle: 'satellite' | 'street';
  defaultZoom: number;
  defaultLabelsVisible: boolean;
  coordinateFormat: 'decimal' | 'dms';
  
  // Marker Settings
  defaultMarkerLocked: boolean;
  autoSaveFrequency: number; // seconds
  
  // Team Settings
  teamDisplayName: string;
  exportFormat: 'json' | 'csv' | 'geojson';
  screenshotModeDefault: boolean;
  
  // Session Settings
  sessionTimeout: number; // hours
}

interface SettingsPageProps {
  teamName: string;
  onBack: () => void;
}

const defaultSettings: SettingsData = {
  defaultMapStyle: 'satellite',
  defaultZoom: 4.2,
  defaultLabelsVisible: true,
  coordinateFormat: 'decimal',
  defaultMarkerLocked: false,
  autoSaveFrequency: 2,
  teamDisplayName: '',
  exportFormat: 'json',
  screenshotModeDefault: false,
  sessionTimeout: 24,
};

export default function SettingsPage({ teamName, onBack }: SettingsPageProps) {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [isDirty, setIsDirty] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem(`scout-settings-${teamName}`);
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    } else {
      setSettings({ ...defaultSettings, teamDisplayName: teamName });
    }
  }, [teamName]);

  const handleSettingChange = <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSaveSettings = async () => {
    try {
      // Save to localStorage for now (could be replaced with API call)
      localStorage.setItem(`scout-settings-${teamName}`, JSON.stringify(settings));
      setIsDirty(false);
      
      // Could add API call here to save to database
      // await fetch('/api/settings', { method: 'POST', body: JSON.stringify(settings) });
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  const handleResetSettings = () => {
    setSettings({ ...defaultSettings, teamDisplayName: teamName });
    setIsDirty(true);
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      // API call to change password
      const response = await fetch('/api/teams/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName,
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        setIsChangePasswordOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const error = await response.json();
        setPasswordError(error.message || 'Failed to change password');
      }
    } catch (err) {
      setPasswordError('An error occurred while changing password');
    }
  };

  const exportData = async () => {
    try {
      // This would export all team data
      const response = await fetch(`/api/teams/${teamName}/export?format=${settings.exportFormat}`);
      const data = await response.blob();
      
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `scout-${teamName}-export.${settings.exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Configure your Scout workspace preferences</p>
          </div>
          <Button variant="outline" onClick={onBack}>
            <span className="material-icons mr-2">arrow_back</span>
            Back to Map
          </Button>
        </div>

        {/* Map Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Map Settings</CardTitle>
            <CardDescription>Configure default map display preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="map-style">Default Map Style</Label>
                <Select
                  value={settings.defaultMapStyle}
                  onValueChange={(value: 'satellite' | 'street') => 
                    handleSettingChange('defaultMapStyle', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="satellite">Satellite</SelectItem>
                    <SelectItem value="street">Street</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coordinate-format">Coordinate Format</Label>
                <Select
                  value={settings.coordinateFormat}
                  onValueChange={(value: 'decimal' | 'dms') => 
                    handleSettingChange('coordinateFormat', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="decimal">Decimal Degrees</SelectItem>
                    <SelectItem value="dms">Degrees Minutes Seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-zoom">Default Zoom Level</Label>
                <Input
                  id="default-zoom"
                  type="number"
                  min="1"
                  max="20"
                  step="0.1"
                  value={settings.defaultZoom}
                  onChange={(e) => handleSettingChange('defaultZoom', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="labels-visible"
                checked={settings.defaultLabelsVisible}
                onCheckedChange={(checked) => handleSettingChange('defaultLabelsVisible', checked)}
              />
              <Label htmlFor="labels-visible">Show labels by default</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="screenshot-default"
                checked={settings.screenshotModeDefault}
                onCheckedChange={(checked) => handleSettingChange('screenshotModeDefault', checked)}
              />
              <Label htmlFor="screenshot-default">Enable screenshot mode by default</Label>
            </div>
          </CardContent>
        </Card>

        {/* Marker Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Marker Settings</CardTitle>
            <CardDescription>Configure marker behavior and defaults</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="default-locked"
                checked={settings.defaultMarkerLocked}
                onCheckedChange={(checked) => handleSettingChange('defaultMarkerLocked', checked)}
              />
              <Label htmlFor="default-locked">Lock new markers by default</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="autosave-frequency">Auto-save frequency (seconds)</Label>
              <Input
                id="autosave-frequency"
                type="number"
                min="1"
                max="60"
                value={settings.autoSaveFrequency}
                onChange={(e) => handleSettingChange('autoSaveFrequency', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Team Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Team Settings</CardTitle>
            <CardDescription>Manage team workspace settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Display Name</Label>
              <Input
                id="team-name"
                value={settings.teamDisplayName}
                onChange={(e) => handleSettingChange('teamDisplayName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-format">Default Export Format</Label>
              <Select
                value={settings.exportFormat}
                onValueChange={(value: 'json' | 'csv' | 'geojson') => 
                  handleSettingChange('exportFormat', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="geojson">GeoJSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
              <Input
                id="session-timeout"
                type="number"
                min="1"
                max="168"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage team security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => setIsChangePasswordOpen(true)}
            >
              <span className="material-icons mr-2">lock</span>
              Change Team Password
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Export and backup your team data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" onClick={exportData}>
              <span className="material-icons mr-2">download</span>
              Export Team Data
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleResetSettings}>
            Reset to Defaults
          </Button>
          
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={onBack}
              disabled={isDirty}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSettings}
              disabled={!isDirty}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Team Password</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangePasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}