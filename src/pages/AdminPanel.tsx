
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '@/App';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { 
  addAdmin, addModerator, removeUserRole, checkIsAdmin, 
  getTeamSettings, updateTeamSettings 
} from '@/lib/admin';
import { updateServerStats, fetchServerStats } from '@/lib/stats';
import { 
  AlertCircle, CheckCircle, ShieldCheck, Shield, Loader2, Users, 
  Edit, Eye, Calendar, FileText 
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, 
  DialogTitle, DialogTrigger, DialogClose 
} from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

interface TeamSettings {
  id?: string;
  meeting_day: string;
  meeting_time: string;
  meeting_frequency: string;
  meeting_location: string;
  meeting_notes: string;
  created_at?: string;
  updated_at?: string;
}

const AdminPanel = () => {
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAdminCheck, setLoadingAdminCheck] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("user-management");
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<any>(null);
  const [applicationStatus, setApplicationStatus] = useState('');
  const [applicationNotes, setApplicationNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    discordMembers: 179,
    partnerServers: 2,
    servers: 1
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [teamSettings, setTeamSettings] = useState<TeamSettings>({
    meeting_day: '',
    meeting_time: '',
    meeting_frequency: '',
    meeting_location: '',
    meeting_notes: ''
  });
  const [userCount, setUserCount] = useState(0);
  const [applicationQuestions, setApplicationQuestions] = useState({
    section1: [
      { id: 'roblox_username', label: 'Roblox Benutzername', required: true },
      { id: 'roblox_id', label: 'Roblox ID', required: true },
      { id: 'discord_id', label: 'Discord ID', required: true },
      { id: 'age', label: 'Alter', required: true },
      { id: 'activity_level', label: 'Aktivitätslevel (1-10)', required: true }
    ],
    section2: [
      { id: 'frp_understanding', label: 'Was ist für dich FRP (Fail-Roleplay)?', required: true },
      { id: 'vdm_understanding', label: 'Was ist für dich VDM (Vehicle-Deathmatch)?', required: true },
      { id: 'taschen_rp_understanding', label: 'Was ist Taschen-RP und warum ist es verboten?', required: true },
      { id: 'server_age_understanding', label: 'Wie alt muss man sein, um auf dem Server spielen zu dürfen?', required: true }
    ],
    section3: [
      { id: 'situation_handling', label: 'Wie würdest du mit einem Spieler umgehen, der sich weigert, auf Teammitglieder zu hören?', required: true },
      { id: 'bodycam_understanding', label: 'Was ist eine Bodycam und wann kommt sie zum Einsatz?', required: true },
      { id: 'friend_rule_violation', label: 'Wie würdest du vorgehen, wenn ein Freund von dir gegen die Regeln verstößt?', required: true },
      { id: 'other_servers', label: 'Auf welchen anderen Servern spielst du noch?', required: false },
      { id: 'admin_experience', label: 'Hast du bereits Erfahrung als Administrator/Teammitglied?', required: false }
    ]
  });
  
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
            fetchAdminUsers();
            fetchRegisteredUsers();
            fetchTeamSettings();
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        if (isMounted) {
          setErrorMessage("Fehler beim Überprüfen des Admin-Status.");
        }
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

  useEffect(() => {
    const loadStats = async () => {
      try {
        const serverStats = await fetchServerStats();
        setStats(serverStats);
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    };

    if (isAdmin && !loadingAdminCheck) {
      loadStats();
    }
  }, [isAdmin, loadingAdminCheck]);

  const fetchAdminUsers = async () => {
    try {
      console.log("Fetching admin users");
      const { data, error } = await supabase
        .from('admin_users')
        .select('*');
      
      if (error) {
        console.error("Error fetching admin users:", error);
        throw error;
      }
      
      console.log("Admin users fetched:", data);
      setAdminUsers(data || []);
    } catch (error: any) {
      console.error("Error fetching admin users:", error);
    }
  };

  const fetchRegisteredUsers = async () => {
    setLoadingUsers(true);
    try {
      // First, get the total count of users
      const { count, error: countError } = await supabase
        .from('auth.users')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error("Error counting users:", countError);
        throw countError;
      }

      // We can't directly access auth.users, so we'll use a workaround
      // by fetching user IDs from admin_users and applications tables
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("Error fetching auth users:", authError);
        throw authError;
      }
      
      setUserCount(authUsers?.users?.length || 0);
      setRegisteredUsers(authUsers?.users || []);
    } catch (error) {
      console.error("Error fetching registered users:", error);
      toast({
        title: "Fehler",
        description: "Benutzer konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchTeamSettings = async () => {
    try {
      const settings = await getTeamSettings();
      
      if (settings) {
        setTeamSettings({
          id: settings.id,
          meeting_day: settings.meeting_day || '',
          meeting_time: settings.meeting_time || '',
          meeting_frequency: settings.meeting_frequency || '',
          meeting_location: settings.meeting_location || '',
          meeting_notes: settings.meeting_notes || ''
        });
      }
    } catch (error) {
      console.error("Error fetching team settings:", error);
    }
  };

  const handleAddAdmin = async () => {
    if (!userId.trim()) {
      setErrorMessage("Bitte gib eine Benutzer-ID ein.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await addAdmin(userId);
      if (result.success) {
        setSuccessMessage(result.message);
        toast({
          title: "Erfolgreich",
          description: result.message,
        });
        fetchAdminUsers();
      } else {
        setErrorMessage(result.message);
        toast({
          title: "Fehler",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Ein unbekannter Fehler ist aufgetreten.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddModerator = async () => {
    if (!userId.trim()) {
      setErrorMessage("Bitte gib eine Benutzer-ID ein.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await addModerator(userId);
      if (result.success) {
        setSuccessMessage(result.message);
        toast({
          title: "Erfolgreich",
          description: result.message,
        });
        fetchAdminUsers();
      } else {
        setErrorMessage(result.message);
        toast({
          title: "Fehler",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Ein unbekannter Fehler ist aufgetreten.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRole = async () => {
    if (!userId.trim()) {
      setErrorMessage("Bitte gib eine Benutzer-ID ein.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await removeUserRole(userId);
      if (result.success) {
        setSuccessMessage(result.message);
        toast({
          title: "Erfolgreich",
          description: result.message,
        });
        fetchAdminUsers();
      } else {
        setErrorMessage(result.message);
        toast({
          title: "Fehler",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Ein unbekannter Fehler ist aufgetreten.");
    } finally {
      setIsLoading(false);
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

  const handleSaveStats = async () => {
    setStatsLoading(true);
    
    try {
      const result = await updateServerStats(stats);
      
      if (result.success) {
        toast({
          title: "Statistiken aktualisiert",
          description: "Die Statistiken wurden erfolgreich aktualisiert."
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error updating stats:", error);
      toast({
        title: "Fehler",
        description: error.message || "Die Statistiken konnten nicht aktualisiert werden.",
        variant: "destructive"
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSaveTeamSettings = async () => {
    setIsLoading(true);
    
    try {
      const result = await updateTeamSettings({
        meeting_day: teamSettings.meeting_day,
        meeting_time: teamSettings.meeting_time,
        meeting_frequency: teamSettings.meeting_frequency,
        meeting_location: teamSettings.meeting_location,
        meeting_notes: teamSettings.meeting_notes
      });
      
      if (result.success) {
        toast({
          title: "Team-Einstellungen gespeichert",
          description: "Die Team-Einstellungen wurden erfolgreich gespeichert."
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error saving team settings:", error);
      toast({
        title: "Fehler",
        description: error.message || "Die Team-Einstellungen konnten nicht gespeichert werden.",
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
                <ShieldCheck className="text-red-500" />
                Admin-Panel
              </CardTitle>
              <CardDescription>
                Hier kannst du alle Admin-Funktionen verwalten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="user-management">Benutzerverwaltung</TabsTrigger>
                  <TabsTrigger value="team-settings">Team-Einstellungen</TabsTrigger>
                  <TabsTrigger value="statistics">Statistiken</TabsTrigger>
                </TabsList>
                
                <TabsContent value="user-management" className="space-y-4 mt-4">
                  {successMessage && (
                    <Alert className="mb-4 bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Erfolg</AlertTitle>
                      <AlertDescription className="text-green-700">
                        {successMessage}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {errorMessage && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Fehler</AlertTitle>
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Benutzer-ID
                    </label>
                    <Input
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Gib die Benutzer-ID ein (z.B. 3ea1fee3-d6fa-4004-8a79-a41551f0b846)"
                    />
                    <p className="text-xs text-gray-500">
                      Die Benutzer-ID findest du im Profil des Benutzers oder in der Supabase-Konsole.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleAddAdmin}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck size={16} />}
                      Als Admin hinzufügen
                    </Button>
                    
                    <Button
                      onClick={handleAddModerator}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield size={16} />}
                      Als Moderator hinzufügen
                    </Button>
                    
                    <Button
                      onClick={handleRemoveRole}
                      disabled={isLoading}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rolle entfernen"}
                    </Button>
                  </div>
                  
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="text-blue-500" size={20} />
                        Admin-Benutzer Liste
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {adminUsers.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Benutzer-ID</TableHead>
                              <TableHead>Rolle</TableHead>
                              <TableHead>Erstellt am</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {adminUsers.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-mono text-sm">{user.user_id}</TableCell>
                                <TableCell>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    user.role === 'admin' 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {user.role === 'admin' ? (
                                      <>
                                        <ShieldCheck className="mr-1 h-3 w-3" />
                                        Admin
                                      </>
                                    ) : (
                                      <>
                                        <Shield className="mr-1 h-3 w-3" />
                                        Moderator
                                      </>
                                    )}
                                  </span>
                                </TableCell>
                                <TableCell>{formatDate(user.created_at)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                          <p>Keine Admin-Benutzer gefunden</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="text-blue-500" size={20} />
                        Registrierte Benutzer ({userCount})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingUsers ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                      ) : registeredUsers.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Benutzer-ID</TableHead>
                              <TableHead>E-Mail</TableHead>
                              <TableHead>Registriert am</TableHead>
                              <TableHead>Bestätigt</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {registeredUsers.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-mono text-xs">{user.id}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{formatDate(user.created_at)}</TableCell>
                                <TableCell>
                                  {user.email_confirmed_at ? (
                                    <Badge className="bg-green-100 text-green-800">Ja</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-yellow-600">Nein</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                          <p>Keine Benutzer gefunden</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="team-settings" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="text-blue-500" size={20} />
                        Team-Einstellungen
                      </CardTitle>
                      <CardDescription>
                        Hier kannst du allgemeine Einstellungen für das Team festlegen, wie z.B. reguläre Meetings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Meeting Tag</label>
                          <Select 
                            value={teamSettings.meeting_day}
                            onValueChange={(value) => setTeamSettings({...teamSettings, meeting_day: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Tag auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monday">Montag</SelectItem>
                              <SelectItem value="tuesday">Dienstag</SelectItem>
                              <SelectItem value="wednesday">Mittwoch</SelectItem>
                              <SelectItem value="thursday">Donnerstag</SelectItem>
                              <SelectItem value="friday">Freitag</SelectItem>
                              <SelectItem value="saturday">Samstag</SelectItem>
                              <SelectItem value="sunday">Sonntag</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Meeting Zeit</label>
                          <Input 
                            type="time" 
                            value={teamSettings.meeting_time}
                            onChange={(e) => setTeamSettings({...teamSettings, meeting_time: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Häufigkeit</label>
                          <Select 
                            value={teamSettings.meeting_frequency}
                            onValueChange={(value) => setTeamSettings({...teamSettings, meeting_frequency: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Häufigkeit auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">Wöchentlich</SelectItem>
                              <SelectItem value="biweekly">Alle zwei Wochen</SelectItem>
                              <SelectItem value="monthly">Monatlich</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Ort / Plattform</label>
                          <Input 
                            placeholder="z.B. Discord / Voice Channel" 
                            value={teamSettings.meeting_location}
                            onChange={(e) => setTeamSettings({...teamSettings, meeting_location: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Notizen für Team-Mitglieder</label>
                        <Textarea 
                          placeholder="Zusätzliche Informationen für Team-Mitglieder"
                          rows={4}
                          value={teamSettings.meeting_notes}
                          onChange={(e) => setTeamSettings({...teamSettings, meeting_notes: e.target.value})}
                        />
                      </div>
                      
                      <Button 
                        onClick={handleSaveTeamSettings}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Einstellungen speichern
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="statistics" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="text-blue-500" size={20} />
                        Server-Statistiken
                      </CardTitle>
                      <CardDescription>
                        Hier kannst du die öffentlich sichtbaren Statistiken anpassen
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Discord Mitglieder</label>
                          <Input 
                            type="number" 
                            value={stats.discordMembers}
                            onChange={(e) => setStats({...stats, discordMembers: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Partner-Server</label>
                          <Input 
                            type="number" 
                            value={stats.partnerServers}
                            onChange={(e) => setStats({...stats, partnerServers: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Server</label>
                          <Input 
                            type="number" 
                            value={stats.servers}
                            onChange={(e) => setStats({...stats, servers: parseInt(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleSaveStats}
                        disabled={statsLoading}
                        className="w-full"
                      >
                        {statsLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Statistiken speichern
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
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

export default AdminPanel;
