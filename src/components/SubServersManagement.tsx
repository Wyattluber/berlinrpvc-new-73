
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoaderIcon, PlusCircle, Edit, Trash2, ExternalLink, Upload, ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SubServer {
  id: string;
  name: string;
  description: string | null;
  link: string | null;
  icon: string;
  color: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SubServerFormData {
  name: string;
  description: string;
  link: string;
  icon: string;
  color: string;
  status: string;
  icon_file: File | null;
}

const SubServersManagement = () => {
  const [subServers, setSubServers] = useState<SubServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentServerId, setCurrentServerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SubServerFormData>({
    name: '',
    description: '',
    link: '',
    icon: '🚌',
    color: 'from-blue-500 to-blue-700',
    status: 'coming_soon',
    icon_file: null
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serverToDelete, setServerToDelete] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    fetchSubServers();
  }, []);

  const fetchSubServers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sub_servers')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      setSubServers(data || []);
    } catch (error: any) {
      console.error('Error fetching sub servers:', error);
      toast({
        title: 'Fehler',
        description: 'Unterserver konnten nicht geladen werden: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      link: '',
      icon: '🚌',
      color: 'from-blue-500 to-blue-700',
      status: 'coming_soon',
      icon_file: null
    });
    setIsEditMode(false);
    setCurrentServerId(null);
  };

  const openAddDialog = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEditDialog = (server: SubServer) => {
    setFormData({
      name: server.name,
      description: server.description || '',
      link: server.link || '',
      icon: server.icon,
      color: server.color,
      status: server.status,
      icon_file: null
    });
    setIsEditMode(true);
    setCurrentServerId(server.id);
    setFormOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        icon_file: file
      });
    }
  };

  const uploadIcon = async (file: File, serverId: string): Promise<string> => {
    setUploadLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `sub_server_icons/${serverId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('subservers')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });
      
      if (uploadError) {
        throw new Error(`Fehler beim Hochladen des Icons: ${uploadError.message}`);
      }
      
      const { data } = supabase.storage.from('subservers').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading icon:', error);
      throw error;
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.name) {
        toast({
          title: 'Fehler',
          description: 'Name ist ein Pflichtfeld.',
          variant: 'destructive',
        });
        return;
      }
      
      // Process link URL
      let link = formData.link;
      if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
        link = 'https://' + link;
      }
      
      if (isEditMode && currentServerId) {
        // Update existing server
        const { error } = await supabase
          .from('sub_servers')
          .update({
            name: formData.name,
            description: formData.description || null,
            link: link || null,
            icon: formData.icon,
            color: formData.color,
            status: formData.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentServerId);
        
        if (error) throw error;
        
        toast({
          title: 'Erfolg',
          description: 'Unterserver erfolgreich aktualisiert.',
        });
      } else {
        // Create new server
        const { data, error } = await supabase
          .from('sub_servers')
          .insert({
            name: formData.name,
            description: formData.description || null,
            link: link || null,
            icon: formData.icon,
            color: formData.color,
            status: formData.status
          })
          .select();
        
        if (error) throw error;
        
        toast({
          title: 'Erfolg',
          description: 'Neuer Unterserver erfolgreich hinzugefügt.',
        });
      }
      
      // Refresh server list and close dialog
      fetchSubServers();
      setFormOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error submitting sub server:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Es ist ein Fehler aufgetreten.',
        variant: 'destructive',
      });
    }
  };

  const confirmDelete = (id: string) => {
    setServerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!serverToDelete) return;
    
    try {
      const { error } = await supabase
        .from('sub_servers')
        .delete()
        .eq('id', serverToDelete);
      
      if (error) throw error;
      
      toast({
        title: 'Erfolg',
        description: 'Unterserver erfolgreich gelöscht.',
      });
      
      // Refresh list and close dialog
      fetchSubServers();
      setDeleteDialogOpen(false);
      setServerToDelete(null);
    } catch (error: any) {
      console.error('Error deleting sub server:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Es ist ein Fehler aufgetreten.',
        variant: 'destructive',
      });
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'inactive':
        return 'Inaktiv';
      case 'coming_soon':
        return 'Coming Soon';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'coming_soon':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle>Unterserver</CardTitle>
          <CardDescription>Verwalte deine Unterserver</CardDescription>
        </div>
        <Button onClick={openAddDialog} className="flex items-center space-x-2">
          <PlusCircle className="h-4 w-4 mr-2" />
          Neuen Unterserver hinzufügen
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <LoaderIcon className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subServers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Keine Unterserver gefunden. Füge deinen ersten Unterserver hinzu!
                    </TableCell>
                  </TableRow>
                ) : (
                  subServers.map((server) => (
                    <TableRow key={server.id}>
                      <TableCell>
                        <div className="text-2xl">
                          {server.icon}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{server.name}</TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {server.description || '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(server.status)}`}>
                          {getStatusLabel(server.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {server.link && server.status === 'active' && (
                            <Button 
                              variant="outline" 
                              size="icon"
                              asChild
                            >
                              <a href={server.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => openEditDialog(server)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="icon"
                            onClick={() => confirmDelete(server.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Add/Edit Server Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Unterserver bearbeiten' : 'Neuen Unterserver hinzufügen'}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Bearbeite die Details des Unterservers.' 
                : 'Füge einen neuen Unterserver hinzu.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Server Name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Kurze Beschreibung des Servers..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Input 
                  id="icon" 
                  value={formData.icon} 
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  placeholder="Emoji Icon (z.B. 🚌)"
                />
                <p className="text-xs text-muted-foreground">Verwende ein Emoji als Icon</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">Farbe</Label>
                <Select 
                  value={formData.color} 
                  onValueChange={(value) => setFormData({...formData, color: value})}
                >
                  <SelectTrigger id="color">
                    <SelectValue placeholder="Farbe wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="from-blue-500 to-blue-700">Blau</SelectItem>
                    <SelectItem value="from-red-500 to-red-700">Rot</SelectItem>
                    <SelectItem value="from-green-500 to-green-700">Grün</SelectItem>
                    <SelectItem value="from-yellow-500 to-amber-700">Gelb</SelectItem>
                    <SelectItem value="from-purple-500 to-purple-700">Lila</SelectItem>
                    <SelectItem value="from-pink-500 to-pink-700">Pink</SelectItem>
                    <SelectItem value="from-gray-500 to-gray-700">Grau</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Status wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="inactive">Inaktiv</SelectItem>
                    <SelectItem value="coming_soon">Coming Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="link">Link</Label>
                <Input 
                  id="link" 
                  value={formData.link} 
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  placeholder="https://discord.gg/..."
                />
                <p className="text-xs text-muted-foreground">
                  Link wird nur angezeigt, wenn Status auf "Aktiv" gesetzt ist
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSubmit} disabled={uploadLoading}>
              {uploadLoading ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Bitte warten...
                </>
              ) : isEditMode ? 'Aktualisieren' : 'Hinzufügen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unterserver löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Bist du sicher, dass du diesen Unterserver löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default SubServersManagement;
