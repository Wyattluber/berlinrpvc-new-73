
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PartnerServer {
  id: string;
  name: string;
  description: string | null;
  website: string;
  owner: string | null;
  members: number;
  type: string;
  logo_url: string;
  created_at: string;
  updated_at: string;
}

const PartnerServersManagement = () => {
  const [partnerServers, setPartnerServers] = useState<PartnerServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState<PartnerServer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    owner: '',
    members: 0,
    type: 'small',
    logo_url: '/placeholder.svg'
  });

  useEffect(() => {
    fetchPartnerServers();
  }, []);

  const fetchPartnerServers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partner_servers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setPartnerServers(data || []);
    } catch (error) {
      console.error('Error fetching partner servers:', error);
      toast({
        title: 'Fehler',
        description: 'Die Partnerserver konnten nicht geladen werden.',
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
      [name]: name === 'members' ? Number(value) : value
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
      if (!formData.name || !formData.website) {
        toast({
          title: 'Eingabefehler',
          description: 'Bitte fülle alle Pflichtfelder aus.',
          variant: 'destructive',
        });
        return;
      }
      
      // Make sure website starts with http:// or https://
      let website = formData.website;
      if (!/^https?:\/\//i.test(website)) {
        website = 'https://' + website;
      }
      
      if (selectedServer) {
        // Update existing server
        const { error } = await supabase
          .from('partner_servers')
          .update({
            name: formData.name,
            description: formData.description || null,
            website: website,
            owner: formData.owner || null,
            members: formData.members,
            type: formData.type,
            logo_url: formData.logo_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedServer.id);
        
        if (error) throw error;
        
        toast({
          title: 'Partnerserver aktualisiert',
          description: `"${formData.name}" wurde erfolgreich aktualisiert.`,
        });
      } else {
        // Create new server
        const { error } = await supabase
          .from('partner_servers')
          .insert([{
            name: formData.name,
            description: formData.description || null,
            website: website,
            owner: formData.owner || null,
            members: formData.members,
            type: formData.type,
            logo_url: formData.logo_url
          }]);
        
        if (error) throw error;
        
        toast({
          title: 'Partnerserver erstellt',
          description: `"${formData.name}" wurde erfolgreich hinzugefügt.`,
        });
      }
      
      // Reset and refresh
      resetForm();
      fetchPartnerServers();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving partner server:', error);
      toast({
        title: 'Fehler',
        description: 'Der Partnerserver konnte nicht gespeichert werden.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (server: PartnerServer) => {
    setSelectedServer(server);
    setFormData({
      name: server.name,
      description: server.description || '',
      website: server.website,
      owner: server.owner || '',
      members: server.members,
      type: server.type,
      logo_url: server.logo_url
    });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedServer) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('partner_servers')
        .delete()
        .eq('id', selectedServer.id);
      
      if (error) throw error;
      
      toast({
        title: 'Partnerserver gelöscht',
        description: `"${selectedServer.name}" wurde erfolgreich gelöscht.`,
      });
      
      // Reset and refresh
      fetchPartnerServers();
      setIsDeleteDialogOpen(false);
      setSelectedServer(null);
    } catch (error) {
      console.error('Error deleting partner server:', error);
      toast({
        title: 'Fehler',
        description: 'Der Partnerserver konnte nicht gelöscht werden.',
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
      website: '',
      owner: '',
      members: 0,
      type: 'small',
      logo_url: '/placeholder.svg'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Partnerserver</h2>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Neuer Partner
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {partnerServers.length === 0 ? (
            <Alert>
              <AlertDescription>
                Noch keine Partnerserver vorhanden. Füge deinen ersten Partner hinzu!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partnerServers.map(server => (
                <Card key={server.id} className="overflow-hidden">
                  <div className="h-36 bg-gray-100 p-4 flex items-center justify-center">
                    <img 
                      src={server.logo_url} 
                      alt={server.name} 
                      className="max-h-full max-w-full object-contain" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>{server.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <a 
                        href={server.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        Website <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm">
                    {server.description && <p className="mb-2">{server.description}</p>}
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>Typ: <span className="font-medium">{server.type}</span></div>
                      <div>Mitglieder: <span className="font-medium">{server.members}</span></div>
                      {server.owner && <div className="col-span-2">Inhaber: <span className="font-medium">{server.owner}</span></div>}
                    </div>
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
      
      {/* Partner Server Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {selectedServer ? `Partner bearbeiten: ${selectedServer.name}` : 'Neuen Partner hinzufügen'}
              </DialogTitle>
              <DialogDescription>
                Füge Informationen über den Partnerserver hinzu.
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
                <Label htmlFor="website">Website *</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://beispiel.de"
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
                  placeholder="Kurze Beschreibung des Servers"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner">Inhaber</Label>
                  <Input
                    id="owner"
                    name="owner"
                    value={formData.owner}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="members">Mitglieder</Label>
                  <Input
                    id="members"
                    name="members"
                    type="number"
                    min="0"
                    value={formData.members}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Typ</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Servertyp wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Klein</SelectItem>
                      <SelectItem value="medium">Mittel</SelectItem>
                      <SelectItem value="large">Groß</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleInputChange}
                    placeholder="/placeholder.svg"
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
            <DialogTitle>Partner löschen</DialogTitle>
            <DialogDescription>
              Möchtest du diesen Partnerserver wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          {selectedServer && (
            <div className="py-4">
              <p className="font-medium">{selectedServer.name}</p>
              <p className="text-sm text-muted-foreground">{selectedServer.website}</p>
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

export default PartnerServersManagement;
