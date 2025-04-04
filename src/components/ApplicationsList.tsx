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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoaderIcon, PencilLine, Trash2 } from 'lucide-react';

interface Application {
  id: string;
  roblox_username: string;
  age: number;
  discord_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const ApplicationsList = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');

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

  const updateApplicationStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app
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
    }
  };

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <LoaderIcon className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Roblox Name</TableHead>
              <TableHead>Alter</TableHead>
              <TableHead>Discord ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>{application.roblox_username}</TableCell>
                <TableCell>{application.age}</TableCell>
                <TableCell>{application.discord_id}</TableCell>
                <TableCell>{application.status}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <PencilLine className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Bewerbungsstatus ändern</DialogTitle>
                          <DialogDescription>
                            Wähle einen neuen Status für die Bewerbung aus.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                              Status
                            </Label>
                            <Select onValueChange={setStatus}>
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder={application.status} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Ausstehend</SelectItem>
                                <SelectItem value="accepted">Angenommen</SelectItem>
                                <SelectItem value="rejected">Abgelehnt</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            onClick={() =>
                              updateApplicationStatus(application.id, status)
                            }
                          >
                            Speichern
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteApplication(application.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ApplicationsList;
