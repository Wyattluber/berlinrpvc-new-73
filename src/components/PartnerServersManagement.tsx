
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, Upload, ExternalLink, Info } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface Partner {
  id: string;
  name: string;
  description: string;
  website: string;
  owner: string;
  members: number;
  type: string;
  logo_url: string;
  created_at: string;
  updated_at: string;
}

const defaultPartner: Omit<Partner, 'id' | 'created_at' | 'updated_at'> = {
  name: '',
  description: '',
  website: '',
  owner: '',
  members: 0,
  type: 'small',
  logo_url: '/placeholder.svg'
};

const PartnerServersManagement = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Omit<Partner, 'id' | 'created_at' | 'updated_at'>>(defaultPartner);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg']
    },
    multiple: false,
    onDrop: handleImageDrop
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  async function fetchPartners() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('partner_servers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error: any) {
      console.error('Error fetching partners:', error);
      toast({
        title: 'Fehler',
        description: `Partner konnten nicht geladen werden: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleImageDrop(acceptedFiles: File[]) {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setUploading(true);
    
    try {
      // Create preview URL for immediate display
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `partner_logos/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('partners')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('partners')
        .getPublicUrl(filePath);
        
      setFormData({
        ...formData,
        logo_url: urlData.publicUrl
      });
      
      toast({
        title: 'Erfolg',
        description: 'Logo wurde erfolgreich hochgeladen.'
      });
      
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Fehler beim Hochladen',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  }

  function startAdd() {
    setFormData(defaultPartner);
    setPreviewUrl(null);
    setIsAdding(true);
  }

  function startEdit(partner: Partner) {
    setSelectedPartner(partner);
    setFormData({
      name: partner.name,
      description: partner.description,
      website: partner.website,
      owner: partner.owner,
      members: partner.members,
      type: partner.type,
      logo_url: partner.logo_url
    });
    setPreviewUrl(partner.logo_url);
    setIsEditing(true);
  }

  function confirmDelete(partner: Partner) {
    setSelectedPartner(partner);
    setIsDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.name || !formData.website) {
      toast({
        title: 'Fehler',
        description: 'Name und Website sind erforderlich.',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (isAdding) {
        // Add new partner
        const { data, error } = await supabase
          .from('partner_servers')
          .insert([
            {
              name: formData.name,
              description: formData.description,
              website: formData.website,
              owner: formData.owner,
              members: formData.members,
              type: formData.type,
              logo_url: formData.logo_url
            }
          ])
          .select();

        if (error) throw error;

        toast({
          title: 'Erfolg',
          description: 'Partner wurde erfolgreich hinzugefügt.'
        });
      } else if (isEditing && selectedPartner) {
        // Update existing partner
        const { error } = await supabase
          .from('partner_servers')
          .update({
            name: formData.name,
            description: formData.description,
            website: formData.website,
            owner: formData.owner,
            members: formData.members,
            type: formData.type,
            logo_url: formData.logo_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedPartner.id);

        if (error) throw error;

        toast({
          title: 'Erfolg',
          description: 'Partner wurde erfolgreich aktualisiert.'
        });
      }

      // Reset state and fetch updated list
      setIsAdding(false);
      setIsEditing(false);
      setSelectedPartner(null);
      setPreviewUrl(null);
      fetchPartners();
    } catch (error: any) {
      console.error('Error saving partner:', error);
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  async function handleDelete() {
    if (!selectedPartner) return;

    try {
      const { error } = await supabase
        .from('partner_servers')
        .delete()
        .eq('id', selectedPartner.id);

      if (error) throw error;

      // If logo is not the placeholder, delete it from storage
      if (selectedPartner.logo_url && !selectedPartner.logo_url.includes('placeholder')) {
        const logoPath = selectedPartner.logo_url.split('/').pop();
        if (logoPath) {
          await supabase.storage
            .from('partners')
            .remove([`partner_logos/${logoPath}`]);
        }
      }

      toast({
        title: 'Erfolg',
        description: 'Partner wurde erfolgreich gelöscht.'
      });

      setIsDeleteDialogOpen(false);
      setSelectedPartner(null);
      fetchPartners();
    } catch (error: any) {
      console.error('Error deleting partner:', error);
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'members' ? parseInt(value) || 0 : value
    }));
  }

  function handleSelectChange(value: string) {
    setFormData(prev => ({
      ...prev,
      type: value
    }));
  }

  function getPartnerTypeLabel(type: string) {
    switch (type) {
      case 'small':
        return 'Kleiner Server';
      case 'large':
        return 'Großer Server';
      case 'cooperation':
        return 'Kooperation';
      default:
        return type;
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Partner Server</CardTitle>
            <CardDescription>Verwalte die Partner Server deines Projekts</CardDescription>
          </div>
          <Button onClick={startAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Partner
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center p-8 border rounded-md">
              <Info className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-500">Keine Partner gefunden.</p>
              <p className="text-sm text-gray-400 mt-1">
                Füge deinen ersten Partner Server mit dem "Neuer Partner" Button hinzu.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Mitglieder</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead className="w-[120px]">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={partner.logo_url || '/placeholder.svg'} 
                              alt={partner.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span>{partner.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getPartnerTypeLabel(partner.type)}</TableCell>
                      <TableCell>{partner.owner}</TableCell>
                      <TableCell>{partner.members}</TableCell>
                      <TableCell>
                        <a 
                          href={partner.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-500 hover:text-blue-700"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Link
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => startEdit(partner)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => confirmDelete(partner)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Add Dialog */}
      <Dialog 
        open={isEditing || isAdding} 
        onOpenChange={(open) => {
          if (!open) {
            setIsEditing(false);
            setIsAdding(false);
            setSelectedPartner(null);
            setPreviewUrl(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isAdding ? 'Neuen Partner hinzufügen' : 'Partner bearbeiten'}
            </DialogTitle>
            <DialogDescription>
              Fülle alle erforderlichen Felder aus, um einen Partner zu {isAdding ? 'erstellen' : 'aktualisieren'}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-4 md:col-span-1">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Discord Server Name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Input 
                  id="owner" 
                  name="owner" 
                  value={formData.owner} 
                  onChange={handleChange} 
                  placeholder="Discord Username"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="members">Mitglieder</Label>
                  <Input 
                    id="members" 
                    name="members" 
                    type="number" 
                    value={formData.members} 
                    onChange={handleChange} 
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Typ</Label>
                  <Select 
                    value={formData.type}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Typ auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Kleiner Server</SelectItem>
                      <SelectItem value="large">Großer Server</SelectItem>
                      <SelectItem value="cooperation">Kooperation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Discord Invite Link *</Label>
                <Input 
                  id="website" 
                  name="website" 
                  value={formData.website} 
                  onChange={handleChange} 
                  placeholder="https://discord.gg/..."
                />
              </div>
            </div>
            
            <div className="space-y-4 md:col-span-1">
              <div className="space-y-2">
                <Label>Server Logo</Label>
                <div 
                  {...getRootProps()} 
                  className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition"
                >
                  <input {...getInputProps()} />
                  
                  {previewUrl ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={previewUrl} 
                        alt="Logo preview" 
                        className="w-24 h-24 object-contain mb-2"
                      />
                      <p className="text-sm text-gray-500">Klicke, um zu ändern</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-1">Logo hochladen</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Drag & Drop oder klicken
                      </p>
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="mt-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-500 mx-auto"></div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="Kurze Beschreibung des Servers..."
                  rows={4}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditing(false);
                setIsAdding(false);
                setSelectedPartner(null);
                setPreviewUrl(null);
              }}
            >
              Abbrechen
            </Button>
            <Button onClick={handleSave}>
              {isAdding ? 'Hinzufügen' : 'Speichern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partner löschen</DialogTitle>
            <DialogDescription>
              Möchtest du den Partner "{selectedPartner?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerServersManagement;
