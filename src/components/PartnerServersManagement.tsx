
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Partner {
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

interface PartnerFormData {
  name: string;
  description: string;
  website: string;
  owner: string;
  members: number;
  type: string;
  logo_url: string;
  logo_file: File | null;
}

const PartnerServersManagement = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPartnerId, setCurrentPartnerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    description: '',
    website: '',
    owner: '',
    members: 0,
    type: 'small',
    logo_url: '',
    logo_file: null
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('partner_servers')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      setPartners(data || []);
    } catch (error: any) {
      console.error('Error fetching partners:', error);
      toast({
        title: 'Fehler',
        description: 'Partner konnten nicht geladen werden: ' + error.message,
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
      website: '',
      owner: '',
      members: 0,
      type: 'small',
      logo_url: '',
      logo_file: null
    });
    setLogoPreview(null);
    setIsEditMode(false);
    setCurrentPartnerId(null);
  };

  const openAddDialog = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEditDialog = (partner: Partner) => {
    setFormData({
      name: partner.name,
      description: partner.description || '',
      website: partner.website,
      owner: partner.owner || '',
      members: partner.members,
      type: partner.type,
      logo_url: partner.logo_url,
      logo_file: null
    });
    setLogoPreview(partner.logo_url);
    setIsEditMode(true);
    setCurrentPartnerId(partner.id);
    setFormOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        logo_file: file
      });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (file: File, partnerId: string): Promise<string> => {
    setUploadLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `partner_logos/${partnerId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('partners')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });
      
      if (uploadError) {
        throw new Error(`Fehler beim Hochladen des Logos: ${uploadError.message}`);
      }
      
      const { data } = supabase.storage.from('partners').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      throw error;
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.name || !formData.website) {
        toast({
          title: 'Fehler',
          description: 'Name und Website sind Pflichtfelder.',
          variant: 'destructive',
        });
        return;
      }
      
      // Process website URL
      let website = formData.website;
      if (!website.startsWith('http://') && !website.startsWith('https://')) {
        website = 'https://' + website;
      }
      
      let logo_url = formData.logo_url;
      
      // Handle logo upload if there's a new file
      if (formData.logo_file) {
        try {
          // For new partners, we need a temporary ID for the file name
          const tempId = isEditMode ? currentPartnerId! : crypto.randomUUID();
          logo_url = await uploadLogo(formData.logo_file, tempId);
        } catch (error: any) {
          toast({
            title: 'Fehler beim Hochladen',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }
      }
      
      if (isEditMode && currentPartnerId) {
        // Update existing partner
        const { error } = await supabase
          .from('partner_servers')
          .update({
            name: formData.name,
            description: formData.description || null,
            website: website,
            owner: formData.owner || null,
            members: formData.members,
            type: formData.type,
            logo_url: logo_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentPartnerId);
        
        if (error) throw error;
        
        toast({
          title: 'Erfolg',
          description: 'Partner erfolgreich aktualisiert.',
        });
      } else {
        // Create new partner
        const { data, error } = await supabase
          .from('partner_servers')
          .insert({
            name: formData.name,
            description: formData.description || null,
            website: website,
            owner: formData.owner || null,
            members: formData.members,
            type: formData.type,
            logo_url: logo_url
          })
          .select();
        
        if (error) throw error;
        
        // If we have a new partner and a logo file, we need to re-upload with the correct ID
        if (formData.logo_file && data && data.length > 0) {
          const partnerId = data[0].id;
          try {
            const finalLogoUrl = await uploadLogo(formData.logo_file, partnerId);
            
            // Update the partner with the final logo URL
            await supabase
              .from('partner_servers')
              .update({ logo_url: finalLogoUrl })
              .eq('id', partnerId);
          } catch (error) {
            console.error('Error re-uploading logo with final ID:', error);
          }
        }
        
        toast({
          title: 'Erfolg',
          description: 'Neuer Partner erfolgreich hinzugefügt.',
        });
      }
      
      // Refresh partner list and close dialog
      fetchPartners();
      setFormOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error submitting partner:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Es ist ein Fehler aufgetreten.',
        variant: 'destructive',
      });
    }
  };

  const confirmDelete = (id: string) => {
    setPartnerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!partnerToDelete) return;
    
    try {
      // Get the partner to get the logo URL
      const { data: partner } = await supabase
        .from('partner_servers')
        .select('logo_url')
        .eq('id', partnerToDelete)
        .single();
      
      // Delete the partner
      const { error } = await supabase
        .from('partner_servers')
        .delete()
        .eq('id', partnerToDelete);
      
      if (error) throw error;
      
      // Try to delete the logo if it exists and is not the default
      if (partner && partner.logo_url && !partner.logo_url.includes('/placeholder.svg')) {
        try {
          // Extract the file path from the URL
          const urlParts = partner.logo_url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `partner_logos/${fileName}`;
          
          await supabase.storage
            .from('partners')
            .remove([filePath]);
        } catch (storageError) {
          console.error('Error deleting logo file:', storageError);
        }
      }
      
      toast({
        title: 'Erfolg',
        description: 'Partner erfolgreich gelöscht.',
      });
      
      // Refresh list and close dialog
      fetchPartners();
      setDeleteDialogOpen(false);
      setPartnerToDelete(null);
    } catch (error: any) {
      console.error('Error deleting partner:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Es ist ein Fehler aufgetreten.',
        variant: 'destructive',
      });
    }
  };

  const getPartnerTypeLabel = (type: string) => {
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
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle>Partner Server</CardTitle>
          <CardDescription>Verwalte deine Partner Server und Kooperationen</CardDescription>
        </div>
        <Button onClick={openAddDialog} className="flex items-center space-x-2">
          <PlusCircle className="h-4 w-4 mr-2" />
          Neuen Partner hinzufügen
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
                  <TableHead className="w-[50px]">Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Mitglieder</TableHead>
                  <TableHead>Art</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Keine Partner gefunden. Füge deinen ersten Partner hinzu!
                    </TableCell>
                  </TableRow>
                ) : (
                  partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                          {partner.logo_url ? (
                            <img 
                              src={partner.logo_url} 
                              alt={`${partner.name} Logo`} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {partner.description || '-'}
                      </TableCell>
                      <TableCell>{partner.owner || '-'}</TableCell>
                      <TableCell>{partner.members}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {getPartnerTypeLabel(partner.type)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            asChild
                          >
                            <a href={partner.website} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => openEditDialog(partner)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="icon"
                            onClick={() => confirmDelete(partner.id)}
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

      {/* Add/Edit Partner Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Partner bearbeiten' : 'Neuen Partner hinzufügen'}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Bearbeite die Details des Partner Servers.' 
                : 'Füge einen neuen Partner Server oder eine Kooperation hinzu.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="website">Website *</Label>
                <Input 
                  id="website" 
                  value={formData.website} 
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="https://example.com"
                  required
                />
              </div>
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
                <Label htmlFor="owner">Server Owner</Label>
                <Input 
                  id="owner" 
                  value={formData.owner} 
                  onChange={(e) => setFormData({...formData, owner: e.target.value})}
                  placeholder="Name des Server Owners"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="members">Mitgliederzahl</Label>
                <Input 
                  id="members" 
                  type="number" 
                  min="0"
                  value={formData.members} 
                  onChange={(e) => setFormData({...formData, members: parseInt(e.target.value) || 0})}
                  placeholder="Anzahl der Mitglieder"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Server Art</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({...formData, type: value})}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Server Art wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Kleiner Server</SelectItem>
                    <SelectItem value="large">Großer Server</SelectItem>
                    <SelectItem value="cooperation">Kooperation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo">Server Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Logo Vorschau" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Label 
                      htmlFor="logo-upload" 
                      className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Logo hochladen
                    </Label>
                    <Input 
                      id="logo-upload" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
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
            <AlertDialogTitle>Partner löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Bist du sicher, dass du diesen Partner löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
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

export default PartnerServersManagement;
