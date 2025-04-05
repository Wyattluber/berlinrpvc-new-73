
import React, { useState, useEffect } from 'react';
import { fetchAnnouncements, Announcement } from '@/lib/announcementService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  Clock, 
  HourglassIcon, 
  CheckCircle, 
  XCircle, 
  BellRing, 
  Search, 
  LoaderIcon, 
  Info,
  CalendarIcon
} from 'lucide-react';
import AnnouncementDetail from './AnnouncementDetail';

const STATUS_LABELS = {
  'planned': { name: 'Geplant', icon: <Clock className="h-4 w-4 text-blue-500" /> },
  'in-progress': { name: 'In Umsetzung', icon: <HourglassIcon className="h-4 w-4 text-yellow-500" /> },
  'completed': { name: 'Umgesetzt', icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
  'cancelled': { name: 'Nicht umgesetzt', icon: <XCircle className="h-4 w-4 text-red-500" /> },
  'announcement': { name: 'Ankündigung', icon: <BellRing className="h-4 w-4 text-purple-500" /> },
};

interface AnnouncementsListProps {
  selectedId?: string;
}

const AnnouncementsList: React.FC<AnnouncementsListProps> = ({ selectedId }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<string | null>(selectedId || null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchAnnouncements();
        setAnnouncements(data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        toast({
          title: "Fehler",
          description: "Die Ankündigungen konnten nicht geladen werden",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    if (selectedId) {
      setSelectedAnnouncement(selectedId);
    }
  }, [selectedId]);
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: de });
  };
  
  const filterAnnouncements = () => {
    let filtered = [...announcements];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item => item.title.toLowerCase().includes(query) || 
               item.content.toLowerCase().includes(query)
      );
    }
    
    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.status === activeTab);
    }
    
    return filtered;
  };
  
  const handleSelectAnnouncement = (id: string) => {
    setSelectedAnnouncement(id);
  };
  
  const handleBack = () => {
    setSelectedAnnouncement(null);
  };
  
  if (selectedAnnouncement) {
    return <AnnouncementDetail id={selectedAnnouncement} onBack={handleBack} />;
  }
  
  const filteredAnnouncements = filterAnnouncements();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ankündigungen & Updates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Ankündigungen durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 md:grid-cols-6">
              <TabsTrigger value="all">Alle</TabsTrigger>
              <TabsTrigger value="announcement">Ankündigungen</TabsTrigger>
              <TabsTrigger value="planned">Geplant</TabsTrigger>
              <TabsTrigger value="in-progress">In Umsetzung</TabsTrigger>
              <TabsTrigger value="completed">Umgesetzt</TabsTrigger>
              <TabsTrigger value="cancelled">Nicht umgesetzt</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              {loading ? (
                <div className="flex justify-center p-6">
                  <LoaderIcon className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredAnnouncements.length === 0 ? (
                <div className="text-center p-6">
                  <Info className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-gray-500">Keine Ankündigungen gefunden</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAnnouncements.map((item) => (
                    <Button
                      key={item.id}
                      variant="outline"
                      className="w-full justify-start h-auto p-3 text-left"
                      onClick={() => handleSelectAnnouncement(item.id)}
                    >
                      <div className="flex flex-col w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {STATUS_LABELS[item.status]?.icon}
                            <span className="ml-2 font-medium">{item.title}</span>
                            {item.is_server_wide && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                Server-weit
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {item.content}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnnouncementsList;
