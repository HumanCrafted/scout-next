'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginTeam } from '@/lib/auth';

export default function Home() {
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await loginTeam(teamName.trim(), password);
      
      if (result.success && result.team) {
        // Redirect to team workspace
        router.push(`/${result.team.name}`);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="flex flex-col gap-8 items-center text-center max-w-md w-full">
        <div>
          <h1 className="text-4xl font-bold">Scout</h1>
          <p className="text-muted-foreground mt-2">
            A mapping application
          </p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full"
              required
            />
            <Input
              type="password"
              placeholder="Team password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Accessing...' : 'Access Team Workspace'}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          <p>Have a team workspace URL? Navigate directly to access with password only.</p>
        </div>
      </main>
    </div>
  );
}
