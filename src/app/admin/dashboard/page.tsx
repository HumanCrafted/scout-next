'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamManagement } from '@/components/admin/TeamManagement';
import { Analytics } from '@/components/admin/Analytics';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/validate');
        if (!response.ok) {
          router.push('/admin');
          return;
        }
        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin material-icons text-4xl mb-4">refresh</div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="material-icons text-2xl">admin_panel_settings</span>
                <h1 className="text-2xl font-bold">Scout Admin</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <span className="material-icons text-sm">logout</span>
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teams" className="flex items-center space-x-2">
              <span className="material-icons text-sm">groups</span>
              <span>Teams</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <span className="material-icons text-sm">analytics</span>
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teams">
            <TeamManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}