
import React, { useState, useEffect } from 'react';
import { fetchNews, addNewsItem, updateNewsItem, deleteNewsItem } from '@/lib/adminService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, AlertTriangle, LoaderIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `Vor ${diffInMinutes} Minuten`;
    }
    return `Vor ${diffInHours} Stunden`;
  } else if (diffInDays === 1) {
    return 'Gestern';
  } else if (diffInDays < 7) {
    return `Vor ${diffInDays} Tagen`;
  } else if (diffInDays < 30) {
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `Vor ${diffInWeeks} Wochen`;
  } else {
    return date.toLocaleDateString('de-DE');
  }
};

const NewsManagement: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeNewsItem, setActiveNewsItem] = useState<NewsItem | null>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load news data
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        const newsData = await fetchNews();
        setNews(newsData);
      } catch (error) {
        console.error("Error loading news:", error);
        toast({
          title: "Fehler",
          description: "Neuigkeiten konnten nicht geladen werden",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadNews();
  }, []);
  
  const handleNewDialog = () => {
    setTitle('');
    setContent('');
    setNewDialogOpen(true);
  };
  
  const handleEditDialog = (newsItem: NewsItem) => {
    setActiveNewsItem(newsItem);
    setTitle(newsItem.title);
    setContent(newsItem.content);
    setEditDialogOpen(true);
  };
  
  const handleAddNews = async () => {
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
      const result = await addNewsItem(title, content);
      
      if (result.success) {
        toast({
          title: "Erfolg",
          description: "Neuigkeit wurde erfolgreich hinzugefügt"
        });
        
        // Update the local state with the new item
        const updatedNews = [...news];
        if (result.data && result.data[0]) {
          updatedNews.unshift(result.data[0]);
        }
        setNews(updatedNews);
        setNewDialogOpen(false);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error adding news:", error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Hinzufügen der Neuigkeit",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateNews = async () => {
    if (!activeNewsItem) return;
    
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
      const result = await updateNewsItem(activeNewsItem.id, title, content);
      
      if (result.success) {
        toast({
          title: "Erfolg",
          description: "Neuigkeit wurde erfolgreich aktualisiert"
        });
        
        // Update the local state
        const updatedNews = news.map(item => 
          item.id === activeNewsItem.id 
            ? { ...item, title, content, updated_at: new Date().toISOString() } 
            : item
        );
        setNews(updatedNews);
        setEditDialogOpen(false);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error updating news:", error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Aktualisieren der Neuigkeit",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteNews = async (id: string) => {
    try {
      const result = await deleteNewsItem(id);
      
      if (result.success) {
        toast({
          title: "Erfolg",
          description: "Neuigkeit wurde erfolgreich gelöscht"
        });
        
        // Update the local state
        const updatedNews = news.filter(item => item.id !== id);
        setNews(updatedNews);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error deleting news:", error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Löschen der Neuigkeit",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Neuigkeiten & Ankündigungen</h2>
        <Button onClick={handleNewDialog}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Neue Meldung
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Alle Meldungen</CardTitle>
          <CardDescription>
            Verwalte Neuigkeiten und Ankündigungen, die den Benutzern angezeigt werden
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-6">
              <LoaderIcon className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : news.length === 0 ? (
            <div className="text-center p-6">
              <p className="text-gray-500">Keine Neuigkeiten vorhanden</p>
              <Button variant="outline" className="mt-4" onClick={handleNewDialog}>
                Erste Neuigkeit erstellen
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <div key={item.id} className="border rounded-md p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm text-gray-500">
                        {formatRelativeTime(item.created_at)}
                        {item.updated_at && item.updated_at !== item.created_at && 
                          ` (Aktualisiert: ${formatRelativeTime(item.updated_at)})`}
                      </p>
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
                            <AlertDialogTitle>Neuigkeit löschen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bist du sicher, dass du diese Neuigkeit löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteNews(item.id)} className="bg-red-500 hover:bg-red-600">
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
      
      {/* Dialog for adding new news */}
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Neue Meldung erstellen</DialogTitle>
            <DialogDescription>
              Erstelle eine neue Meldung, die allen Benutzern angezeigt wird.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titel der Meldung"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Inhalt</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Inhalt der Meldung"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" onClick={handleAddNews} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                'Meldung erstellen'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for editing news */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Meldung bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeite die ausgewählte Meldung.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titel</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titel der Meldung"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Inhalt</Label>
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Inhalt der Meldung"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" onClick={handleUpdateNews} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                'Meldung aktualisieren'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsManagement;
