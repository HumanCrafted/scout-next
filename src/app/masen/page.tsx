'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MapContainer from '@/components/map/MapContainer';
import { validateSession, loginTeam, logoutTeam, getCurrentTeam } from '@/lib/auth';

export default function MasenTeamPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [teamDisplayName, setTeamDisplayName] = useState('');
  const router = useRouter();

  // Check for existing session on load
  useEffect(() => {
    const checkAuth = async () => {
      const currentTeam = getCurrentTeam();
      if (currentTeam && currentTeam.name === 'masen') {
        // Validate session with server and get fresh team data
        const { valid, team } = await validateSession();
        if (valid && team) {
          setIsAuthenticated(true);
          setTeamDisplayName(team.displayName);
          
          // Update localStorage with fresh team data
          const sessionStr = localStorage.getItem('scout-session');
          if (sessionStr) {
            const session = JSON.parse(sessionStr);
            session.team = team;
            localStorage.setItem('scout-session', JSON.stringify(session));
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await loginTeam('masen', password);
      
      if (result.success && result.team) {
        setIsAuthenticated(true);
        setTeamDisplayName(result.team.displayName);
      } else {
        setError(result.error || 'Invalid password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
    }
  };

  const handleLogout = async () => {
    await logoutTeam();
    setIsAuthenticated(false);
    setPassword('');
    router.push('/');
  };

  const handleOpenSettings = () => {
    router.push('/masen/settings');
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
    <div className="h-screen">
      {/* Map Container with v1 layout structure */}
      <MapContainer teamName={teamDisplayName || 'masen'} onLogout={handleLogout} onOpenSettings={handleOpenSettings} />
    </div>
  );
}