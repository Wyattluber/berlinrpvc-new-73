
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoaderIcon, PencilLine, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Application {
  id: string;
  roblox_username: string;
  age: number;
  discord_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

const ApplicationsList = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setApplications(data || []);
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async () => {
    if (!selectedApplication) return;
    
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: status || selectedApplication.status, 
          notes: notes,
          updated_at: new Date().toISOString() 
        })
        .eq('id', selectedApplication.id);

      if (error) {
        throw new Error(error.message);
      }

      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app.id === selectedApplication.id ? { 
            ...app, 
            status: status || app.status,
            notes: notes,
            updated_at: new Date().toISOString()
          } : app
        )
      );
      
      toast({
        title: 'Erfolg',
        description: 'Bewerbungsstatus erfolgreich aktualisiert.',
      });
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setOpen(false);
      setSelectedApplication(null);
      setStatus('');
      setNotes('');
    }
  };

  const deleteApplication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setApplications((prevApplications) =>
        prevApplications.filter((app) => app.id !== id)
      );
      
      toast({
        title: 'Erfolg',
        description: 'Bewerbung erfolgreich gelöscht.',
      });
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsConfirmDeleteOpen(false);
      setApplicationToDelete(null);
    }
  };

  const openApplicationEditDialog = (application: Application) => {
    setSelectedApplication(application);
    setStatus(application.status);
    setNotes(application.notes || '');
    setOpen(true);
  };

  const confirmDelete = (id: string) => {
    setApplicationToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Angenommen';
      case 'rejected':
        return 'Abgelehnt';
      case 'pending':
        return 'Ausstehend';
      default:
        return status;
    }
  };

  return (
    <div className="relative">
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <LoaderIcon className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roblox Name</TableHead>
                <TableHead>Alter</TableHead>
                <TableHead>Discord ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Kommentar</TableHead>
                <TableHead className="text-right w-[120px]">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Keine Bewerbungen gefunden
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>{application.roblox_username}</TableCell>
                    <TableCell>{application.age}</TableCell>
                    <TableCell>{application.discord_id}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(application.status)}`}>
                        {getStatusText(application.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="truncate block max-w-[150px]">
                        {application.notes || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => openApplicationEditDialog(application)}>
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => confirmDelete(application.id)}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Bewerbung bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeite den Status und füge Kommentare hinzu.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={selectedApplication?.status || 'Status wählen'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Ausstehend</SelectItem>
                  <SelectItem value="accepted">Angenommen</SelectItem>
                  <SelectItem value="rejected">Abgelehnt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                Kommentar
              </Label>
              <Textarea 
                id="notes" 
                className="col-span-3" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Interner Kommentar zur Bewerbung..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={updateApplicationStatus}
            >
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bewerbung löschen</DialogTitle>
            <DialogDescription>
              Bist du sicher, dass du diese Bewerbung löschen möchtest? Dies kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>Abbrechen</Button>
            <Button variant="destructive" onClick={() => applicationToDelete && deleteApplication(applicationToDelete)}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationsList;
