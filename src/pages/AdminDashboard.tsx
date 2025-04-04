
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '@/App';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { checkIsAdmin, addModerator } from '@/lib/admin';
import { 
  AlertCircle, CheckCircle, Loader2, Users, Edit, Eye 
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, 
  DialogTitle, DialogClose 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdminCheck, setLoadingAdminCheck] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<any>(null);
  const [applicationStatus, setApplicationStatus] = useState('');
  const [applicationNotes, setApplicationNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const session = useContext(SessionContext);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    const checkAdminStatus = async () => {
      setLoadingAdminCheck(true);
      
      try {
        if (!session?.user) {
          navigate('/login');
          toast({
            title: "Zugriff verweigert",
            description: "Du musst angemeldet sein, um auf diese Seite zuzugreifen.",
            variant: "destructive"
          });
          return;
        }

        console.log("Checking admin status for user:", session.user.id);
        const adminStatus = await checkIsAdmin();
        console.log("Admin status check result:", adminStatus);
        
        if (isMounted) {
          setIsAdmin(adminStatus);
          
          if (!adminStatus) {
            navigate('/profile');
            toast({
              title: "Zugriff verweigert",
              description: "Du benötigst Admin-Rechte, um auf diese Seite zuzugreifen.",
              variant: "destructive"
            });
          } else {
            fetchApplications();
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        if (isMounted) {
          setLoadingAdminCheck(false);
        }
      }
    };
    
    checkAdminStatus();
    
    return () => {
      isMounted = false;
    };
  }, [session, navigate]);

  const fetchApplications = async () => {
    setLoadingApplications(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Fehler",
        description: "Bewerbungen konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleViewApplication = (application: any) => {
    setCurrentApplication(application);
    setViewDialogOpen(true);
  };

  const handleEditApplication = (application: any) => {
    setCurrentApplication(application);
    setApplicationStatus(application.status);
    setApplicationNotes(application.notes || '');
    setDialogOpen(true);
  };

  const handleSaveApplicationStatus = async () => {
    if (!currentApplication) return;
    
    setIsLoading(true);
    
    try {
      if (applicationStatus === 'approved' && currentApplication.status !== 'approved') {
        const discordId = currentApplication.discord_id;
        
        try {
          const { data: userData, error: userError } = await supabase
            .from('applications')
            .select('user_id')
            .eq('id', currentApplication.id)
            .single();
            
          if (!userError && userData && userData.user_id) {
            await addModerator(userData.user_id);
          }
        } catch (error) {
          console.error("Could not automatically add user as moderator:", error);
        }
      }
      
      const { error } = await supabase
        .from('applications')
        .update({
          status: applicationStatus,
          notes: applicationNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentApplication.id);
      
      if (error) throw error;
      
      toast({
        title: "Status aktualisiert",
        description: `Die Bewerbung wurde erfolgreich auf "${applicationStatus}" gesetzt.`
      });
      
      fetchApplications();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error updating application:", error);
      toast({
        title: "Fehler",
        description: "Der Status konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Ausstehend</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Genehmigt</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Abgelehnt</Badge>;
      case 'waitlist':
        return <Badge className="bg-blue-100 text-blue-800">Warteliste</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loadingAdminCheck) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-4" />
            <p className="text-gray-600">Überprüfe Admin-Rechte...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="text-blue-500" />
                Admin-Dashboard
              </CardTitle>
              <CardDescription>
                Verwalte Bewerbungen und andere administrative Aufgaben
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="text-blue-500" size={20} />
                    Bewerbungen verwalten
                  </CardTitle>
                  <CardDescription>
                    Hier kannst du alle eingegangenen Bewerbungen verwalten und deren Status ändern
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingApplications ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                  ) : applications.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Discord ID</TableHead>
                            <TableHead>Roblox Benutzername</TableHead>
                            <TableHead>Alter</TableHead>
                            <TableHead>Datum</TableHead>
                            <TableHead>Aktionen</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {applications.map((app) => (
                            <TableRow key={app.id}>
                              <TableCell>{getStatusBadge(app.status)}</TableCell>
                              <TableCell>{app.discord_id}</TableCell>
                              <TableCell>{app.roblox_username}</TableCell>
                              <TableCell>{app.age}</TableCell>
                              <TableCell>{formatDate(app.created_at)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleViewApplication(app)}
                                    className="flex items-center gap-1"
                                  >
                                    <Eye size={14} />
                                    Ansehen
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditApplication(app)}
                                    className="flex items-center gap-1"
                                  >
                                    <Edit size={14} />
                                    Status
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p>Keine Bewerbungen gefunden</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      
      {/* View Application Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bewerbung von {currentApplication?.roblox_username}</DialogTitle>
            <DialogDescription>
              Eingereicht am {currentApplication ? formatDate(currentApplication.created_at) : ''}
            </DialogDescription>
          </DialogHeader>
          
          {currentApplication && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Persönliche Informationen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Roblox Benutzername</h4>
                    <p className="text-base">{currentApplication.roblox_username}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Roblox ID</h4>
                    <p className="text-base">{currentApplication.roblox_id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Discord ID</h4>
                    <p className="text-base">{currentApplication.discord_id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Alter</h4>
                    <p className="text-base">{currentApplication.age} Jahre</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Aktivitätslevel (1-10)</h4>
                    <p className="text-base">{currentApplication.activity_level}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Regelverständnis</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Was ist für dich FRP (Fail-Roleplay)?</h4>
                    <p className="text-base bg-gray-50 p-3 rounded">{currentApplication.frp_understanding}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Was ist für dich VDM (Vehicle-Deathmatch)?</h4>
                    <p className="text-base bg-gray-50 p-3 rounded">{currentApplication.vdm_understanding}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Was ist Taschen-RP und warum ist es verboten?</h4>
                    <p className="text-base bg-gray-50 p-3 rounded">{currentApplication.taschen_rp_understanding}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Wie alt muss man sein, um auf dem Server spielen zu dürfen?</h4>
                    <p className="text-base bg-gray-50 p-3 rounded">{currentApplication.server_age_understanding}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Situationshandhabung & Erfahrung</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Wie würdest du mit einem Spieler umgehen, der sich weigert, auf Teammitglieder zu hören?</h4>
                    <p className="text-base bg-gray-50 p-3 rounded">{currentApplication.situation_handling}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Was ist eine Bodycam und wann kommt sie zum Einsatz?</h4>
                    <p className="text-base bg-gray-50 p-3 rounded">{currentApplication.bodycam_understanding}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Wie würdest du vorgehen, wenn ein Freund von dir gegen die Regeln verstößt?</h4>
                    <p className="text-base bg-gray-50 p-3 rounded">{currentApplication.friend_rule_violation}</p>
                  </div>
                  
                  {currentApplication.other_servers && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Auf welchen anderen Servern spielst du noch?</h4>
                      <p className="text-base bg-gray-50 p-3 rounded">{currentApplication.other_servers}</p>
                    </div>
                  )}
                  
                  {currentApplication.admin_experience && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Hast du bereits Erfahrung als Administrator/Teammitglied?</h4>
                      <p className="text-base bg-gray-50 p-3 rounded">{currentApplication.admin_experience}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Status</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Aktueller Status:</span>
                  {getStatusBadge(currentApplication.status)}
                </div>
                
                {currentApplication.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Notizen</h4>
                    <p className="text-base bg-gray-50 p-3 rounded">{currentApplication.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button 
              onClick={() => setViewDialogOpen(false)}
              variant="outline"
            >
              Schließen
            </Button>
            <Button 
              onClick={() => {
                setViewDialogOpen(false);
                if (currentApplication) {
                  handleEditApplication(currentApplication);
                }
              }}
            >
              Status bearbeiten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Application Status Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bewerbungsstatus ändern</DialogTitle>
            <DialogDescription>
              Ändere den Status der Bewerbung von {currentApplication?.roblox_username}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={applicationStatus}
                onValueChange={setApplicationStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Ausstehend</SelectItem>
                  <SelectItem value="approved">Genehmigt</SelectItem>
                  <SelectItem value="rejected">Abgelehnt</SelectItem>
                  <SelectItem value="waitlist">Warteliste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notizen</label>
              <Textarea 
                placeholder="Interne Notizen zur Bewerbung"
                value={applicationNotes}
                onChange={(e) => setApplicationNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleSaveApplicationStatus}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
