import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { 
  Settings, User, Calendar, BarChart, AlertCircle, CheckCircle, Clock, KeyRound, Eye, EyeOff, 
  ShieldCheck, Users, Trash2, Edit, Mail, Upload, Image, AlertTriangle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SessionContext } from '@/App';
import { 
  checkIsAdmin, checkIsModerator, getTeamSettings, getUserRole, updateTeamSettings, 
  getTotalUserCount, deleteApplication, getUserApplicationsHistory 
} from '@/lib/admin';
import {
  fetchAdminUsers, getCachedUserCount, deleteAdminUser, updateAdminUser,
  isUsernameTaken, updateUserEmail, invalidateAdminCache
} from '@/lib/adminService';
import { 
  validateUsername, checkUsernameCooldown, getTimeBasedGreeting 
} from '@/lib/usernameValidation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption 
} from "@/components/ui/table";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from '@/components/ui/toaster';
import ProfileImageUpload from '@/components/ProfileImageUpload';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  discord_id?: string;
  roblox_id?: string;
  username_changed_at?: string;
  role?: string;
}

interface Application {
  id: string;
  user_id: string;
  roblox_username: string;
  discord_username: string;
  age: number;
  experience: string;
  motivation: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  admin_notes?: string;
}

interface AdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator';
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session } = useContext(SessionContext);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [discordId, setDiscordId] = useState('');
  const [robloxId, setRobloxId] = useState('');
  const [verifiedDiscordId, setVerifiedDiscordId] = useState('');
  const [verifiedRobloxId, setVerifiedRobloxId] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [loadingAllApplications, setLoadingAllApplications] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isUsernameDialogOpen, setIsUsernameDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [usernameCooldown, setUsernameCooldown] = useState({ canChange: true, daysRemaining: 0, nextChangeDate: null });
  const [greeting, setGreeting] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<'admin' | 'moderator'>('moderator');
  const [userCount, setUserCount] = useState(0);
  const [teamSettings, setTeamSettings] = useState({
    applications_open: true,
    maintenance_mode: false,
    maintenance_message: 'Wir führen gerade Wartungsarbeiten durch. Bitte versuche es später erneut.'
  });

  // Set active tab from URL parameter if present
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['dashboard', 'applications', 'team', 'admin', 'security'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session) {
        navigate('/login');
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }

        // Get user profile data
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        const userData: UserProfile = {
          id: user.id,
          name: profile.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          avatar_url: user.user_metadata?.avatar_url || profile.avatar_url,
          discord_id: profile.discord_id || '',
          roblox_id: profile.roblox_id || '',
          username_changed_at: profile.username_changed_at,
        };

        setUser(userData);
        setUsername(profile.username || user.email?.split('@')[0] || 'User');
        setDiscordId(profile.discord_id || '');
        setRobloxId(profile.roblox_id || '');
        setVerifiedDiscordId(profile.discord_id || '');
        setVerifiedRobloxId(profile.roblox_id || '');

        // Check username cooldown
        const cooldownData = await checkUsernameCooldown(profile.username_changed_at);
        setUsernameCooldown(cooldownData);

        // Check if user is admin or moderator
        const adminStatus = await checkIsAdmin();
        const moderatorStatus = await checkIsModerator();
        setIsAdmin(adminStatus);
        setIsModerator(moderatorStatus);

        // Set greeting
        setGreeting(getTimeBasedGreeting());

        // Fetch applications if user is admin or moderator
        if (adminStatus || moderatorStatus) {
          fetchTeamSettings();
        }

        // Fetch user's applications
        fetchUserApplications(user.id);

        // Fetch all applications if user is admin or moderator
        if (adminStatus || moderatorStatus) {
          fetchAllApplications();
          fetchAdminUsersList();
          fetchUserCount();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Fehler",
          description: "Deine Profildaten konnten nicht geladen werden.",
          variant: "destructive"
        });
      }
    };

    fetchUserData();
  }, [session, navigate]);

  const fetchUserApplications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
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
      console.error('Error fetching all applications:', error);
    } finally {
      setLoadingAllApplications(false);
    }
  };

  const fetchTeamSettings = async () => {
    try {
      const settings = await getTeamSettings();
      setTeamSettings(settings);
    } catch (error) {
      console.error('Error fetching team settings:', error);
    }
  };

  const fetchAdminUsersList = async () => {
    setLoadingAdminUsers(true);
    try {
      const adminUsers = await fetchAdminUsers();
      setUsers(adminUsers);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    } finally {
      setLoadingAdminUsers(false);
    }
  };

  const fetchUserCount = async () => {
    try {
      const count = await getCachedUserCount();
      setUserCount(count);
    } catch (error) {
      console.error('Error fetching user count:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          discord_id: discordId,
          roblox_id: robloxId,
        })
        .eq('id', user.id);

      if (error) throw error;

      setVerifiedDiscordId(discordId);
      setVerifiedRobloxId(robloxId);

      toast({
        title: "Profil aktualisiert",
        description: "Deine Profildaten wurden erfolgreich aktualisiert.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Fehler",
        description: "Deine Profildaten konnten nicht aktualisiert werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateUsernameChange = () => {
    setNewUsername(username);
    setIsUsernameDialogOpen(true);
  };

  const handleUsernameChange = async () => {
    if (!user) return;
    
    // Validate username
    const validation = validateUsername(newUsername);
    if (!validation.valid) {
      toast({
        title: "Ungültiger Benutzername",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if username is taken
      const isTaken = await isUsernameTaken(newUsername, user.id);
      if (isTaken) {
        toast({
          title: "Benutzername vergeben",
          description: "Dieser Benutzername ist bereits vergeben.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Update username
      const { error } = await supabase
        .from('profiles')
        .update({
          username: newUsername,
          username_changed_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setUsername(newUsername);
      setIsUsernameDialogOpen(false);
      
      // Update cooldown
      const cooldownData = await checkUsernameCooldown(new Date().toISOString());
      setUsernameCooldown(cooldownData);

      toast({
        title: "Benutzername geändert",
        description: "Dein Benutzername wurde erfolgreich geändert.",
      });
    } catch (error) {
      console.error('Error changing username:', error);
      toast({
        title: "Fehler",
        description: "Dein Benutzername konnte nicht geändert werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateEmailChange = () => {
    if (!user) return;
    setNewEmail(user.email);
    setIsEmailDialogOpen(true);
  };

  const handleEmailChange = async () => {
    if (!user) return;
    
    if (!newEmail || !newEmail.includes('@')) {
      toast({
        title: "Ungültige E-Mail",
        description: "Bitte gib eine gültige E-Mail-Adresse ein.",
        variant: "destructive"
      });
      return;
    }

    if (!currentPassword) {
      toast({
        title: "Passwort erforderlich",
        description: "Bitte gib dein aktuelles Passwort ein.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateUserEmail(newEmail, currentPassword);
      
      if (result.success) {
        setUser({
          ...user,
          email: newEmail
        });
        setIsEmailDialogOpen(false);
        setCurrentPassword('');
        
        toast({
          title: "E-Mail geändert",
          description: "Deine E-Mail-Adresse wurde erfolgreich geändert.",
        });
      } else {
        throw new Error(result.message || "Fehler beim Ändern der E-Mail-Adresse");
      }
    } catch (error: any) {
      console.error('Error changing email:', error);
      toast({
        title: "Fehler",
        description: error.message || "Deine E-Mail-Adresse konnte nicht geändert werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiatePasswordChange = () => {
    setIsPasswordDialogOpen(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handlePasswordChange = async () => {
    if (!currentPassword) {
      toast({
        title: "Passwort erforderlich",
        description: "Bitte gib dein aktuelles Passwort ein.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Passwort zu kurz",
        description: "Dein neues Passwort muss mindestens 8 Zeichen lang sein.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwörter stimmen nicht überein",
        description: "Die eingegebenen Passwörter stimmen nicht überein.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setIsPasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Passwort geändert",
        description: "Dein Passwort wurde erfolgreich geändert.",
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Fehler",
        description: error.message || "Dein Passwort konnte nicht geändert werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setAdminNotes(application.admin_notes || '');
    setIsApplicationDialogOpen(true);
  };

  const handleUpdateApplicationStatus = async (status: 'pending' | 'approved' | 'rejected') => {
    if (!selectedApplication) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedApplication.id);

      if (error) throw error;

      // Update local state
      setAllApplications(prev => 
        prev.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, status, admin_notes: adminNotes, updated_at: new Date().toISOString() } 
            : app
        )
      );
      
      setApplications(prev => 
        prev.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, status, admin_notes: adminNotes, updated_at: new Date().toISOString() } 
            : app
        )
      );

      setIsApplicationDialogOpen(false);
      
      toast({
        title: "Bewerbung aktualisiert",
        description: `Die Bewerbung wurde als "${status === 'approved' ? 'angenommen' : status === 'rejected' ? 'abgelehnt' : 'ausstehend'}" markiert.`,
      });
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Fehler",
        description: "Die Bewerbung konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('Möchtest du diese Bewerbung wirklich löschen?')) return;
    
    try {
      await deleteApplication(id);
      
      // Update local state
      setAllApplications(prev => prev.filter(app => app.id !== id));
      setApplications(prev => prev.filter(app => app.id !== id));
      
      toast({
        title: "Bewerbung gelöscht",
        description: "Die Bewerbung wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        title: "Fehler",
        description: "Die Bewerbung konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    }
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateUserRole = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      await updateAdminUser(selectedUser.id, newRole);
      
      // Update local state
      setUsers(prev => 
        prev.map(u => 
          u.id === selectedUser.id 
            ? { ...u, role: newRole } 
            : u
        )
      );
      
      setIsEditUserDialogOpen(false);
      
      toast({
        title: "Benutzerrolle aktualisiert",
        description: `Die Rolle wurde erfolgreich auf "${newRole === 'admin' ? 'Administrator' : 'Moderator'}" geändert.`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Fehler",
        description: "Die Benutzerrolle konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Möchtest du diesen Benutzer wirklich aus dem Administratorenteam entfernen?')) return;
    
    try {
      await deleteAdminUser(id);
      
      // Update local state
      setUsers(prev => prev.filter(u => u.id !== id));
      
      toast({
        title: "Benutzer entfernt",
        description: "Der Benutzer wurde erfolgreich aus dem Administratorenteam entfernt.",
      });
    } catch (error) {
      console.error('Error deleting admin user:', error);
      toast({
        title: "Fehler",
        description: "Der Benutzer konnte nicht entfernt werden.",
        variant: "destructive"
      });
    }
  };

  const handleToggleApplications = async () => {
    try {
      const newSettings = {
        ...teamSettings,
        applications_open: !teamSettings.applications_open
      };
      
      await updateTeamSettings(newSettings);
      setTeamSettings(newSettings);
      
      toast({
        title: "Einstellungen aktualisiert",
        description: `Bewerbungen sind jetzt ${newSettings.applications_open ? 'geöffnet' : 'geschlossen'}.`,
      });
    } catch (error) {
      console.error('Error updating team settings:', error);
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  };

  const handleToggleMaintenance = async () => {
    try {
      const newSettings = {
        ...teamSettings,
        maintenance_mode: !teamSettings.maintenance_mode
      };
      
      await updateTeamSettings(newSettings);
      setTeamSettings(newSettings);
      
      toast({
        title: "Einstellungen aktualisiert",
        description: `Der Wartungsmodus ist jetzt ${newSettings.maintenance_mode ? 'aktiviert' : 'deaktiviert'}.`,
      });
    } catch (error) {
      console.error('Error updating team settings:', error);
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateMaintenanceMessage = async (message: string) => {
    try {
      const newSettings = {
        ...teamSettings,
        maintenance_message: message
      };
      
      await updateTeamSettings(newSettings);
      setTeamSettings(newSettings);
      
      toast({
        title: "Einstellungen aktualisiert",
        description: "Die Wartungsnachricht wurde aktualisiert.",
      });
    } catch (error) {
      console.error('Error updating team settings:', error);
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Fehler",
        description: "Du konntest nicht abgemeldet werden.",
        variant: "destructive"
      });
    }
  };

  const handleInitiateDeleteAccount = () => {
    setIsDeleteAccountDialogOpen(true);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    if (!currentPassword) {
      toast({
        title: "Passwort erforderlich",
        description: "Bitte gib dein aktuelles Passwort ein.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // First verify the password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) throw signInError;

      // Delete user data from profiles table
      const { error: deleteProfileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (deleteProfileError) throw deleteProfileError;

      // Delete user from auth
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(
        user.id
      );

      if (deleteUserError) throw deleteUserError;

      // Sign out
      await supabase.auth.signOut();
      
      setIsDeleteAccountDialogOpen(false);
      navigate('/');
      
      toast({
        title: "Konto gelöscht",
        description: "Dein Konto wurde erfolgreich gelöscht.",
      });
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: "Fehler",
        description: error.message || "Dein Konto konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserRoleName = () => {
    if (isAdmin) return 'Administrator';
    if (isModerator) return 'Moderator';
    return 'Benutzer';
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

  const formatNextChangeDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Ausstehend</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Angenommen</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Abgelehnt</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  const getUsernameById = (userId: string) => {
    // This is a placeholder function - in a real app, you would fetch the username from your database
    return userId.substring(0, 8) + '...';
  };

  const get30DaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString();
  };

  const hasModifiedIds = discordId !== verifiedDiscordId || robloxId !== verifiedRobloxId;

  // Replace handleFileUpload and handleFileChange with the new component integration
  const handleProfileImageUpdated = (newAvatarUrl: string) => {
    if (user) {
      setUser({
        ...user,
        avatar_url: newAvatarUrl
      });
    }
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
                  <div className="flex flex-col items-center space-y-3">
                    <ProfileImageUpload 
                      userId={user.id}
                      existingImageUrl={user.avatar_url}
                      onImageUploaded={handleProfileImageUpdated}
                    />
                    <div className="text-center">
                      <h2 className="text-xl font-semibold">{user.name}</h2>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <Badge variant="outline" className="mt-1 flex items-center justify-center gap-1">
                        <ShieldCheck size={14} className="text-blue-600" />
                        {getUserRoleName()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-xl font-medium mb-3">{greeting}</p>
                  <p className="text-sm text-gray-500">
                    Hier kannst du dein Profil verwalten und deine Bewerbungen einsehen.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleLogout} variant="outline" className="w-full">Abmelden</Button>
                </CardFooter>
              </Card>
              
              <div className="mt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-1 gap-1">
                    <TabsTrigger value="dashboard" className="flex items-center justify-start gap-2">
                      <User size={16} />
                      <span>Profil</span>
                    </TabsTrigger>
                    <TabsTrigger value="applications" className="flex items-center justify-start gap-2">
                      <Calendar size={16} />
                      <span>Bewerbungen</span>
                    </TabsTrigger>
                    {(isModerator || isAdmin) && (
                      <TabsTrigger value="team" className="flex items-center justify-start gap-2">
                        <Users size={16} />
                        <span>Team</span>
                      </TabsTrigger>
                    )}
                    {isAdmin && (
                      <TabsTrigger value="admin" className="flex items-center justify-start gap-2">
                        <ShieldCheck size={16} />
                        <span>Admin</span>
                      </TabsTrigger>
                    )}
                    <TabsTrigger value="security" className="flex items-center justify-start gap-2">
                      <KeyRound size={16} />
                      <span>Sicherheit</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            {/* Tabs Content */}
            <div className="flex-1">
              <TabsContent value="dashboard" className="space-y-4 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Profil bearbeiten</CardTitle>
                    <CardDescription>
                      Verwalte deine persönlichen Informationen
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Benutzername</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="username" 
                          value={username} 
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={isLoading}
                          readOnly
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={handleInitiateUsernameChange}
                          disabled={isLoading || !usernameCooldown.canChange}
                          title={!usernameCooldown.canChange ? `Änderung erst in ${usernameCooldown.daysRemaining} Tagen wieder möglich` : 'Benutzername ändern'}
                        >
                          <Edit size={16} />
                        </Button>
                      </div>
                      {!usernameCooldown.canChange && usernameCooldown.nextChangeDate && (
                        <p className="text-xs text-gray-500">
                          Die nächste Änderung ist am {formatNextChangeDate(usernameCooldown.nextChangeDate)} möglich.
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discord_id">Discord ID</Label>
                      <Input 
                        id="discord_id" 
                        value={discordId} 
                        onChange={(e) => setDiscordId(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roblox_id">Roblox ID</Label>
                      <Input 
                        id="roblox_id" 
                        value={robloxId} 
                        onChange={(e) => setRobloxId(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setDiscordId(verifiedDiscordId);
                        setRobloxId(verifiedRobloxId);
                      }}
                      disabled={isLoading || !hasModifiedIds}
                    >
                      Abbrechen
                    </Button>
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Wird gespeichert...' : 'Speichern'}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="applications" className="space-y-4 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Meine Bewerbungen</CardTitle>
                    <CardDescription>
                      Hier siehst du den Status deiner Bewerbungen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {applications.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Keine Bewerbungen</h3>
                        <p className="text-gray-500">
                          Du hast noch keine Bewerbungen eingereicht.
                        </p>
                        <Button className="mt-4" onClick={() => navigate('/apply')}>
                          Jetzt bewerben
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {applications.map((application) => (
                          <Card key={application.id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{application.roblox_username}</h3>
                                  {getStatusBadge(application.status)}
                                </div>
                                <p className="text-sm text-gray-500">
                                  Eingereicht am {formatDate(application.created_at)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewApplication(application)}
                                >
                                  Details
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="team" className="space-y-4 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Team-Einstellungen</CardTitle>
                    <CardDescription>
                      Verwalte die Einstellungen für dein Team
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="font-medium">Bewerbungen</h3>
                        <p className="text-sm text-gray-500">
                          Aktiviere oder deaktiviere die Möglichkeit, Bewerbungen einzureichen
                        </p>
                      </div>
                      <Button 
                        variant={teamSettings.applications_open ? "default" : "outline"}
                        onClick={handleToggleApplications}
                      >
                        {teamSettings.applications_open ? 'Geöffnet' : 'Geschlossen'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="font-medium">Wartungsmodus</h3>
                        <p className="text-sm text-gray-500">
                          Aktiviere den Wartungsmodus, um die Seite vorübergehend zu deaktivieren
                        </p>
                      </div>
                      <Button 
                        variant={teamSettings.maintenance_mode ? "destructive" : "outline"}
                        onClick={handleToggleMaintenance}
                      >
                        {teamSettings.maintenance_mode ? 'Aktiviert' : 'Deaktiviert'}
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maintenance_message">Wartungsnachricht</Label>
                      <Textarea 
                        id="maintenance_message" 
                        value={teamSettings.maintenance_message}
                        onChange={(e) => setTeamSettings({
                          ...teamSettings,
                          maintenance_message: e.target.value
                        })}
                        rows={3}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateMaintenanceMessage(teamSettings.maintenance_message)}
                      >
                        Nachricht speichern
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="admin" className="space-y-4 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Admin-Bereich</CardTitle>
                    <CardDescription>
                      Verwalte die Servereinstellungen und Benutzer
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Admin-Benutzer</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-500 mb-2">
                            {users.length} Administratoren und Moderatoren
                          </p>
                          {loadingAdminUsers ? (
                            <div className="flex justify-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
                            </div>
                          ) : (
                            <div className="max-h-96 overflow-y-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Rolle</TableHead>
                                    <TableHead>Aktionen</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {users.map((user) => (
                                    <TableRow key={user.id}>
                                      <TableCell>
                                        <div className="flex flex-col">
                                          <span className="font-medium">{getUsernameById(user.user_id)}</span>
                                          <Badge variant="outline" className="w-fit mt-1">
                                            {user.role === 'admin' ? 'Administrator' : 'Moderator'}
                                          </Badge>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => handleEditUser(user)}
                                          >
                                            <Edit size={16} />
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => handleDeleteUser(user.id)}
                                          >
                                            <Trash2 size={16} className="text-red-500" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Statistiken</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Users size={20} className="text-blue-600" />
                                <span>Gesamt Benutzer</span>
                              </div>
                              <Badge variant="outline">{userCount}</Badge>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => invalidateAdminCache().then(() => fetchUserCount())}
                            >
                              Statistiken aktualisieren
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Bewerbungs-Verwaltung</CardTitle>
                        <CardDescription>
                          Verwalte alle eingehenden Bewerbungen
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loadingAllApplications ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
                          </div>
                        ) : allApplications.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                            <p>Keine Bewerbungen vorhanden</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Roblox Name</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Datum</TableHead>
                                  <TableHead>Aktionen</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {allApplications.map((application) => (
                                  <TableRow key={application.id}>
                                    <TableCell>{application.roblox_username}</TableCell>
                                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                                    <TableCell>{formatDate(application.created_at)}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          onClick={() => handleViewApplication(application)}
                                        >
                                          <Eye size={16} />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          onClick={() => handleDeleteApplication(application.id)}
                                        >
                                          <Trash2 size={16} className="text-red-500" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-4 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Sicherheitseinstellungen</CardTitle>
                    <CardDescription>
                      Verwalte deine Sicherheitseinstellungen und Zugangsdaten
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">E-Mail-Adresse</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleInitiateEmailChange}
                        >
                          Ändern
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Passwort</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">••••••••</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleInitiatePasswordChange}
                        >
                          Ändern
                        </Button>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-medium text-red-600 mb-2">Gefahrenzone</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Wenn du dein Konto löschst, werden alle deine Daten unwiderruflich gelöscht.
                      </p>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleInitiateDeleteAccount}
                      >
                        Konto löschen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Username Change Dialog */}
      <Dialog open={isUsernameDialogOpen} onOpenChange={setIsUsernameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Benutzername ändern</DialogTitle>
            <DialogDescription>
              Gib deinen neuen Benutzernamen ein. Du kannst deinen Benutzernamen nur alle 30 Tage ändern.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-username">Neuer Benutzername</Label>
              <Input 
                id="new-username" 
                value={newUsername} 
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Neuer Benutzername"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUsernameDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleUsernameChange} disabled={isLoading}>
              {isLoading ? 'Wird geändert...' : 'Ändern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Email Change Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>E-Mail-Adresse ändern</DialogTitle>
            <DialogDescription>
              Gib deine neue E-Mail-Adresse und dein aktuelles Passwort ein.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-email">Neue E-Mail-Adresse</Label>
              <Input 
                id="new-email" 
                type="email"
                value={newEmail} 
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="neue@email.de"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-password-email">Aktuelles Passwort</Label>
              <div className="relative">
                <Input 
                  id="current-password-email" 
                  type={showPassword ? "text" : "password"}
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Dein aktuelles Passwort"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEmailDialogOpen(false);
              setCurrentPassword('');
            }}>
              Abbrechen
            </Button>
            <Button onClick={handleEmailChange} disabled={isLoading}>
              {isLoading ? 'Wird geändert...' : 'Ändern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Passwort ändern</DialogTitle>
            <DialogDescription>
              Gib dein aktuelles Passwort und dein neues Passwort ein.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="current-password">Aktuelles Passwort</Label>
              <div className="relative">
                <Input 
                  id="current-password" 
                  type={showPassword ? "text" : "password"}
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Dein aktuelles Passwort"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Neues Passwort</Label>
              <div className="relative">
                <Input 
                  id="new-password" 
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Dein neues Passwort"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Passwort bestätigen</Label>
              <Input 
                id="confirm-password" 
                type={showNewPassword ? "text" : "password"}
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Passwort wiederholen"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsPasswordDialogOpen(false);
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            }}>
              Abbrechen
            </Button>
            <Button onClick={handlePasswordChange} disabled={isLoading}>
              {isLoading ? 'Wird geändert...' : 'Ändern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Application View Dialog */}
      <Dialog open={isApplicationDialogOpen} onOpenChange={setIsApplicationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bewerbungsdetails</DialogTitle>
            <DialogDescription>
              Details zur Bewerbung von {selectedApplication?.roblox_username}
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Roblox Username</Label>
                  <p className="text-sm font-medium">{selectedApplication.roblox_username}</p>
                </div>
                <div className="space-y-2">
                  <Label>Discord Username</Label>
                  <p className="text-sm font-medium">{selectedApplication.discord_username}</p>
                </div>
                <div className="space-y-2">
                  <Label>Alter</Label>
                  <p className="text-sm font-medium">{selectedApplication.age} Jahre</p>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedApplication.status)}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Erfahrung</Label>
                <div className="text-sm p-3 bg-gray-50 rounded-md">
                  {selectedApplication.experience}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Motivation</Label>
                <div className="text-sm p-3 bg-gray-50 rounded-md">
                  {selectedApplication.motivation}
                </div>
              </div>
              
              {(isAdmin || isModerator) && (
                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Admin-Notizen</Label>
                  <Textarea 
                    id="admin-notes" 
                    value={adminNotes} 
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Interne Notizen zur Bewerbung"
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {(isAdmin || isModerator) && selectedApplication && (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="flex-1 sm:flex-initial"
                  onClick={() => handleUpdateApplicationStatus('rejected')}
                >
                  Ablehnen
                </Button>
                <Button 
                  variant="default" 
                  className="flex-1 sm:flex-initial"
                  onClick={() => handleUpdateApplicationStatus('approved')}
                >
                  Annehmen
                </Button>
              </div>
            )}
            <Button 
              variant="ghost" 
              onClick={() => setIsApplicationDialogOpen(false)}
            >
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Benutzerrolle bearbeiten</DialogTitle>
            <DialogDescription>
              Ändere die Rolle des Benutzers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="user-role">Rolle</Label>
              <select 
                id="user-role" 
                value={newRole} 
                onChange={(e) => setNewRole(e.target.value as 'admin' | 'moderator')}
                className="w-full p-2 border rounded-md"
              >
                <option value="admin">Administrator</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleUpdateUserRole} disabled={isLoading}>
              {isLoading ? 'Wird gespeichert...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Account Dialog */}
      <Dialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Konto löschen</DialogTitle>
            <DialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten werden unwiderruflich gelöscht.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Achtung</AlertTitle>
              <AlertDescription>
                Durch das Löschen deines Kontos verlierst du den Zugriff auf alle deine Daten und Einstellungen.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="delete-password">Gib dein Passwort ein, um fortzufahren</Label>
              <div className="relative">
                <Input 
                  id="delete-password" 
                  type={showPassword ? "text" : "password"}
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Dein Passwort"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDeleteAccountDialogOpen(false);
              setCurrentPassword('');
            }}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isLoading}>
              {isLoading ? 'Wird gelöscht...' : 'Konto löschen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  );
};

export default Profile;
