// Client-side authentication utilities

export interface Team {
  name: string;
  displayName: string;
}

export interface AuthResponse {
  success: boolean;
  team?: Team;
  sessionToken?: string;
  expiresAt?: string;
  error?: string;
}

export interface SessionData {
  team: Team;
  sessionToken: string;
  expiresAt: string;
}

// Login with team credentials
export async function loginTeam(teamName: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ teamName, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Store session in localStorage
      const sessionData: SessionData = {
        team: data.team,
        sessionToken: data.sessionToken,
        expiresAt: data.expiresAt
      };
      localStorage.setItem('scout-session', JSON.stringify(sessionData));
      return data;
    } else {
      return { success: false, error: data.error || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error' };
  }
}

// Validate current session
export async function validateSession(): Promise<{ valid: boolean; team?: Team }> {
  try {
    const sessionStr = localStorage.getItem('scout-session');
    if (!sessionStr) {
      return { valid: false };
    }

    const session: SessionData = JSON.parse(sessionStr);
    
    // Check local expiration first
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem('scout-session');
      return { valid: false };
    }

    // Validate with server
    const response = await fetch('/api/auth/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionToken: session.sessionToken }),
    });

    const data = await response.json();

    if (response.ok && data.valid) {
      return { valid: true, team: data.team };
    } else {
      localStorage.removeItem('scout-session');
      return { valid: false };
    }
  } catch (error) {
    console.error('Session validation error:', error);
    localStorage.removeItem('scout-session');
    return { valid: false };
  }
}

// Logout and cleanup
export async function logoutTeam(): Promise<void> {
  try {
    const sessionStr = localStorage.getItem('scout-session');
    if (sessionStr) {
      const session: SessionData = JSON.parse(sessionStr);
      
      // Notify server
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionToken: session.sessionToken }),
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local session
    localStorage.removeItem('scout-session');
  }
}

// Get current team from session
export function getCurrentTeam(): Team | null {
  try {
    const sessionStr = localStorage.getItem('scout-session');
    if (!sessionStr) return null;

    const session: SessionData = JSON.parse(sessionStr);
    
    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem('scout-session');
      return null;
    }

    return session.team;
  } catch (error) {
    console.error('Get current team error:', error);
    localStorage.removeItem('scout-session');
    return null;
  }
}