
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Settings, User, Calendar, BarChart, AlertCircle, CheckCircle, Clock, KeyRound, Eye, EyeOff, ShieldCheck, Users, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SessionContext } from '@/App';
import { checkIsAdmin, checkIsModerator, getTeamSettings, getUserRole, updateTeamSettings, getTotalUserCount, deleteApplication, getUserApplicationsHistory } from '@/lib/admin';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption 
} from "@/components/ui/table";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  discordId?: string;
  robloxId?: string;
  avatar_url?: string;
}

interface Application {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [discordId, setDiscordId] = useState('');
  const [robloxId, setRobloxId] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const session = useContext(SessionContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [teamSettings, setTeamSettings] = useState<any>(null);
  const [isLoadingTeamSettings, setIsLoadingTeamSettings] = useState(false);
  const [editTeamSettings, setEditTeamSettings] = useState(false);
  const [newTeamSettings, setNewTeamSettings] = useState({
    meeting_day: '',
    meeting_time: '',
    meeting_frequency: '',
    meeting_location: '',
    meeting_notes: ''
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    hasLetter: false,
    hasNumber: false
  });

  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifiedDiscordId, setVerifiedDiscordId] = useState('');
  const [verifiedRobloxId, setVerifiedRobloxId] = useState('');
  const [hasModifiedIds, setHasModifiedIds] = useState(false);

  // Admin functionality
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);
  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [loadingAllApplications, setLoadingAllApplications] = useState(false);
  const [viewApplicationDialog, setViewApplicationDialog] = useState(false);
  const [currentViewApplication, setCurrentViewApplication] = useState<any>(null);

  useEffect(() => {
    setPasswordValidation({
      length: newPassword.length >= 8,
      hasLetter: /[a-zA-Z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword)
    });
  }, [newPassword]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const resetPassword = url.searchParams.get('reset_password');

    if (resetPassword === 'true') {
      setActiveTab('security');
      toast({
        title: "Passwort zurücksetzen",
        description: "Du kannst jetzt ein neues Passwort festlegen.",
      });
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      if (!session) {
        navigate('/login');
        return;
      }

      const { user } = session;
      
      if (!user) {
        navigate('/login');
        return;
      }

      const userProfile: UserProfile = {
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.username || 'User',
        email: user.email || '',
        role: 'user',
        discordId: user.user_metadata?.discord_id || '',
        robloxId: user.user_metadata?.roblox_id || '',
        avatar_url: user.user_metadata?.avatar_url || '',
      };

      setUser(userProfile);
      setDiscordId(userProfile.discordId || '');
      setVerifiedDiscordId(userProfile.discordId || '');
      setRobloxId(userProfile.robloxId || '');
      setVerifiedRobloxId(userProfile.robloxId || '');
      setUsername(userProfile.name || '');
      
      fetchApplicationsHistory(user.id);
      fetchTeamSettings();
    };

    checkUser();
  }, [navigate, session]);

  useEffect(() => {
    const checkUserRole = async () => {
      if (session?.user) {
        try {
          const adminStatus = await checkIsAdmin();
          const modStatus = await checkIsModerator();
          const role = await getUserRole();
          
          setIsAdmin(adminStatus);
          setIsModerator(modStatus);
          
          if (adminStatus) {
            fetchUserCount();
            fetchAdminUsers();
            fetchAllApplications();
          }
          
          if (user && role) {
            setUser(prev => prev ? {...prev, role} : null);
          }
        } catch (error) {
          console.error("Error checking user status:", error);
          setIsAdmin(false);
          setIsModerator(false);
        }
      }
    };
    
    checkUserRole();
  }, [session, user]);

  useEffect(() => {
    if (teamSettings && editTeamSettings) {
      setNewTeamSettings({
        meeting_day: teamSettings.meeting_day || '',
        meeting_time: teamSettings.meeting_time || '',
        meeting_frequency: teamSettings.meeting_frequency || '',
        meeting_location: teamSettings.meeting_location || '',
        meeting_notes: teamSettings.meeting_notes || ''
      });
    }
  }, [teamSettings, editTeamSettings]);

  useEffect(() => {
    if (
      (verifiedDiscordId && discordId !== verifiedDiscordId) || 
      (verifiedRobloxId && robloxId !== verifiedRobloxId)
    ) {
      setHasModifiedIds(true);
    } else {
      setHasModifiedIds(false);
    }
  }, [discordId, robloxId, verifiedDiscordId, verifiedRobloxId]);

  const fetchApplicationsHistory = async (userId: string) => {
    setIsLoadingApplications(true);
    try {
      const applicationHistory = await getUserApplicationsHistory(userId);
      if (applicationHistory) {
        setApplications(applicationHistory);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications history:', error);
    } finally {
      setIsLoadingApplications(false);
    }
  };

  const fetchTeamSettings = async () => {
    setIsLoadingTeamSettings(true);
    try {
      const settings = await getTeamSettings();
      if (settings) {
        setTeamSettings(settings);
      }
    } catch (error) {
      console.error('Error fetching team settings:', error);
    } finally {
      setIsLoadingTeamSettings(false);
    }
  };

  const fetchUserCount = async () => {
    try {
      const count = await getTotalUserCount();
      setUserCount(count);
    } catch (error) {
      console.error('Error fetching user count:', error);
    }
  };

  const fetchAdminUsers = async () => {
    setLoadingAdminUsers(true);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*');

      if (error) {
        throw error;
      }

      setUsers(data || []);
      
      // Fetch usernames for all user IDs
      if (data && data.length > 0) {
        const userIds = data.map(user => user.user_id);
        fetchUsernames(userIds);
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Admin-Benutzer.",
        variant: "destructive"
      });
    } finally {
      setLoadingAdminUsers(false);
    }
  };

  const fetchAllApplications = async () => {
    setLoadingAllApplications(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAllApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Fehler",
        description: "Bewerbungen konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoadingAllApplications(false);
    }
  };

  const fetchUsernames = async (userIds: string[]) => {
    if (!userIds.length) return;
    
    try {
      const usernameMap: Record<string, string> = {};
      
      // Default fallback naming pattern
      userIds.forEach(userId => {
        usernameMap[userId] = `User ${userId.substring(0, 6)}`;
      });
      
      setUsernames(usernameMap);
    } catch (error) {
      console.error('Error in fetchUsernames:', error);
    }
  };

  const handleSaveProfile = () => {
    if (hasModifiedIds) {
      setShowVerifyDialog(true);
      return;
    }
    
    saveProfileData();
  };

  const saveProfileData = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          discord_id: discordId,
          roblox_id: robloxId,
          name: username,
        }
      });

      if (error) throw error;

      if (user) {
        setUser({
          ...user,
          discordId,
          robloxId,
          name: username
        });
      }
      
      setVerifiedDiscordId(discordId);
      setVerifiedRobloxId(robloxId);
      setHasModifiedIds(false);
      
      toast({
        title: "Profil gespeichert",
        description: "Dein Profil wurde erfolgreich aktualisiert.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Fehler",
        description: "Es gab ein Problem beim Speichern deines Profils.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmIdChange = () => {
    setShowVerifyDialog(false);
    saveProfileData();
  };

  const cancelIdChange = () => {
    setShowVerifyDialog(false);
    setDiscordId(verifiedDiscordId);
    setRobloxId(verifiedRobloxId);
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordChangeSuccess(false);
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Die neuen Passwörter stimmen nicht überein");
      return;
    }
    
    if (newPassword.length < 8 || !(/[a-zA-Z]/.test(newPassword)) || !(/[0-9]/.test(newPassword))) {
      setPasswordError("Das neue Passwort muss mindestens 8 Zeichen lang sein und mindestens einen Buchstaben und eine Ziffer enthalten");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      
      setPasswordChangeSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Passwort geändert",
        description: "Dein Passwort wurde erfolgreich aktualisiert.",
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      setPasswordError(error.message || "Es gab ein Problem bei der Änderung des Passworts");
      
      toast({
        title: "Fehler",
        description: error.message || "Es gab ein Problem bei der Änderung des Passworts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTeamSettings = async () => {
    setIsLoading(true);
    
    try {
      const result = await updateTeamSettings({
        meeting_day: newTeamSettings.meeting_day,
        meeting_time: newTeamSettings.meeting_time,
        meeting_frequency: newTeamSettings.meeting_frequency,
        meeting_location: newTeamSettings.meeting_location,
        meeting_notes: newTeamSettings.meeting_notes
      });
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      await fetchTeamSettings();
      setEditTeamSettings(false);
      
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Team-Einstellungen wurden erfolgreich aktualisiert.",
      });
    } catch (error: any) {
      console.error('Error updating team settings:', error);
      
      toast({
        title: "Fehler",
        description: error.message || "Es gab ein Problem beim Aktualisieren der Team-Einstellungen.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: AdminUser) => {
    setEditUserId(user.id);
    setEditRole(user.role);
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ role: editRole })
        .eq('id', editUserId);

      if (error) {
        throw error;
      }

      toast({
        title: "Erfolgreich",
        description: "Benutzer erfolgreich aktualisiert.",
      });
      fetchAdminUsers();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren des Benutzers.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Erfolgreich",
        description: "Benutzer erfolgreich gelöscht.",
      });
      fetchAdminUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen des Benutzers.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewApplication = (application: any) => {
    setCurrentViewApplication(application);
    setViewApplicationDialog(true);
  };

  const handleDeleteApplication = (id: string) => {
    setApplicationToDelete(id);
    setConfirmDeleteDialog(true);
  };

  const confirmDeleteApplication = async () => {
    if (!applicationToDelete) return;
    
    setIsLoading(true);
    try {
      const result = await deleteApplication(applicationToDelete);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      toast({
        title: "Erfolgreich",
        description: "Bewerbung erfolgreich gelöscht.",
      });
      
      // Refresh applications list
      fetchAllApplications();
      if (session?.user) {
        fetchApplicationsHistory(session.user.id);
      }
      
    } catch (error: any) {
      console.error('Error deleting application:', error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Löschen der Bewerbung.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setConfirmDeleteDialog(false);
      setApplicationToDelete(null);
    }
  };

  const handleLogout = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Bereits abgemeldet",
          description: "Du bist bereits abgemeldet."
        });
        
        navigate('/');
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        
        if (error.name === "AuthSessionMissingError") {
          localStorage.removeItem('supabase.auth.token');
          window.location.href = '/';
          return;
        }
        
        throw error;
      }
      
      toast({
        title: "Abgemeldet",
        description: "Du wurdest erfolgreich abgemeldet.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      
      toast({
        title: "Abmeldeversuch",
        description: "Deine Sitzung wurde zurückgesetzt.",
        variant: "default"
      });
      
      localStorage.removeItem('supabase.auth.token');
      window.location.href = '/';
    }
  };

  const getUserRoleName = () => {
    if (isAdmin) {
      return 'Administrator';
    } else if (isModerator) {
      return 'Moderator';
    }
    return 'Benutzer';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock size={14} />
            Ausstehend
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle size={14} />
            Genehmigt
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
            <AlertCircle size={14} />
            Abgelehnt
          </Badge>
        );
      case 'waitlist':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
            <Clock size={14} />
            Warteliste
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            {status}
          </Badge>
        );
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

  const getUsernameById = (userId: string) => {
    return usernames[userId] || 'Unbekannter Benutzer';
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-64">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    {user.avatar_url ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img 
                          src={user.avatar_url} 
                          alt={user.name}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="bg-blue-600 text-white p-2 rounded-full">
                        <User size={24} />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription className="text-xs truncate max-w-[180px]">{user.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <nav className="space-y-1">
                    <Button 
                      variant={activeTab === 'dashboard' ? 'default' : 'ghost'} 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('dashboard')}
                    >
                      <BarChart size={16} className="mr-2" />
                      Dashboard
                    </Button>
                    <Button 
                      variant={activeTab === 'profile' ? 'default' : 'ghost'} 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('profile')}
                    >
                      <Settings size={16} className="mr-2" />
                      Einstellungen
                    </Button>
                    <Button 
                      variant={activeTab === 'security' ? 'default' : 'ghost'} 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('security')}
                    >
                      <KeyRound size={16} className="mr-2" />
                      Sicherheit
                    </Button>
                    
                    {isAdmin && (
                      <Button 
                        variant={activeTab === 'admin' ? 'default' : 'ghost'} 
                        className="w-full justify-start mt-2"
                        onClick={() => setActiveTab('admin')}
                      >
                        <ShieldCheck size={16} className="mr-2" />
                        Admin Panel
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-red-500 hover:text-red-600 mt-4"
                      onClick={handleLogout}
                    >
                      Abmelden
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            <div className="flex-1">
              {activeTab === 'dashboard' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Dashboard</CardTitle>
                    <CardDescription>Übersicht deiner Aktivitäten</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {!isAdmin && !isModerator && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">Bewerbungsstatus</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {isLoadingApplications ? (
                                <div className="flex justify-center py-4">
                                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                                </div>
                              ) : applications.length > 0 ? (
                                <div className="space-y-4">
                                  {applications.map((app) => (
                                    <div key={app.id} className="bg-blue-50 p-3 rounded-md border border-blue-100 text-blue-700">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Bewerbung vom {formatDate(app.created_at)}</span>
                                        {getStatusBadge(app.status)}
                                      </div>
                                      <p className="text-sm">
                                        {app.status === 'pending' ? 
                                          'Deine Bewerbung wird derzeit geprüft.' :
                                          app.status === 'approved' ?
                                          'Deine Bewerbung wurde angenommen! Wir werden dich kontaktieren.' :
                                          app.status === 'waitlist' ?
                                          'Deine Bewerbung wurde in die Warteliste aufgenommen.' :
                                          'Deine Bewerbung wurde leider abgelehnt.'}
                                      </p>
                                      {app.notes && (
                                        <div className="mt-2 pt-2 border-t border-blue-200">
                                          <p className="text-sm font-medium">Anmerkungen:</p>
                                          <p className="text-sm">{app.notes}</p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : discordId ? (
                                <div className="text-sm bg-blue-50 p-3 rounded-md border border-blue-100 text-blue-700">
                                  Du kannst jetzt eine Bewerbung einreichen.
                                  <div className="mt-2">
                                    <Button 
                                      size="sm"
                                      onClick={() => navigate('/apply/form')}
                                    >
                                      Bewerbung erstellen
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm bg-amber-50 p-3 rounded-md border border-amber-100 text-amber-700">
                                  Bitte vervollständige dein Profil, um dich zu bewerben.
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Team-Meetings</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {isLoadingTeamSettings ? (
                              <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                              </div>
                            ) : (isAdmin || isModerator) && teamSettings ? (
                              <div className="text-sm space-y-3">
                                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                                  <Calendar size={24} className="mb-2 text-blue-600" />
                                  <p className="font-medium">Nächstes Meeting:</p>
                                  <div className="space-y-1 mt-1">
                                    <p><span className="font-medium">Tag:</span> {teamSettings.meeting_day}</p>
                                    <p><span className="font-medium">Uhrzeit:</span> {teamSettings.meeting_time} Uhr</p>
                                    <p><span className="font-medium">Frequenz:</span> {teamSettings.meeting_frequency}</p>
                                    <p><span className="font-medium">Ort:</span> {teamSettings.meeting_location}</p>
                                    {teamSettings.meeting_notes && (
                                      <p><span className="font-medium">Hinweis:</span> {teamSettings.meeting_notes}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">
                                <Calendar size={32} className="mb-3 text-blue-600" />
                                <p>Keine anstehenden Meetings</p>
                                <span className="text-xs">Meetings werden hier angezeigt, sobald du im Team bist.</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Profil-Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Benutzername:</span>
                              <span className="text-sm">{username ? "✓ Eingegeben" : "✗ Fehlt"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Discord ID:</span>
                              <span className="text-sm">{discordId ? "✓ Eingegeben" : "✗ Fehlt"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Roblox ID:</span>
                              <span className="text-sm">{robloxId ? "✓ Eingegeben" : "✗ Fehlt"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Rolle:</span>
                              <span className="text-sm">{getUserRoleName()}</span>
                            </div>
                            {(!username || !discordId || !robloxId) && (
                              <Button 
                                size="sm"
                                onClick={() => setActiveTab('profile')}
                              >
                                Profil vervollständigen
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'profile' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Profil-Einstellungen</CardTitle>
                    <CardDescription>Passe deine Profil-Informationen an</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Benutzername</Label>
                      <Input 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Dein Benutzername"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail</Label>
                      <Input id="email" type="email" value={user.email} disabled className="truncate" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="discord" className="flex items-center gap-2">
                        Discord ID
                        <span className="text-xs text-blue-500">(Erforderlich für Bewerbungen)</span>
                      </Label>
                      <Input 
                        id="discord" 
                        placeholder="z.B.: 123456789012345678" 
                        value={discordId}
                        onChange={(e) => setDiscordId(e.target.value)}
                        className={verifiedDiscordId ? "bg-gray-50" : ""}
                        disabled={!!verifiedDiscordId}
                      />
                      {verifiedDiscordId && (
                        <p className="text-xs text-gray-500">
                          Deine Discord ID wurde verifiziert und kann nicht mehr geändert werden.
                        </p>
                      )}
                      {!verifiedDiscordId && (
                        <p className="text-xs text-gray-500">
                          Bitte gib deine vollständige Discord ID ein, damit wir dich kontaktieren können.
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="roblox" className="flex items-center gap-2">
                        Roblox ID
                        <span className="text-xs text-blue-500">(Erforderlich für Bewerbungen)</span>
                      </Label>
                      <Input 
                        id="roblox" 
                        placeholder="z.B.: 123456789" 
                        value={robloxId}
                        onChange={(e) => setRobloxId(e.target.value)}
                        className={verifiedRobloxId ? "bg-gray-50" : ""}
                        disabled={!!verifiedRobloxId}
                      />
                      {verifiedRobloxId && (
                        <p className="text-xs text-gray-500">
                          Deine Roblox ID wurde verifiziert und kann nicht mehr geändert werden.
                        </p>
                      )}
                      {!verifiedRobloxId && (
                        <p className="text-xs text-gray-500">
                          Bitte gib deine Roblox ID ein.
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Rolle</Label>
                      <Input id="role" value={getUserRoleName()} disabled />
                    </div>
                    
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-indigo-700 w-full"
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                    >
                      {isLoading ? "Speichern..." : "Profil speichern"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'security' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sicherheitseinstellungen</CardTitle>
                    <CardDescription>Passwort ändern</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {passwordError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Fehler</AlertTitle>
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {passwordChangeSuccess && (
                      <Alert className="mb-4 bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Passwort geändert</AlertTitle>
                        <AlertDescription className="text-green-700">
                          Dein Passwort wurde erfolgreich aktualisiert.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Aktuelles Passwort</Label>
                      <div className="relative">
                        <Input 
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"} 
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-0 top-0 h-10 w-10 text-gray-400 hover:text-gray-500"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Neues Passwort</Label>
                      <div className="relative">
                        <Input 
                          id="new-password"
                          type={showNewPassword ? "text" : "password"} 
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-0 top-0 h-10 w-10 text-gray-400 hover:text-gray-500"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                      
                      <div className="text-xs space-y-1 mt-2">
                        <p className="font-semibold text-gray-600">Passwort muss:</p>
                        <div className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-full ${passwordValidation.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={passwordValidation.length ? 'text-green-600' : 'text-gray-500'}>
                            Mindestens 8 Zeichen lang sein
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-full ${passwordValidation.hasLetter ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={passwordValidation.hasLetter ? 'text-green-600' : 'text-gray-500'}>
                            Mindestens einen Buchstaben enthalten
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-full ${passwordValidation.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                            Mindestens eine Ziffer enthalten
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-new-password">Neues Passwort bestätigen</Label>
                      <div className="relative">
                        <Input 
                          id="confirm-new-password"
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-0 top-0 h-10 w-10 text-gray-400 hover:text-gray-500"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                      
                      {confirmPassword && (
                        <div className="flex items-center gap-1 mt-1 text-xs">
                          <div className={`w-2 h-2 rounded-full ${confirmPassword === newPassword ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={confirmPassword === newPassword ? 'text-green-600' : 'text-red-500'}>
                            {confirmPassword === newPassword ? 'Passwörter stimmen überein' : 'Passwörter stimmen nicht überein'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-indigo-700 w-full"
                      onClick={handleChangePassword}
                      disabled={isLoading}
                    >
                      {isLoading ? "Passwort wird geändert..." : "Passwort ändern"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'admin' && isAdmin && (
                <div className="space-y-8">
                  {/* Team Settings Management */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Team-Meeting Einstellungen</CardTitle>
                          <CardDescription>Verwalte die Einstellungen für Team-Meetings</CardDescription>
                        </div>
                        {!editTeamSettings && (
                          <Button 
                            variant="outline" 
                            onClick={() => setEditTeamSettings(true)}
                          >
                            <Edit size={16} className="mr-2" />
                            Bearbeiten
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingTeamSettings ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                        </div>
                      ) : editTeamSettings ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="meeting_day">Meeting Tag</Label>
                              <Input 
                                id="meeting_day" 
                                value={newTeamSettings.meeting_day} 
                                onChange={(e) => setNewTeamSettings({...newTeamSettings, meeting_day: e.target.value})}
                                placeholder="z.B. Samstag"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="meeting_time">Meeting Uhrzeit</Label>
                              <Input 
                                id="meeting_time" 
                                value={newTeamSettings.meeting_time} 
                                onChange={(e) => setNewTeamSettings({...newTeamSettings, meeting_time: e.target.value})}
                                placeholder="z.B. 19:00"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="meeting_frequency">Frequenz</Label>
                              <Input 
                                id="meeting_frequency" 
                                value={newTeamSettings.meeting_frequency} 
                                onChange={(e) => setNewTeamSettings({...newTeamSettings, meeting_frequency: e.target.value})}
                                placeholder="z.B. Wöchentlich"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="meeting_location">Ort</Label>
                              <Input 
                                id="meeting_location" 
                                value={newTeamSettings.meeting_location} 
                                onChange={(e) => setNewTeamSettings({...newTeamSettings, meeting_location: e.target.value})}
                                placeholder="z.B. Teamstage"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="meeting_notes">Hinweise</Label>
                            <Textarea 
                              id="meeting_notes" 
                              value={newTeamSettings.meeting_notes} 
                              onChange={(e) => setNewTeamSettings({...newTeamSettings, meeting_notes: e.target.value})}
                              placeholder="Zusätzliche Hinweise für Team-Meetings"
                              rows={3}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setEditTeamSettings(false)}
                            >
                              Abbrechen
                            </Button>
                            <Button 
                              onClick={handleSaveTeamSettings}
                              disabled={isLoading}
                            >
                              {isLoading ? "Speichern..." : "Änderungen speichern"}
                            </Button>
                          </div>
                        </div>
                      ) : teamSettings ? (
                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                          <h3 className="font-medium mb-3 flex items-center">
                            <Calendar size={18} className="mr-2 text-blue-600" />
                            Aktuelle Einstellungen
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Meeting Tag:</p>
                              <p>{teamSettings.meeting_day || "Nicht festgelegt"}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Meeting Uhrzeit:</p>
                              <p>{teamSettings.meeting_time || "Nicht festgelegt"} Uhr</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Frequenz:</p>
                              <p>{teamSettings.meeting_frequency || "Nicht festgelegt"}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Ort:</p>
                              <p>{teamSettings.meeting_location || "Nicht festgelegt"}</p>
                            </div>
                          </div>
                          {teamSettings.meeting_notes && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-600">Hinweise:</p>
                              <p className="text-sm">{teamSettings.meeting_notes}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                          <p>Keine Team-Meeting Einstellungen gefunden</p>
                          <Button 
                            variant="outline" 
                            onClick={() => setEditTeamSettings(true)}
                            className="mt-2"
                          >
                            Einstellungen hinzufügen
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Team Members Management */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Teammitglieder</CardTitle>
                      <CardDescription>Verwalte Admin- und Moderatorenrechte</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingAdminUsers ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                        </div>
                      ) : (
                        <Table>
                          <TableCaption>Admin-Benutzer mit speziellen Rechten.</TableCaption>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">ID</TableHead>
                              <TableHead>Benutzer</TableHead>
                              <TableHead>Benutzer ID</TableHead>
                              <TableHead>Rolle</TableHead>
                              <TableHead>Erstellt am</TableHead>
                              <TableHead className="text-right">Aktionen</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.id.substring(0, 6)}...</TableCell>
                                <TableCell className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-blue-500" />
                                  {getUsernameById(user.user_id)}
                                </TableCell>
                                <TableCell>{user.user_id.substring(0, 8)}...</TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    user.role === 'admin' 
                                      ? 'bg-red-100 text-red-800' 
                                      : user.role === 'moderator' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {user.role || 'admin'}
                                  </span>
                                </TableCell>
                                <TableCell>{formatDate(user.created_at)}</TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Bearbeiten
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Löschen
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>

                  {/* Applications Management */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Bewerbungen verwalten</CardTitle>
                      <CardDescription>Alle Bewerbungen einsehen und verwalten</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingAllApplications ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                        </div>
                      ) : allApplications.length > 0 ? (
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
                              {allApplications.map((app) => (
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
                                        onClick={() => handleDeleteApplication(app.id)}
                                        className="flex items-center gap-1 text-red-500"
                                      >
                                        <Trash2 size={14} />
                                        Löschen
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
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eingegebene IDs bestätigen</DialogTitle>
            <DialogDescription>
              Sobald Du Deine Discord oder Roblox ID speicherst, kann sie nicht mehr geändert werden. Stelle sicher, dass sie korrekt sind.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {discordId !== verifiedDiscordId && discordId && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Discord ID:</p>
                <p className="text-sm bg-blue-50 p-2 rounded border border-blue-100">{discordId}</p>
              </div>
            )}
            
            {robloxId !== verifiedRobloxId && robloxId && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Roblox ID:</p>
                <p className="text-sm bg-blue-50 p-2 rounded border border-blue-100">{robloxId}</p>
              </div>
            )}
            
            <Alert variant="destructive" className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Achtung</AlertTitle>
              <AlertDescription className="text-amber-700">
                Nach dem Speichern können diese IDs nicht mehr geändert werden. Bitte überprüfe sie sorgfältig.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={cancelIdChange}>Abbrechen</Button>
            <Button onClick={confirmIdChange}>Bestätigen und speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Benutzer bearbeiten</DialogTitle>
            <DialogDescription>
              Änderungen am Benutzer vornehmen. Klicke auf Speichern, wenn du fertig bist.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rolle
              </Label>
              <Input 
                id="role" 
                value={editRole} 
                onChange={(e) => setEditRole(e.target.value)} 
                className="col-span-3" 
                placeholder="admin oder moderator"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveUser} className="w-full">Änderungen speichern</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Confirm Delete Application Dialog */}
      <Dialog open={confirmDeleteDialog} onOpenChange={setConfirmDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bewerbung löschen</DialogTitle>
            <DialogDescription>
              Bist du sicher, dass du diese Bewerbung löschen möchtest? Dadurch kann der Benutzer eine neue Bewerbung einreichen.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setConfirmDeleteDialog(false)}>Abbrechen</Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteApplication}
              disabled={isLoading}
            >
              {isLoading ? "Löschen..." : "Bewerbung löschen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* View Application Dialog */}
      <Dialog open={viewApplicationDialog} onOpenChange={setViewApplicationDialog}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bewerbung von {currentViewApplication?.roblox_username}</DialogTitle>
            <DialogDescription>
              Eingereicht am {currentViewApplication ? formatDate(currentViewApplication.created_at) : ''}
            </DialogDescription>
          </DialogHeader>
          
          {currentViewApplication && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Persönliche Informationen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Roblox Benutzername</h4>
                    <p className="text-base">{currentViewApplication.roblox_username}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Roblox ID</h4>
                    <p className="text-base">{currentViewApplication.roblox_id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Discord ID</h4>
                    <p className="text-base">{currentViewApplication.discord_id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Alter</h4>
                    <p className="text-base">{currentViewApplication.age} Jahre</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Aktivitätslevel (1-10)</h4>
                    <p className="text-base">{currentViewApplication.activity_level}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Status</h3>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(currentViewApplication.status)}
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    setViewApplicationDialog(false);
                    handleDeleteApplication(currentViewApplication.id);
                  }}
                  className="flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Löschen
                </Button>
              </div>
              
              {currentViewApplication.notes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Notizen</h4>
                  <p className="text-base bg-gray-50 p-3 rounded">{currentViewApplication.notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button 
              onClick={() => setViewApplicationDialog(false)}
              variant="outline"
            >
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Profile;
