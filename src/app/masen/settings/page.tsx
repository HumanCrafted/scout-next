'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SettingsPage from '@/components/settings/SettingsPage';
import { validateSession, getCurrentTeam } from '@/lib/auth';

export default function MasenSettingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
        } else {
          // Redirect to team login if not authenticated
          router.push('/masen');
          return;
        }
      } else {
        // Redirect to team login if no session
        router.push('/masen');
        return;
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleBackToMap = () => {
    router.push('/masen');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <SettingsPage 
      teamName="masen" 
      onBack={handleBackToMap}
    />
  );
}