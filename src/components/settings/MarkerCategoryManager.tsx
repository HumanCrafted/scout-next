'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CategoryIcon {
  id: string;
  name: string;
  icon: string;
  backgroundColor: string;
  isNumbered: boolean;
  displayOrder: number;
}

interface MarkerCategory {
  id: string;
  name: string;
  displayOrder: number;
  isVisible: boolean;
  icons: CategoryIcon[];
}

interface MarkerCategoryManagerProps {
  teamSlug: string;
}


const BACKGROUND_COLORS = [
  { value: 'dark', label: 'Dark', preview: '#1f2937' },
  { value: 'light', label: 'Light', preview: '#f3f4f6' },
  { value: 'blue', label: 'Blue', preview: '#3b82f6' },
  { value: 'green', label: 'Green', preview: '#10b981' },
  { value: 'red', label: 'Red', preview: '#ef4444' },
  { value: 'yellow', label: 'Yellow', preview: '#f59e0b' },
  { value: 'purple', label: 'Purple', preview: '#8b5cf6' },
  { value: 'orange', label: 'Orange', preview: '#f97316' },
];

export default function MarkerCategoryManager({ teamSlug }: MarkerCategoryManagerProps) {
  const [categories, setCategories] = useState<MarkerCategory[]>([]);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isCreateIconOpen, setIsCreateIconOpen] = useState(false);
  const [isEditIconOpen, setIsEditIconOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [editingIcon, setEditingIcon] = useState<CategoryIcon | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newIconName, setNewIconName] = useState('');
  const [newIconIcon, setNewIconIcon] = useState('');
  const [newIconBackground, setNewIconBackground] = useState('light');
  const [editIconName, setEditIconName] = useState('');
  const [editIconIcon, setEditIconIcon] = useState('');
  const [editIconBackground, setEditIconBackground] = useState('light');
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MarkerCategory | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  useEffect(() => {
    loadCategories();
  }, [teamSlug]);

  const loadCategories = async () => {
    try {
      const response = await fetch(`/api/teams/${teamSlug}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const createCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const response = await fetch(`/api/teams/${teamSlug}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          displayOrder: categories.length
        }),
      });

      if (response.ok) {
        await loadCategories();
        setIsCreateCategoryOpen(false);
        setNewCategoryName('');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error creating category');
    }
  };

  const createIcon = async () => {
    if (!newIconName.trim() || !newIconIcon || !selectedCategoryId) return;

    try {
      const response = await fetch(`/api/teams/${teamSlug}/categories/${selectedCategoryId}/icons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newIconName.trim(),
          icon: newIconIcon,
          backgroundColor: newIconBackground,
          isNumbered: false, // Always false for regular icons
          displayOrder: 0
        }),
      });

      if (response.ok) {
        await loadCategories();
        setIsCreateIconOpen(false);
        setNewIconName('');
        setNewIconIcon('');
        setNewIconBackground('light');
        setSelectedCategoryId(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create icon');
      }
    } catch (error) {
      console.error('Error creating icon:', error);
      alert('Error creating icon');
    }
  };

  const deleteCategory = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    const categoryName = category?.name || 'this category';
    
    if (!confirm(`Are you sure you want to delete "${categoryName}"? All icons within it will also be removed.`)) return;

    try {
      const response = await fetch(`/api/teams/${teamSlug}/categories/${categoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadCategories();
      } else {
        const error = await response.json();
        
        // Enhanced error handling for usage validation
        if (error.markersInUse && error.markersInUse.length > 0) {
          const markerList = error.markersInUse.slice(0, 5).join(', ');
          const additionalCount = error.markersInUse.length > 5 ? ` (and ${error.markersInUse.length - 5} more)` : '';
          
          alert(`${error.message}\n\nMarkers using this category: ${markerList}${additionalCount}\n\nPlease go to the map and remove these markers first, then try deleting the category again.`);
        } else {
          alert(error.message || 'Failed to delete category');
        }
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  const editIcon = async () => {
    if (!editIconName.trim() || !editIconIcon || !editingIcon) return;

    try {
      const response = await fetch(`/api/teams/${teamSlug}/categories/${selectedCategoryId}/icons/${editingIcon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editIconName.trim(),
          icon: editIconIcon,
          backgroundColor: editIconBackground,
          isNumbered: editingIcon.isNumbered // Keep the original isNumbered value
        }),
      });

      if (response.ok) {
        await loadCategories();
        setIsEditIconOpen(false);
        setEditingIcon(null);
        setEditIconName('');
        setEditIconIcon('');
        setEditIconBackground('light');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update icon');
      }
    } catch (error) {
      console.error('Error updating icon:', error);
      alert('Error updating icon');
    }
  };

  const deleteIcon = async (categoryId: string, iconId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    const icon = category?.icons?.find(ic => ic.id === iconId);
    const iconName = icon?.name || 'this icon';
    
    if (!confirm(`Are you sure you want to delete "${iconName}"?`)) return;

    try {
      const response = await fetch(`/api/teams/${teamSlug}/categories/${categoryId}/icons/${iconId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadCategories();
      } else {
        const error = await response.json();
        
        // Enhanced error handling for usage validation
        if (error.markersInUse && error.markersInUse.length > 0) {
          const markerList = error.markersInUse.slice(0, 5).join(', ');
          const additionalCount = error.markersInUse.length > 5 ? ` (and ${error.markersInUse.length - 5} more)` : '';
          
          alert(`${error.message}\n\nMarkers using this icon: ${markerList}${additionalCount}\n\nPlease go to the map and remove these markers first, then try deleting the icon again.`);
        } else {
          alert(error.message || 'Failed to delete icon');
        }
      }
    } catch (error) {
      console.error('Error deleting icon:', error);
      alert('Error deleting icon');
    }
  };

  const openCreateIcon = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setIsCreateIconOpen(true);
  };

  const openEditIcon = (categoryId: string, icon: CategoryIcon) => {
    setSelectedCategoryId(categoryId);
    setEditingIcon(icon);
    setEditIconName(icon.name);
    setEditIconIcon(icon.icon);
    setEditIconBackground(icon.backgroundColor);
    setIsEditIconOpen(true);
  };

  const toggleCategoryVisibility = async (categoryId: string, currentVisibility: boolean) => {
    try {
      const response = await fetch(`/api/teams/${teamSlug}/categories/${categoryId}/visibility`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isVisible: !currentVisibility
        }),
      });

      if (response.ok) {
        await loadCategories(); // Reload categories to get updated state
      } else {
        const error = await response.json();
        console.error('Failed to update category visibility:', error.message);
      }
    } catch (error) {
      console.error('Error updating category visibility:', error);
    }
  };

  const openEditCategory = (category: MarkerCategory) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setIsEditCategoryOpen(true);
  };

  const editCategory = async () => {
    if (!editCategoryName.trim() || !editingCategory) return;

    try {
      const response = await fetch(`/api/teams/${teamSlug}/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editCategoryName.trim()
        }),
      });

      if (response.ok) {
        await loadCategories();
        setIsEditCategoryOpen(false);
        setEditingCategory(null);
        setEditCategoryName('');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update category name');
      }
    } catch (error) {
      console.error('Error updating category name:', error);
      alert('Error updating category name');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marker Categories</CardTitle>
        <CardDescription>
          Manage your team&apos;s marker categories and icons. Create categories like &quot;Area&quot;, &quot;Devices&quot;, &quot;Assets&quot;, then add multiple icons to each category.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium">Categories</h4>
          <Button onClick={() => setIsCreateCategoryOpen(true)}>
            <span className="material-icons mr-2" style={{fontSize: '16px'}}>add</span>
            Add Category
          </Button>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <span className="material-icons mb-2" style={{fontSize: '48px'}}>category</span>
            <p>No categories yet. Create your first category to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <Card key={category.id} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <div className="flex gap-2 items-center">
                      {category.name === 'Area' ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`areas-toggle-${category.id}`} className="text-sm">Show in toolbar</Label>
                            <Switch 
                              id={`areas-toggle-${category.id}`}
                              checked={category.isVisible}
                              onCheckedChange={() => toggleCategoryVisibility(category.id, category.isVisible)}
                            />
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditCategory(category)}
                            title="Edit category name"
                          >
                            <span className="material-icons" style={{fontSize: '14px'}}>edit</span>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openCreateIcon(category.id)}
                          >
                            <span className="material-icons mr-1" style={{fontSize: '14px'}}>add</span>
                            Add Icon
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditCategory(category)}
                            title="Edit category name"
                          >
                            <span className="material-icons" style={{fontSize: '14px'}}>edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteCategory(category.id)}
                          >
                            <span className="material-icons" style={{fontSize: '14px'}}>delete</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {category.icons.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No icons in this category</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Icon</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Background</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {category.icons.map((icon) => (
                          <TableRow key={icon.id}>
                            <TableCell>
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                                style={{
                                  backgroundColor: (() => {
                                    switch (icon.backgroundColor) {
                                      case 'dark': return '#1f2937';
                                      case 'light': return '#f3f4f6';
                                      case 'blue': return 'rgb(59, 130, 246)';
                                      case 'green': return 'rgb(16, 185, 129)';
                                      case 'red': return 'rgb(239, 68, 68)';
                                      case 'yellow': return 'rgb(245, 158, 11)';
                                      case 'purple': return 'rgb(139, 92, 246)';
                                      case 'orange': return 'rgb(249, 115, 22)';
                                      default: return '#f3f4f6';
                                    }
                                  })(),
                                  borderColor: '#e5e7eb',
                                  color: ['dark', 'blue', 'green', 'red', 'yellow', 'purple', 'orange'].includes(icon.backgroundColor) ? 'white' : '#1f2937'
                                }}
                              >
                                {icon.isNumbered ? (
                                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>1</span>
                                ) : (
                                  <span className="material-icons" style={{fontSize: '16px'}}>
                                    {icon.icon}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{icon.name}</TableCell>
                            <TableCell>
                              <span className="capitalize">{icon.backgroundColor}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {category.name === 'Area' ? (
                                  <span className="text-muted-foreground text-sm px-2 py-1">Default icon</span>
                                ) : (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => openEditIcon(category.id, icon)}
                                    >
                                      <span className="material-icons" style={{fontSize: '14px'}}>edit</span>
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => deleteIcon(category.id, icon.id)}
                                    >
                                      <span className="material-icons" style={{fontSize: '14px'}}>delete</span>
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Category Dialog */}
        <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Area, Devices, Assets"
                />
                <p className="text-xs text-muted-foreground">
                  Categories group related marker types together in the toolbar
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateCategoryOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createCategory}>
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Icon Dialog */}
        <Dialog open={isCreateIconOpen} onOpenChange={setIsCreateIconOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Icon to Category</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="icon-name">Icon Name</Label>
                <Input
                  id="icon-name"
                  value={newIconName}
                  onChange={(e) => setNewIconName(e.target.value)}
                  placeholder="e.g., Sensor, Router, Building"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon-name-input">Material Icon Name</Label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center w-10 h-10 border rounded bg-muted">
                    {newIconIcon ? (
                      <span className="material-icons" style={{fontSize: '16px'}}>
                        {newIconIcon}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">?</span>
                    )}
                  </div>
                  <Input
                    id="icon-name-input"
                    value={newIconIcon}
                    onChange={(e) => setNewIconIcon(e.target.value)}
                    placeholder="e.g., memory, wifi, build, power"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter any Material Icons name from{' '}
                  <a 
                    href="https://fonts.google.com/icons" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    fonts.google.com/icons
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon-background">Background Color</Label>
                <Select value={newIconBackground} onValueChange={setNewIconBackground}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BACKGROUND_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border" 
                            style={{ backgroundColor: color.preview }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateIconOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createIcon}>
                Add Icon
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Icon Dialog */}
        <Dialog open={isEditIconOpen} onOpenChange={setIsEditIconOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Icon</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-icon-name">Icon Name</Label>
                <Input
                  id="edit-icon-name"
                  value={editIconName}
                  onChange={(e) => setEditIconName(e.target.value)}
                  placeholder="e.g., Sensor, Router, Building"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-icon-name-input">Material Icon Name</Label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center w-10 h-10 border rounded bg-muted">
                    {editIconIcon ? (
                      <span className="material-icons" style={{fontSize: '16px'}}>
                        {editIconIcon}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">?</span>
                    )}
                  </div>
                  <Input
                    id="edit-icon-name-input"
                    value={editIconIcon}
                    onChange={(e) => setEditIconIcon(e.target.value)}
                    placeholder="e.g., memory, wifi, build, power"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter any Material Icons name from{' '}
                  <a 
                    href="https://fonts.google.com/icons" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    fonts.google.com/icons
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-icon-background">Background Color</Label>
                <Select value={editIconBackground} onValueChange={setEditIconBackground}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BACKGROUND_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border" 
                            style={{ backgroundColor: color.preview }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditIconOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editIcon}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category Name</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category-name">Category Name</Label>
                <Input
                  id="edit-category-name"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  placeholder="Enter category name"
                />
                <p className="text-xs text-muted-foreground">
                  This name will be used in the toolbar and for auto-numbering markers
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditCategoryOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editCategory}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}