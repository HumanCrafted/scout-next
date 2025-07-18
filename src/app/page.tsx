'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Valid teams and their passwords
  const teams = {
    'masen': 'masen2025'
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const teamLower = teamName.toLowerCase().trim();
    
    // Check if team exists
    if (!teams[teamLower as keyof typeof teams]) {
      setError('Team not found');
      setIsLoading(false);
      return;
    }

    // Check password
    if (teams[teamLower as keyof typeof teams] !== password) {
      setError('Invalid password');
      setIsLoading(false);
      return;
    }

    // Create session for the team
    const sessionData = {
      team: teamLower,
      expires: new Date().getTime() + (24 * 60 * 60 * 1000)
    };
    localStorage.setItem(`${teamLower}-session`, JSON.stringify(sessionData));

    // Redirect to team workspace
    router.push(`/${teamLower}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="flex flex-col gap-8 items-center text-center max-w-md w-full">
        <div>
          <h1 className="text-4xl font-bold">Scout v2</h1>
          <p className="text-muted-foreground mt-2">
            Industrial sensor mapping application with team collaboration
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
