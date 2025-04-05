
import React, { useState, useEffect } from 'react';
import { 
  fetchAnnouncements, 
  addAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement, 
  triggerAnnouncementEmails, 
  Announcement 
} from '@/lib/announcementService';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { toast } from '@/hooks/use-toast';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  LoaderIcon, 
  Info, 
  BellRing, 
  Send, 
  CheckCircle, 
  Clock, 
  HourglassIcon, 
  XCircle, 
  MessageSquare,
  CalendarIcon
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const STATUS_LABELS = {
  'planned': { name: 'Geplant', icon: <Clock className="h-4 w-4 text-blue-500" /> },
  'in-progress': { name: 'In Umsetzung', icon: <HourglassIcon className="h-4 w-4 text-yellow-500" /> },
  'completed': { name: 'Umgesetzt', icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
  'cancelled': { name: 'Nicht umgesetzt', icon: <XCircle className="h-4 w-4 text-red-500" /> },
  'announcement': { name: 'Ankündigung', icon: <BellRing className="h-4 w-4 text-purple-500" /> },
};

const AnnouncementsManagement: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'planned' | 'in-progress' | 'completed' | 'cancelled' | 'announcement'>('planned');
  const [isServerWide, setIsServerWide] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  
  useEffect(() => {
    const loadAnnouncements = async () => {
      setLoading(true);
      try {
        const announcementsData = await fetchAnnouncements();
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error("Error loading announcements:", error);
        toast({
          title: "Fehler",
          description: "Ankündigungen konnten nicht geladen werden",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadAnnouncements();
  }, []);
  
  const handleNewDialog = () => {
    setTitle('');
    setContent('');
    setStatus('planned');
    setIsServerWide(false);
    setNewDialogOpen(true);
  };
  
  const handleEditDialog = (announcement: Announcement) => {
    setActiveAnnouncement(announcement);
    setTitle(announcement.title);
    setContent(announcement.content);
    setStatus(announcement.status as any);
    setIsServerWide(announcement.is_server_wide);
    setEditDialogOpen(true);
  };
  
  const handleAddAnnouncement = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Fehler",
        description: "Titel und Inhalt dürfen nicht leer sein",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await addAnnouncement(title, content, status, isServerWide);
      
      if (result.success) {
        toast({
          title: "Erfolg",
          description: "Ankündigung wurde erfolgreich hinzugefügt"
        });
        
        const updatedAnnouncements = [...announcements];
        if (result.data && result.data[0]) {
          updatedAnnouncements.unshift(result.data[0]);
        }
        setAnnouncements(updatedAnnouncements);
        setNewDialogOpen(false);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error adding announcement:", error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Hinzufügen der Ankündigung",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateAnnouncement = async () => {
    if (!activeAnnouncement) return;
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Fehler",
        description: "Titel und Inhalt dürfen nicht leer sein",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await updateAnnouncement(
        activeAnnouncement.id, 
        title, 
        content, 
        status,
        isServerWide
      );
      
      if (result.success) {
        toast({
          title: "Erfolg",
          description: "Ankündigung wurde erfolgreich aktualisiert"
        });
        
        const updatedAnnouncements = announcements.map(item => 
          item.id === activeAnnouncement.id 
            ? { 
                ...item, 
                title, 
                content, 
                status, 
                is_server_wide: isServerWide,
                updated_at: new Date().toISOString() 
              } 
            : item
        );
        setAnnouncements(updatedAnnouncements);
        setEditDialogOpen(false);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error updating announcement:", error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Aktualisieren der Ankündigung",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const result = await deleteAnnouncement(id);
      
      if (result.success) {
        toast({
          title: "Erfolg",
          description: "Ankündigung wurde erfolgreich gelöscht"
        });
        
        const updatedAnnouncements = announcements.filter(item => item.id !== id);
        setAnnouncements(updatedAnnouncements);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Löschen der Ankündigung",
        variant: "destructive"
      });
    }
  };

  const handleTriggerEmails = async () => {
    setIsSendingEmails(true);
    try {
      const result = await triggerAnnouncementEmails();
      
      if (result.success) {
        toast({
          title: "Erfolg",
          description: "E-Mail-Versand für ausstehende Ankündigungen wurde ausgelöst"
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error triggering emails:", error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Auslösen des E-Mail-Versands",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmails(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: de });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ankündigungen & Updates</h2>
        <div className="flex space-x-2">
          <Button onClick={handleTriggerEmails} variant="outline" disabled={isSendingEmails}>
            {isSendingEmails ? (
              <>
                <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                Sende...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                E-Mails senden
              </>
            )}
          </Button>
          <Button onClick={handleNewDialog}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Neue Ankündigung
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Alle Ankündigungen</CardTitle>
          <CardDescription>
            Verwalte Ankündigungen, Updates und Statusmeldungen
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[800px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-6">
              <LoaderIcon className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center p-6">
              <Info className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-gray-500">Keine Ankündigungen vorhanden</p>
              <Button variant="outline" className="mt-4" onClick={handleNewDialog}>
                Erste Ankündigung erstellen
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((item) => (
                <div key={item.id} className="border rounded-md p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        {STATUS_LABELS[item.status]?.icon}
                        <h3 className="font-semibold text-lg ml-2">{item.title}</h3>
                        {item.is_server_wide && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            Server-weit
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Status:</span> {STATUS_LABELS[item.status]?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          <CalendarIcon className="inline h-3 w-3 mr-1" />
                          {formatDate(item.created_at)}
                        </p>
                        {item.published_at && (
                          <p className="text-sm text-gray-500">
                            <MessageSquare className="inline h-3 w-3 mr-1" />
                            Veröffentlicht: {formatDate(item.published_at)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditDialog(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Ankündigung löschen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bist du sicher, dass du diese Ankündigung löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteAnnouncement(item.id)} className="bg-red-500 hover:bg-red-600">
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <p className="text-sm whitespace-pre-line">{item.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Neue Ankündigung erstellen</DialogTitle>
            <DialogDescription>
              Erstelle eine neue Ankündigung oder ein Update für Benutzer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titel der Ankündigung"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Inhalt</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Inhalt der Ankündigung"
                rows={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <RadioGroup value={status} onValueChange={(value: any) => setStatus(value)}>
                {Object.entries(STATUS_LABELS).map(([key, { name, icon }]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={`status-${key}`} />
                    <Label htmlFor={`status-${key}`} className="flex items-center">
                      {icon}
                      <span className="ml-2">{name}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="server-wide" 
                checked={isServerWide}
                onCheckedChange={setIsServerWide}
              />
              <Label htmlFor="server-wide" className="flex items-center">
                <BellRing className="h-4 w-4 mr-2 text-blue-500" />
                Server-weite Ankündigung (E-Mail-Benachrichtigung & Banner)
              </Label>
            </div>
            
            {isServerWide && (
              <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm">
                <AlertTriangle className="h-4 w-4 inline-block mr-2" />
                Server-weite Ankündigungen werden als Banner angezeigt und per E-Mail an alle Benutzer gesendet.
                Bitte verwende diese Option nur für wichtige Mitteilungen.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" onClick={handleAddAnnouncement} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                'Ankündigung erstellen'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Ankündigung bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeite die ausgewählte Ankündigung.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titel</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titel der Ankündigung"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-content">Inhalt</Label>
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Inhalt der Ankündigung"
                rows={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <RadioGroup value={status} onValueChange={(value: any) => setStatus(value)}>
                {Object.entries(STATUS_LABELS).map(([key, { name, icon }]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={`edit-status-${key}`} />
                    <Label htmlFor={`edit-status-${key}`} className="flex items-center">
                      {icon}
                      <span className="ml-2">{name}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="edit-server-wide" 
                checked={isServerWide}
                onCheckedChange={setIsServerWide}
              />
              <Label htmlFor="edit-server-wide" className="flex items-center">
                <BellRing className="h-4 w-4 mr-2 text-blue-500" />
                Server-weite Ankündigung (E-Mail-Benachrichtigung & Banner)
              </Label>
            </div>
            
            {isServerWide && (
              <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm">
                <AlertTriangle className="h-4 w-4 inline-block mr-2" />
                {activeAnnouncement?.is_server_wide 
                  ? "Diese Ankündigung ist bereits server-weit. Änderungen werden nicht erneut per E-Mail versendet."
                  : "Diese Ankündigung wird als server-weit markiert und per E-Mail an alle Benutzer gesendet."
                }
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" onClick={handleUpdateAnnouncement} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                'Ankündigung aktualisieren'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnouncementsManagement;
