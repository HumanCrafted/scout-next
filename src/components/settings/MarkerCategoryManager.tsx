'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface MarkerCategory {
  id: string;
  name: string;
  icon: string;
  backgroundColor: string;
  displayOrder: number;
}

interface MarkerCategoryManagerProps {
  teamSlug: string;
}

// Common Material Icons for markers
const MATERIAL_ICONS = [
  'place', 'location_on', 'map', 'room', 'pin_drop',
  'memory', 'computer', 'router', 'wifi', 'bluetooth',
  'build', 'construction', 'engineering', 'hardware', 'settings',
  'power', 'electrical_services', 'bolt', 'battery_full', 'cable',
  'warning', 'error', 'info', 'help', 'check_circle',
  'account_tree', 'device_hub', 'lan', 'dns', 'cloud',
  'storage', 'folder', 'inventory', 'category', 'label',
  'security', 'lock', 'vpn_key', 'shield', 'verified',
  'speed', 'trending_up', 'analytics', 'insights', 'assessment',
  'schedule', 'alarm', 'timer', 'access_time', 'today',
  'person', 'group', 'badge', 'contact_mail', 'phone',
  'local_shipping', 'fire_truck', 'agriculture', 'factory', 'precision_manufacturing'
];

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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MarkerCategory | null>(null);
  const [isIconPopoverOpen, setIsIconPopoverOpen] = useState(false);
  const [isEditIconPopoverOpen, setIsEditIconPopoverOpen] = useState(false);
  
  // Form state for new category
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('place');
  const [newBackgroundColor, setNewBackgroundColor] = useState('light');
  
  // Form state for editing category
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editBackgroundColor, setEditBackgroundColor] = useState('');

  useEffect(() => {
    loadCategories();
  }, [teamSlug]);

  const loadCategories = async () => {
    try {
      const response = await fetch(`/api/teams/${teamSlug}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newName.trim()) return;

    try {
      const response = await fetch(`/api/teams/${teamSlug}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          icon: newIcon,
          backgroundColor: newBackgroundColor,
          displayOrder: categories.length,
        }),
      });

      if (response.ok) {
        await loadCategories();
        setIsAddDialogOpen(false);
        setNewName('');
        setNewIcon('place');
        setNewBackgroundColor('light');
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleEditCategory = (category: MarkerCategory) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditIcon(category.icon);
    setEditBackgroundColor(category.backgroundColor);
    setIsEditDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editName.trim()) return;

    try {
      const response = await fetch(`/api/teams/${teamSlug}/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          icon: editIcon,
          backgroundColor: editBackgroundColor,
        }),
      });

      if (response.ok) {
        await loadCategories();
        setIsEditDialogOpen(false);
        setEditingCategory(null);
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? Existing markers using this category will not be affected.')) {
      return;
    }

    try {
      const response = await fetch(`/api/teams/${teamSlug}/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const moveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c.id === categoryId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    // Create new array with swapped positions
    const newCategories = [...categories];
    const temp = newCategories[currentIndex];
    newCategories[currentIndex] = newCategories[newIndex];
    newCategories[newIndex] = temp;

    // Update display orders
    for (let i = 0; i < newCategories.length; i++) {
      newCategories[i].displayOrder = i;
    }

    try {
      // Update all categories' display orders
      const updates = newCategories.map(cat => ({
        id: cat.id,
        displayOrder: cat.displayOrder,
      }));

      const response = await fetch(`/api/teams/${teamSlug}/categories/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: updates }),
      });

      if (response.ok) {
        setCategories(newCategories);
      }
    } catch (error) {
      console.error('Error reordering categories:', error);
    }
  };

  const IconSelector = ({ 
    value, 
    onChange, 
    isOpen, 
    setIsOpen 
  }: { 
    value: string; 
    onChange: (icon: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
  }) => (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <span className="material-icons mr-2" style={{fontSize: '16px'}}>{value}</span>
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <Command>
          <CommandInput placeholder="Search icons..." />
          <CommandList>
            <CommandEmpty>No icons found.</CommandEmpty>
            <CommandGroup>
              {MATERIAL_ICONS.map((icon) => (
                <CommandItem
                  key={icon}
                  value={icon}
                  onSelect={() => {
                    onChange(icon);
                    setIsOpen(false);
                  }}
                >
                  <span className="material-icons mr-2" style={{fontSize: '16px'}}>{icon}</span>
                  {icon}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marker Categories</CardTitle>
        <CardDescription>
          Manage custom marker categories for your team toolbar. Categories define the types of markers available for placement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Current Categories</h4>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <span className="material-icons mr-2" style={{fontSize: '16px'}}>add</span>
              Add Category
            </Button>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No categories configured. Add your first category to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Background</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category, index) => {
                  const bgColor = BACKGROUND_COLORS.find(bg => bg.value === category.backgroundColor);
                  return (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => moveCategory(category.id, 'up')}
                            disabled={index === 0}
                          >
                            <span className="material-icons" style={{fontSize: '12px'}}>keyboard_arrow_up</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => moveCategory(category.id, 'down')}
                            disabled={index === categories.length - 1}
                          >
                            <span className="material-icons" style={{fontSize: '12px'}}>keyboard_arrow_down</span>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="material-icons" style={{fontSize: '16px'}}>{category.icon}</span>
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{backgroundColor: bgColor?.preview || '#f3f4f6'}}
                          />
                          {bgColor?.label || category.backgroundColor}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleEditCategory(category)}
                          >
                            <span className="material-icons" style={{fontSize: '12px'}}>edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <span className="material-icons" style={{fontSize: '12px'}}>delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Add Category Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">Category Name</Label>
                <Input
                  id="new-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Sensors, Equipment, Hazards"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Icon</Label>
                <IconSelector
                  value={newIcon}
                  onChange={setNewIcon}
                  isOpen={isIconPopoverOpen}
                  setIsOpen={setIsIconPopoverOpen}
                />
              </div>

              <div className="space-y-2">
                <Label>Background Color</Label>
                <Select value={newBackgroundColor} onValueChange={setNewBackgroundColor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BACKGROUND_COLORS.map((bg) => (
                      <SelectItem key={bg.value} value={bg.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{backgroundColor: bg.preview}}
                          />
                          {bg.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory}>Add Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Category Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Icon</Label>
                <IconSelector
                  value={editIcon}
                  onChange={setEditIcon}
                  isOpen={isEditIconPopoverOpen}
                  setIsOpen={setIsEditIconPopoverOpen}
                />
              </div>

              <div className="space-y-2">
                <Label>Background Color</Label>
                <Select value={editBackgroundColor} onValueChange={setEditBackgroundColor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BACKGROUND_COLORS.map((bg) => (
                      <SelectItem key={bg.value} value={bg.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{backgroundColor: bg.preview}}
                          />
                          {bg.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCategory}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}