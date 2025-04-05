
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAnnouncementById, markAnnouncementAsRead, addComment, getComments, Announcement, AnnouncementComment } from '@/lib/announcementService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  Clock, 
  HourglassIcon, 
  CheckCircle, 
  XCircle, 
  BellRing, 
  MessageSquare, 
  LoaderIcon, 
  ArrowLeft, 
  Send,
  CalendarIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const STATUS_LABELS = {
  'planned': { name: 'Geplant', icon: <Clock className="h-5 w-5 text-blue-500" /> },
  'in-progress': { name: 'In Umsetzung', icon: <HourglassIcon className="h-5 w-5 text-yellow-500" /> },
  'completed': { name: 'Umgesetzt', icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
  'cancelled': { name: 'Nicht umgesetzt', icon: <XCircle className="h-5 w-5 text-red-500" /> },
  'announcement': { name: 'Ankündigung', icon: <BellRing className="h-5 w-5 text-purple-500" /> },
};

interface AnnouncementDetailProps {
  id: string;
  onBack?: () => void;
}

const AnnouncementDetail: React.FC<AnnouncementDetailProps> = ({ id, onBack }) => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [comments, setComments] = useState<AnnouncementComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const announcementData = await fetchAnnouncementById(id);
        if (announcementData) {
          setAnnouncement(announcementData);
          await markAnnouncementAsRead(id);
          
          // Fetch comments
          const commentsData = await getComments(id);
          setComments(commentsData);
          
          // Get unique user IDs from comments
          const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
          
          // Fetch user profiles
          if (userIds.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, username, avatar_url')
              .in('id', userIds);
              
            if (profiles) {
              const profileMap: Record<string, any> = {};
              profiles.forEach(profile => {
                profileMap[profile.id] = profile;
              });
              setUserProfiles(profileMap);
            }
          }
        } else {
          navigate('/profile?tab=announcements');
        }
      } catch (error) {
        console.error('Error fetching announcement:', error);
        toast({
          title: "Fehler",
          description: "Die Ankündigung konnte nicht geladen werden",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);
  
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setSubmittingComment(true);
    try {
      const result = await addComment(id, newComment);
      
      if (result.success && result.data) {
        setComments([...comments, result.data]);
        setNewComment('');
        
        // If this is a new user commenting, fetch their profile
        if (!userProfiles[result.data.user_id]) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', result.data.user_id)
            .maybeSingle();
            
          if (profile) {
            setUserProfiles({
              ...userProfiles,
              [profile.id]: profile
            });
          }
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast({
        title: "Fehler",
        description: error.message || "Der Kommentar konnte nicht hinzugefügt werden",
        variant: "destructive"
      });
    } finally {
      setSubmittingComment(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: de });
  };
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/profile?tab=announcements');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoaderIcon className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }
  
  if (!announcement) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Ankündigung nicht gefunden.</p>
          <Button className="mt-4" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const statusInfo = STATUS_LABELS[announcement.status as keyof typeof STATUS_LABELS] || STATUS_LABELS.planned;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div className="flex items-center">
            {announcement.is_server_wide && (
              <span className="mr-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                Server-weit
              </span>
            )}
            <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
              {statusInfo.icon}
              <span className="ml-2 text-sm font-medium">{statusInfo.name}</span>
            </div>
          </div>
        </div>
        <CardTitle className="text-xl mt-4">{announcement.title}</CardTitle>
        <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
          <span className="flex items-center">
            <CalendarIcon className="h-3.5 w-3.5 mr-1" />
            Erstellt: {formatDate(announcement.created_at)}
          </span>
          {announcement.published_at && (
            <span className="flex items-center">
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              Veröffentlicht: {formatDate(announcement.published_at)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-line mb-6">
          {announcement.content}
        </div>
        
        <Separator className="my-6" />
        
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Kommentare
          </h3>
          
          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Noch keine Kommentare vorhanden.</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => {
                const user = userProfiles[comment.user_id];
                return (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      {user?.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.username || 'User'} 
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">
                            {(user?.username || 'U')[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium">{user?.username || 'Unbekannter Benutzer'}</span>
                        <span className="text-gray-400 text-xs ml-2">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <div className="mt-1 text-sm whitespace-pre-line">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="mt-4">
            <Textarea
              placeholder="Kommentar hinzufügen..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="mb-2"
            />
            <Button 
              onClick={handleSubmitComment} 
              disabled={submittingComment || !newComment.trim()}
              className="mt-2"
            >
              {submittingComment ? (
                <>
                  <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                  Senden...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Kommentar senden
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnnouncementDetail;
