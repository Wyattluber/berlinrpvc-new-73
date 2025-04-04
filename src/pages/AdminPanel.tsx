
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '@/App';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { addAdmin, addModerator, removeUserRole, checkIsAdmin } from '@/lib/admin';
import { updateServerStats, fetchServerStats } from '@/lib/stats';
import { 
  AlertCircle, CheckCircle, ShieldCheck, Shield, Loader2, Users, 
  Edit, Trash, ChevronsUpDown, BarChart, Eye, MessageSquare, Settings, 
  Calendar, FileText 
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

const AdminPanel = () => {
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAdminCheck, setLoadingAdminCheck] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
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
  const [teamSettings, setTeamSettings] = useState({
    meetingDay: '',
    meetingTime: '',
    meetingFrequency: '',
    meetingLocation: '',
    meetingNotes: ''
  });
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
            fetchApplications();
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

  const fetchTeamSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('team_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
        console.error("Error fetching team settings:", error);
        return;
      }
      
      if (data) {
        setTeamSettings({
          meetingDay: data.meeting_day || '',
          meetingTime: data.meeting_time || '',
          meetingFrequency: data.meeting_frequency || '',
          meetingLocation: data.meeting_location || '',
          meetingNotes: data.meeting_notes || ''
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
      // If application is approved, make the user a moderator
      if (applicationStatus === 'approved' && currentApplication.status !== 'approved') {
        // Get user_id from application
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('id')
          .eq('user_metadata->discord_id', currentApplication.discord_id)
          .maybeSingle();
          
        if (!userError && userData) {
          // Add user as moderator
          await addModerator(userData.id);
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
      // First check if settings already exist
      const { data: existingSettings, error: checkError } = await supabase
        .from('team_settings')
        .select('id')
        .limit(1);
        
      if (checkError) throw checkError;
      
      let result;
      
      if (existingSettings && existingSettings.length > 0) {
        // Update existing settings
        result = await supabase
          .from('team_settings')
          .update({
            meeting_day: teamSettings.meetingDay,
            meeting_time: teamSettings.meetingTime,
            meeting_frequency: teamSettings.meetingFrequency,
            meeting_location: teamSettings.meetingLocation,
            meeting_notes: teamSettings.meetingNotes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings[0].id);
      } else {
        // Insert new settings
        result = await supabase
          .from('team_settings')
          .insert({
            meeting_day: teamSettings.meetingDay,
            meeting_time: teamSettings.meetingTime,
            meeting_frequency: teamSettings.meetingFrequency,
            meeting_location: teamSettings.meetingLocation,
            meeting_notes: teamSettings.meetingNotes
          });
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: "Team-Einstellungen gespeichert",
        description: "Die Team-Einstellungen wurden erfolgreich gespeichert."
      });
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
    return null; // User will be redirected in useEffect
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="applications">Bewerbungen</TabsTrigger>
                  <TabsTrigger value="user-management">Benutzerverwaltung</TabsTrigger>
                  <TabsTrigger value="team-settings">Team-Einstellungen</TabsTrigger>
                  <TabsTrigger value="statistics">Statistiken</TabsTrigger>
                </TabsList>
                
                <TabsContent value="applications" className="space-y-4 mt-4">
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
                </TabsContent>
                
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
                            value={teamSettings.meetingDay}
                            onValueChange={(value) => setTeamSettings({...teamSettings, meetingDay: value})}
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
                            value={teamSettings.meetingTime}
                            onChange={(e) => setTeamSettings({...teamSettings, meetingTime: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Häufigkeit</label>
                          <Select 
                            value={teamSettings.meetingFrequency}
                            onValueChange={(value) => setTeamSettings({...teamSettings, meetingFrequency: value})}
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
                            value={teamSettings.meetingLocation}
                            onChange={(e) => setTeamSettings({...teamSettings, meetingLocation: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Notizen für Team-Mitglieder</label>
                        <Textarea 
                          placeholder="Zusätzliche Informationen für Team-Mitglieder"
                          rows={4}
                          value={teamSettings.meetingNotes}
                          onChange={(e) => setTeamSettings({...teamSettings, meetingNotes: e.target.value})}
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
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="text-blue-500" size={20} />
                        Bewerbungsfragen verwalten
                      </CardTitle>
                      <CardDescription>
                        Hier kannst du die Fragen für die Teammitglied-Bewerbung anpassen
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="section1">
                          <AccordionTrigger className="text-base font-medium">
                            Abschnitt 1: Persönliche Informationen
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 py-2">
                              {applicationQuestions.section1.map((question, index) => (
                                <div key={index} className="space-y-2 p-3 rounded-md border border-gray-200">
                                  <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium">{question.label}</label>
                                    <Badge className={question.required ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                                      {question.required ? "Erforderlich" : "Optional"}
                                    </Badge>
                                  </div>
                                  <Input 
                                    value={question.label}
                                    onChange={(e) => {
                                      const newQuestions = {...applicationQuestions};
                                      newQuestions.section1[index].label = e.target.value;
                                      setApplicationQuestions(newQuestions);
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="section2">
                          <AccordionTrigger className="text-base font-medium">
                            Abschnitt 2: Regelverständnis
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 py-2">
                              {applicationQuestions.section2.map((question, index) => (
                                <div key={index} className="space-y-2 p-3 rounded-md border border-gray-200">
                                  <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium">{question.label}</label>
                                    <Badge className={question.required ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                                      {question.required ? "Erforderlich" : "Optional"}
                                    </Badge>
                                  </div>
                                  <Textarea 
                                    value={question.label}
                                    onChange={(e) => {
                                      const newQuestions = {...applicationQuestions};
                                      newQuestions.section2[index].label = e.target.value;
                                      setApplicationQuestions(newQuestions);
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="section3">
                          <AccordionTrigger className="text-base font-medium">
                            Abschnitt 3: Situationshandhabung & Erfahrung
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 py-2">
                              {applicationQuestions.section3.map((question, index) => (
                                <div key={index} className="space-y-2 p-3 rounded-md border border-gray-200">
                                  <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium">{question.label}</label>
                                    <Badge className={question.required ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                                      {question.required ? "Erforderlich" : "Optional"}
                                    </Badge>
                                  </div>
                                  <Textarea 
                                    value={question.label}
                                    onChange={(e) => {
                                      const newQuestions = {...applicationQuestions};
                                      newQuestions.section3[index].label = e.target.value;
                                      setApplicationQuestions(newQuestions);
                                    }}
                                  />
                                  <div className="flex justify-end">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const newQuestions = {...applicationQuestions};
                                        newQuestions.section3[index].required = !newQuestions.section3[index].required;
                                        setApplicationQuestions(newQuestions);
                                      }}
                                    >
                                      {question.required ? "Als optional markieren" : "Als erforderlich markieren"}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                      
                      <Button 
                        className="mt-6 w-full"
                        variant="outline"
                        disabled
                      >
                        Fragen speichern
                      </Button>
                      
                      <p className="text-xs text-center text-gray-500 mt-2">
                        Hinweis: Diese Funktion wird in einem zukünftigen Update verfügbar sein
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="statistics" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BarChart className="text-blue-500" size={20} />
                        Server Statistiken bearbeiten
                      </CardTitle>
                      <CardDescription>
                        Hier kannst du die angezeigten Statistiken auf der Startseite ändern
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Discord Mitglieder</label>
                          <Input 
                            type="number" 
                            value={stats.discordMembers} 
                            onChange={(e) => setStats({...stats, discordMembers: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Partner Server</label>
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
      
      {/* Application Status Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bewerbung bearbeiten</DialogTitle>
            <DialogDescription>
              Hier kannst du den Status der Bewerbung ändern und Anmerkungen hinzufügen.
            </DialogDescription>
          </DialogHeader>
          
          {currentApplication && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Status
                </label>
                <Select value={applicationStatus} onValueChange={setApplicationStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status wählen" />
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
                <label className="text-sm font-medium">
                  Anmerkungen (für den Bewerber sichtbar)
                </label>
                <Textarea
                  value={applicationNotes}
                  onChange={(e) => setApplicationNotes(e.target.value)}
                  placeholder="Füge hier Anmerkungen oder Feedback hinzu..."
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Abbrechen
            </Button>
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
      
      {/* Application View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bewerbungsdetails</DialogTitle>
            <div className="flex items-center gap-2 mt-1">
              {currentApplication && getStatusBadge(currentApplication.status)}
              <span className="text-sm text-gray-500">
                {currentApplication && formatDate(currentApplication.created_at)}
              </span>
            </div>
          </DialogHeader>
          
          {currentApplication && (
            <div className="py-4 space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Persönliche Informationen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Roblox Benutzername</p>
                    <p>{currentApplication.roblox_username}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Roblox ID</p>
                    <p>{currentApplication.roblox_id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Discord ID</p>
                    <p>{currentApplication.discord_id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Alter</p>
                    <p>{currentApplication.age} Jahre</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Aktivitätslevel</p>
                    <p>{currentApplication.activity_level}/10</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Regelverständnis</h3>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Was ist für dich FRP (Fail-Roleplay)?</p>
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <p className="whitespace-pre-wrap">{currentApplication.frp_understanding}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Was ist für dich VDM (Vehicle-Deathmatch)?</p>
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <p className="whitespace-pre-wrap">{currentApplication.vdm_understanding}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Was ist Taschen-RP und warum ist es verboten?</p>
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <p className="whitespace-pre-wrap">{currentApplication.taschen_rp_understanding}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Wie alt muss man sein, um auf dem Server spielen zu dürfen?</p>
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <p className="whitespace-pre-wrap">{currentApplication.server_age_understanding}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Situationshandhabung & Erfahrung</h3>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Wie würdest du mit einem Spieler umgehen, der sich weigert, auf Teammitglieder zu hören?</p>
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <p className="whitespace-pre-wrap">{currentApplication.situation_handling}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Was ist eine Bodycam und wann kommt sie zum Einsatz?</p>
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <p className="whitespace-pre-wrap">{currentApplication.bodycam_understanding}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Wie würdest du vorgehen, wenn ein Freund von dir gegen die Regeln verstößt?</p>
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <p className="whitespace-pre-wrap">{currentApplication.friend_rule_violation}</p>
                    </div>
                  </div>
                  
                  {currentApplication.other_servers && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Auf welchen anderen Servern spielst du noch?</p>
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                        <p className="whitespace-pre-wrap">{currentApplication.other_servers}</p>
                      </div>
                    </div>
                  )}
                  
                  {currentApplication.admin_experience && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Hast du bereits Erfahrung als Administrator/Teammitglied?</p>
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                        <p className="whitespace-pre-wrap">{currentApplication.admin_experience}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {currentApplication.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Admin-Anmerkungen</h3>
                    <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                      <p className="whitespace-pre-wrap text-blue-800">{currentApplication.notes}</p>
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex space-x-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Schließen
                </Button>
                <Button
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleEditApplication(currentApplication);
                  }}
                >
                  Status bearbeiten
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default AdminPanel;
