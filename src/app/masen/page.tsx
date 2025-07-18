'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import MapContainer from '@/components/map/MapContainer';

export default function MasenTeamPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const teamPassword = 'masen2025';

  // Check for existing session on load
  useEffect(() => {
    const session = localStorage.getItem('masen-session');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        const now = new Date().getTime();
        if (sessionData.expires > now) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('masen-session');
        }
      } catch {
        localStorage.removeItem('masen-session');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === teamPassword) {
      // Create session (expires in 24 hours)
      const sessionData = {
        team: 'masen',
        expires: new Date().getTime() + (24 * 60 * 60 * 1000)
      };
      localStorage.setItem('masen-session', JSON.stringify(sessionData));
      setIsAuthenticated(true);
    } else {
      setError('Invalid password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('masen-session');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Masen Team</h1>
            <p className="text-muted-foreground mt-2">
              Enter team password to access the workspace
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Team password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                required
                autoFocus
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            
            <Button type="submit" className="w-full">
              Access Team Workspace
            </Button>
          </form>

          <div className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to main login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Team Header */}
      <header className="bg-background border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Masen Team - Scout</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </header>

      {/* Map Container */}
      <div className="flex-1">
        <MapContainer className="h-full w-full" />
      </div>
    </div>
  );
}