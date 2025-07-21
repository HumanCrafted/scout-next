'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Team {
  id: string;
  name: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    maps: number;
    sessions: number;
    markerCategories: number;
  };
}

export function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create team state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    displayName: '',
    password: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Edit team state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editForm, setEditForm] = useState({
    displayName: '',
    password: '',
  });
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      } else {
        setError('Failed to load teams');
      }
    } catch (error) {
      console.error('Error loading teams:', error);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        setSuccess('Team created successfully');
        setCreateDialogOpen(false);
        setCreateForm({ name: '', displayName: '', password: '' });
        loadTeams();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      setError('Failed to create team');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;

    setEditLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/admin/teams/${editingTeam.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setSuccess('Team updated successfully');
        setEditDialogOpen(false);
        setEditingTeam(null);
        setEditForm({ displayName: '', password: '' });
        loadTeams();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update team');
      }
    } catch (error) {
      console.error('Error updating team:', error);
      setError('Failed to update team');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;

    setDeleteLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/admin/teams/${teamToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Team deleted successfully');
        setDeleteDialogOpen(false);
        setTeamToDelete(null);
        loadTeams();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      setError('Failed to delete team');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditDialog = (team: Team) => {
    setEditingTeam(team);
    setEditForm({
      displayName: team.displayName,
      password: '', // Always require new password for security
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (team: Team) => {
    setTeamToDelete(team);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin material-icons text-2xl mb-2">refresh</div>
          <p>Loading teams...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">
            Create, edit, and manage Scout teams
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <span className="material-icons text-sm">add</span>
              <span>Create Team</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name (URL slug)</Label>
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. acme-corp"
                  required
                  pattern="[a-z0-9-]+"
                  title="Only lowercase letters, numbers, and hyphens allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={createForm.displayName}
                  onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                  placeholder="e.g. Acme Corporation"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Team Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Enter team password"
                  required
                  minLength={6}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? 'Creating...' : 'Create Team'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Teams Table */}
      <Card>
        <CardHeader>
          <CardTitle>Teams ({teams.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <span className="material-icons text-4xl mb-2">groups_off</span>
              <p>No teams found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>URL Slug</TableHead>
                  <TableHead>Maps</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Active Sessions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.displayName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{team.name}</Badge>
                    </TableCell>
                    <TableCell>{team._count.maps}</TableCell>
                    <TableCell>{team._count.markerCategories}</TableCell>
                    <TableCell>{team._count.sessions}</TableCell>
                    <TableCell>
                      {new Date(team.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(team)}
                          className="flex items-center space-x-1"
                        >
                          <span className="material-icons text-xs">edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(team)}
                          className="flex items-center space-x-1 text-destructive hover:text-destructive"
                        >
                          <span className="material-icons text-xs">delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Team Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          {editingTeam && (
            <form onSubmit={handleEditTeam} className="space-y-4">
              <div className="space-y-2">
                <Label>Team Name (URL slug)</Label>
                <Input value={editingTeam.name} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">URL slug cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDisplayName">Display Name</Label>
                <Input
                  id="editDisplayName"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPassword">New Password (optional)</Label>
                <Input
                  id="editPassword"
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                  minLength={6}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editLoading}>
                  {editLoading ? 'Updating...' : 'Update Team'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the team "{teamToDelete?.displayName}"? 
              This will permanently delete all maps, markers, and categories for this team. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTeam}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Team'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}