
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { PlusCircle, Edit2, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SubServer {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  status: string;
  link: string | null;
  created_at: string;
  updated_at: string;
}

const SubServersManagement = () => {
  const [subServers, setSubServers] = useState<SubServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState<SubServer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🚌',
    color: 'from-blue-500 to-blue-700',
    status: 'coming_soon',
    link: '',
  });

  // Color options for the gradient
  const colorOptions = [
    { value: 'from-blue-500 to-blue-700', label: 'Blau' },
    { value: 'from-green-500 to-green-700', label: 'Grün' },
    { value: 'from-red-500 to-red-700', label: 'Rot' },
    { value: 'from-purple-500 to-purple-700', label: 'Lila' },
    { value: 'from-yellow-500 to-yellow-700', label: 'Gelb' },
    { value: 'from-pink-500 to-pink-700', label: 'Pink' },
    { value: 'from-indigo-500 to-indigo-700', label: 'Indigo' },
    { value: 'from-gray-500 to-gray-700', label: 'Grau' },
  ];

  // Status options
  const statusOptions = [
    { value: 'coming_soon', label: 'Demnächst' },
    { value: 'active', label: 'Aktiv' },
    { value: 'maintenance', label: 'Wartung' },
    { value: 'closed', label: 'Geschlossen' },
  ];

  useEffect(() => {
    fetchSubServers();
  }, []);

  const fetchSubServers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sub_servers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setSubServers(data || []);
    } catch (error) {
      console.error('Error fetching sub servers:', error);
      toast({
        title: 'Fehler',
        description: 'Die Unterserver konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.name) {
        toast({
          title: 'Eingabefehler',
          description: 'Bitte gib einen Namen für den Unterserver ein.',
          variant: 'destructive',
        });
        return;
      }
      
      // Make sure link starts with http:// or https:// if provided
      let link = formData.link;
      if (link && !/^https?:\/\//i.test(link)) {
        link = 'https://' + link;
      }
      
      if (selectedServer) {
        // Update existing server
        const { error } = await supabase
          .from('sub_servers')
          .update({
            name: formData.name,
            description: formData.description || null,
            icon: formData.icon,
            color: formData.color,
            status: formData.status,
            link: link || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedServer.id);
        
        if (error) throw error;
        
        toast({
          title: 'Unterserver aktualisiert',
          description: `"${formData.name}" wurde erfolgreich aktualisiert.`,
        });
      } else {
        // Create new server
        const { error } = await supabase
          .from('sub_servers')
          .insert([{
            name: formData.name,
            description: formData.description || null,
            icon: formData.icon,
            color: formData.color,
            status: formData.status,
            link: link || null
          }]);
        
        if (error) throw error;
        
        toast({
          title: 'Unterserver erstellt',
          description: `"${formData.name}" wurde erfolgreich hinzugefügt.`,
        });
      }
      
      // Reset and refresh
      resetForm();
      fetchSubServers();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving sub server:', error);
      toast({
        title: 'Fehler',
        description: 'Der Unterserver konnte nicht gespeichert werden.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (server: SubServer) => {
    setSelectedServer(server);
    setFormData({
      name: server.name,
      description: server.description || '',
      icon: server.icon,
      color: server.color,
      status: server.status,
      link: server.link || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedServer) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('sub_servers')
        .delete()
        .eq('id', selectedServer.id);
      
      if (error) throw error;
      
      toast({
        title: 'Unterserver gelöscht',
        description: `"${selectedServer.name}" wurde erfolgreich gelöscht.`,
      });
      
      // Reset and refresh
      fetchSubServers();
      setIsDeleteDialogOpen(false);
      setSelectedServer(null);
    } catch (error) {
      console.error('Error deleting sub server:', error);
      toast({
        title: 'Fehler',
        description: 'Der Unterserver konnte nicht gelöscht werden.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedServer(null);
    setFormData({
      name: '',
      description: '',
      icon: '🚌',
      color: 'from-blue-500 to-blue-700',
      status: 'coming_soon',
      link: '',
    });
  };

  const getStatusLabel = (status: string) => {
    return statusOptions.find(option => option.value === status)?.label || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'coming_soon':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Unterserver</h2>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Neuer Unterserver
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {subServers.length === 0 ? (
            <Alert>
              <AlertDescription>
                Noch keine Unterserver vorhanden. Füge deinen ersten Unterserver hinzu!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subServers.map(server => (
                <Card key={server.id} className="overflow-hidden">
                  <div className={`h-24 bg-gradient-to-r ${server.color} flex items-center justify-center text-white`}>
                    <div className="text-4xl">{server.icon}</div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{server.name}</CardTitle>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(server.status)}`}>
                        {getStatusLabel(server.status)}
                      </span>
                    </div>
                    {server.link && (
                      <CardDescription className="flex items-center">
                        <a 
                          href={server.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center"
                        >
                          Link öffnen <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="text-sm">
                    {server.description && <p>{server.description}</p>}
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2 pt-0">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(server)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Bearbeiten
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        setSelectedServer(server);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Löschen
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Sub Server Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {selectedServer ? `Unterserver bearbeiten: ${selectedServer.name}` : 'Neuen Unterserver hinzufügen'}
              </DialogTitle>
              <DialogDescription>
                Füge Informationen über den Unterserver hinzu.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Kurze Beschreibung des Unterservers"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Input
                    id="icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    placeholder="🚌"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Farbe</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => handleSelectChange('color', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Farbe wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="link">Link</Label>
                  <Input
                    id="link"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder="https://discord.gg/..."
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsFormOpen(false);
                }}
                disabled={isSubmitting}
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {selectedServer ? 'Speichern' : 'Hinzufügen'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unterserver löschen</DialogTitle>
            <DialogDescription>
              Möchtest du diesen Unterserver wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          {selectedServer && (
            <div className="py-4">
              <p className="font-medium">{selectedServer.name}</p>
              <p className="text-sm text-muted-foreground">{selectedServer.description}</p>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubServersManagement;
