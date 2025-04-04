
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LoaderIcon, Eye, FileText, Link, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type Application = {
  id: string;
  created_at: string;
  status: string;
  discord_id: string;
  roblox_username: string;
  age: number;
  notes?: string;
  [key: string]: any;
};

const ApplicationsList = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
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
        throw error;
      }
      
      setApplications(data || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Laden der Bewerbungen',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (app: Application) => {
    setSelectedApp(app);
    setNotes(app.notes || '');
    setStatus(app.status || 'pending');
    setShowDialog(true);
  };

  const handleSaveApplication = async () => {
    if (!selectedApp) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          notes: notes,
          status: status
        })
        .eq('id', selectedApp.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setApplications(prevApps => 
        prevApps.map(app => 
          app.id === selectedApp.id ? { ...app, notes, status } : app
        )
      );
      
      toast({
        title: 'Erfolg',
        description: 'Bewerbung wurde aktualisiert'
      });
      
      setShowDialog(false);
    } catch (error: any) {
      console.error('Error updating application:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Speichern der Bewerbung',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Angenommen';
      case 'rejected':
        return 'Abgelehnt';
      case 'pending':
      default:
        return 'Ausstehend';
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-8">
          <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Keine Bewerbungen gefunden</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Discord ID</TableHead>
                <TableHead>Roblox</TableHead>
                <TableHead>Alter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    {formatDate(app.created_at)}
                  </TableCell>
                  <TableCell>{app.discord_id}</TableCell>
                  <TableCell>{app.roblox_username}</TableCell>
                  <TableCell>{app.age}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(app.status)}`}>
                      {getStatusLabel(app.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewApplication(app)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Anzeigen
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Bewerbung bearbeiten</DialogTitle>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Discord ID</Label>
                  <div className="p-2 border rounded mt-1 bg-muted/20">
                    {selectedApp.discord_id}
                  </div>
                </div>
                <div>
                  <Label>Roblox</Label>
                  <div className="p-2 border rounded mt-1 bg-muted/20">
                    {selectedApp.roblox_username}
                  </div>
                </div>
                <div>
                  <Label>Alter</Label>
                  <div className="p-2 border rounded mt-1 bg-muted/20">
                    {selectedApp.age}
                  </div>
                </div>
                <div>
                  <Label>Eingereicht am</Label>
                  <div className="p-2 border rounded mt-1 bg-muted/20">
                    {formatDate(selectedApp.created_at)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Ausstehend</SelectItem>
                    <SelectItem value="approved">Angenommen</SelectItem>
                    <SelectItem value="rejected">Abgelehnt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notizen</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notizen zur Bewerbung hinzufügen..."
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={handleSaveApplication} 
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  'Änderungen speichern'
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationsList;
