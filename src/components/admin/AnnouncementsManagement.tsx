
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2, Plus, Search, Filter, RefreshCw, Eye, AlertCircle, CheckCircle, Clock, X, BellRing } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Announcement,
  AnnouncementStatus,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '@/lib/announcementService';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const AnnouncementsManagement = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formStatus, setFormStatus] = useState<AnnouncementStatus>('planned');
  const [formIsServerWide, setFormIsServerWide] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showServerWideOnly, setShowServerWideOnly] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await getAllAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: 'Fehler',
        description: 'Ankündigungen konnten nicht geladen werden',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormContent('');
    setFormStatus('planned');
    setFormIsServerWide(false);
    setEditingAnnouncementId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formTitle.trim() || !formContent.trim()) {
      toast({
        title: 'Eingabefehler',
        description: 'Bitte fülle alle Pflichtfelder aus',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      if (editingAnnouncementId) {
        // Update existing announcement
        await updateAnnouncement(editingAnnouncementId, {
          title: formTitle,
          content: formContent,
          status: formStatus,
          is_server_wide: formIsServerWide,
        });
        toast({
          title: 'Erfolg',
          description: 'Ankündigung erfolgreich aktualisiert',
        });
      } else {
        // Create new announcement
        await createAnnouncement(
          formTitle,
          formContent,
          formStatus,
          formIsServerWide
        );
        toast({
          title: 'Erfolg',
          description: 'Ankündigung erfolgreich erstellt',
        });
      }
      
      resetForm();
      setShowForm(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast({
        title: 'Fehler',
        description: 'Ankündigung konnte nicht gespeichert werden',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormTitle(announcement.title);
    setFormContent(announcement.content);
    setFormStatus(announcement.status as AnnouncementStatus);
    setFormIsServerWide(announcement.is_server_wide);
    setEditingAnnouncementId(announcement.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bist du sicher, dass du diese Ankündigung löschen möchtest?')) {
      try {
        await deleteAnnouncement(id);
        fetchAnnouncements();
        toast({
          title: 'Erfolg',
          description: 'Ankündigung erfolgreich gelöscht',
        });
      } catch (error) {
        console.error('Error deleting announcement:', error);
        toast({
          title: 'Fehler',
          description: 'Ankündigung konnte nicht gelöscht werden',
          variant: 'destructive',
        });
      }
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || announcement.status === statusFilter;
    
    const matchesServerWide = !showServerWideOnly || announcement.is_server_wide;
    
    return matchesSearch && matchesStatus && matchesServerWide;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Noch nicht veröffentlicht';
    return format(parseISO(dateString), 'dd.MM.yyyy HH:mm', { locale: de });
  };

  const renderStatusBadge = (status: AnnouncementStatus) => {
    switch (status) {
      case 'planned':
        return <Badge variant="outline" className="bg-gray-100"><Clock className="h-3 w-3 mr-1" /> Geplant</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><RefreshCw className="h-3 w-3 mr-1" /> In Bearbeitung</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Abgeschlossen</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" /> Abgebrochen</Badge>;
      case 'announcement':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800"><BellRing className="h-3 w-3 mr-1" /> Ankündigung</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ankündigungen</h2>
          <p className="text-muted-foreground">
            Verwalte Ankündigungen und Updates für Benutzer.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Neue Ankündigung
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAnnouncementId ? 'Ankündigung bearbeiten' : 'Neue Ankündigung erstellen'}</DialogTitle>
            <DialogDescription>
              Fülle alle Felder aus, um {editingAnnouncementId ? 'eine Ankündigung zu aktualisieren' : 'eine neue Ankündigung zu erstellen'}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Titel der Ankündigung"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Inhalt</Label>
              <Textarea
                id="content"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Inhalt der Ankündigung"
                rows={5}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formStatus} onValueChange={(value) => setFormStatus(value as AnnouncementStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Geplant</SelectItem>
                  <SelectItem value="in-progress">In Bearbeitung</SelectItem>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                  <SelectItem value="cancelled">Abgebrochen</SelectItem>
                  <SelectItem value="announcement">Ankündigung</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="server-wide"
                checked={formIsServerWide}
                onCheckedChange={setFormIsServerWide}
              />
              <Label htmlFor="server-wide">Serverweit anzeigen</Label>
            </div>
            {formIsServerWide && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-700">
                    Serverweite Ankündigungen werden allen Benutzern oben auf der Seite angezeigt und können per E-Mail versendet werden.
                  </p>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2 pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Abbrechen
                </Button>
              </DialogClose>
              <Button type="submit">
                {editingAnnouncementId ? 'Speichern' : 'Erstellen'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Ankündigungen durchsuchen" 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="planned">Geplant</SelectItem>
                <SelectItem value="in-progress">In Bearbeitung</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="cancelled">Abgebrochen</SelectItem>
                <SelectItem value="announcement">Ankündigung</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="server-wide-filter" 
                checked={showServerWideOnly} 
                onCheckedChange={(checked) => setShowServerWideOnly(checked as boolean)} 
              />
              <Label htmlFor="server-wide-filter">Nur Serverweit</Label>
            </div>
            <Button variant="outline" size="icon" onClick={fetchAnnouncements}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Serverweit</TableHead>
                  <TableHead>Erstellt am</TableHead>
                  <TableHead>Veröffentlicht am</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnnouncements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium">{announcement.title}</TableCell>
                    <TableCell>{renderStatusBadge(announcement.status as AnnouncementStatus)}</TableCell>
                    <TableCell>
                      {announcement.is_server_wide ? 
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">Ja</Badge> : 
                        <Badge variant="outline" className="bg-gray-100">Nein</Badge>}
                    </TableCell>
                    <TableCell>{formatDate(announcement.created_at)}</TableCell>
                    <TableCell>{formatDate(announcement.published_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(announcement)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(announcement.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
            <p className="text-sm text-muted-foreground mb-4">Keine Ankündigungen gefunden.</p>
            <Button variant="outline" onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Ankündigung erstellen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsManagement;
