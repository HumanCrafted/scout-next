'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AnalyticsData {
  overview: {
    totalTeams: number;
    totalMaps: number;
    totalMarkers: number;
    totalCategories: number;
    activeSessions: number;
  };
  teamStats: Array<{
    id: string;
    name: string;
    displayName: string;
    maps: number;
    markers: number;
    categories: number;
    sessions: number;
    lastActivity: string;
    createdAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    teamName: string;
    teamDisplayName: string;
    action: string;
    timestamp: string;
    details?: string;
  }>;
  popularCategories: Array<{
    name: string;
    count: number;
    teams: number;
  }>;
}

export function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        setError('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin material-symbols-rounded text-2xl mb-2">refresh</div>
          <p>Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <span className="material-symbols-rounded text-4xl mb-2 text-destructive">error</span>
          <p className="text-destructive">{error || 'Failed to load analytics'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of Scout usage and team activity
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <span className="material-symbols-rounded text-lg text-muted-foreground">groups</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalTeams}</div>
            <p className="text-xs text-muted-foreground">Total teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maps</CardTitle>
            <span className="material-symbols-rounded text-lg text-muted-foreground">map</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalMaps}</div>
            <p className="text-xs text-muted-foreground">Total maps</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Markers</CardTitle>
            <span className="material-symbols-rounded text-lg text-muted-foreground">place</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalMarkers}</div>
            <p className="text-xs text-muted-foreground">Total markers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <span className="material-symbols-rounded text-lg text-muted-foreground">category</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalCategories}</div>
            <p className="text-xs text-muted-foreground">Total categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <span className="material-symbols-rounded text-lg text-muted-foreground">online_prediction</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.activeSessions}</div>
            <p className="text-xs text-muted-foreground">Current sessions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Team Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Maps</TableHead>
                  <TableHead>Markers</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.teamStats.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{team.displayName}</span>
                        <Badge variant="outline" className="text-xs">{team.name}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>{team.maps}</TableCell>
                    <TableCell>{team.markers}</TableCell>
                    <TableCell>
                      {team.lastActivity 
                        ? new Date(team.lastActivity).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Popular Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.popularCategories.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No categories found
                </p>
              ) : (
                analytics.popularCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Used by {category.teams} team{category.teams !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <Badge variant="secondary">{category.count}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <span className="material-symbols-rounded text-4xl mb-2">history</span>
              <p>No recent activity</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.recentActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activity.teamDisplayName}</span>
                        <Badge variant="outline" className="text-xs">{activity.teamName}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{activity.action}</Badge>
                    </TableCell>
                    <TableCell>{activity.details || '-'}</TableCell>
                    <TableCell>
                      {new Date(activity.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}