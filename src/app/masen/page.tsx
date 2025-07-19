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
  const router = useRouter();

  // Check for existing session on load
  useEffect(() => {
    const checkAuth = async () => {
      const currentTeam = getCurrentTeam();
      if (currentTeam && currentTeam.name === 'masen') {
        // Validate session with server
        const { valid } = await validateSession();
        if (valid) {
          setIsAuthenticated(true);
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
      
      if (result.success) {
        setIsAuthenticated(true);
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