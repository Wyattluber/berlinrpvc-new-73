import React, { useState, useEffect, useContext, useRef } from 'react';
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
  getTotalUserCount, deleteApplication, getUserApplicationsHistory, TeamSettings
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
  role: string;
  discordId?: string;
  robloxId?: string;
  avatar_url?: string;
  last_username_change?: string;
  email_changed?: boolean;
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

// Define a proper type for the team settings state
interface TeamSettingsState {
  meeting_day: string;
  meeting_time: string;
  meeting_frequency: string;
  meeting_location: string;
  meeting_notes: string;
}

const Profile = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [discordId, setDiscordId] = useState('');
  const [robloxId, setRobloxId] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(tabParam || 'dashboard');
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const session = useContext(SessionContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [teamSettings, setTeamSettings] = useState<TeamSettings | null>(null);
  const [isLoadingTeamSettings, setIsLoadingTeamSettings] = useState(false);
  const [editTeamSettings, setEditTeamSettings] = useState(false);
  const [newTeamSettings, setNewTeamSettings] = useState<TeamSettingsState>({
    meeting_day: '',
    meeting_time: '',
    meeting_frequency: '',
    meeting_location: '',
    meeting_notes: ''
  });

  // Password change state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');
  
  // Email change state
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  
  // Username change state
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameCooldown, setUsernameCooldown] = useState({
    canChange: true,
    daysRemaining: 0,
    nextChangeDate: new Date()
  });
  
  // Verification state
  const [verifyingUsername, setVerifyingUsername] = useState(false);
  
  // Validation state
  const [usernameValid, setUsernameValid] = useState(true);
  const [usernameValidationMessage, setUsernameValidationMessage] = useState('');

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
  
  // Profile image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Set greeting based on time of day
  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
  }, []);

  // Set active tab from URL parameter
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Password validation
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0);
      setPasswordFeedback('');
      return;
    }

    // Simple password strength check
    let strength = 0;
    let feedback = '';

    if (newPassword.length >= 8) strength += 1;
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/[a-z]/.test(newPassword)) strength += 1;
    if (/[0-9]/.test(newPassword)) strength += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1;

    switch (strength) {
      case 0:
      case 1:
        feedback = 'Sehr schwach';
        break;
      case 2:
        feedback = 'Schwach';
        break;
      case 3:
        feedback = 'Mittel';
        break;
      case 4:
        feedback = 'Stark';
        break;
      case 5:
        feedback = 'Sehr stark';
        break;
      default:
        feedback = '';
    }

    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  }, [newPassword]);

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
        name: user.user_metadata?.name || user.user_metadata?.full_name || user.user_metadata?.username || 'User',
        email: user.email || '',
        role: 'user',
        discordId: user.user_metadata?.discord_id || '',
        robloxId: user.user_metadata?.roblox_id || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        last_username_change: user.user_metadata?.last_username_change || null,
        email_changed: user.user_metadata?.email_changed || false,
      };

      setUser(userProfile);
      setDiscordId(userProfile.discordId || '');
      setAvatarUrl(userProfile.avatar_url || null);
      setRobloxId(userProfile.robloxId || '');
      setUsername(userProfile.name);
      
      fetchApplicationsHistory(user.id);
      fetchTeamSettings();
    };

    checkUser();
  }, [navigate, session]);

  // Check user role
  useEffect(() => {
    const checkUserRole = async () => {
      if (!session?.user?.id) return;
      
      const adminCheck = await checkIsAdmin();
      const modCheck = await checkIsModerator();
      
      setIsAdmin(adminCheck);
      setIsModerator(modCheck);
      
      if (adminCheck || modCheck) {
        fetchUserCount();
        fetchAdminUsersData();
        fetchAllApplications();
      }
    };
    
    checkUserRole();
  }, [session]);

  // Initialize team settings form when settings are loaded
  useEffect(() => {
    if (teamSettings) {
      setNewTeamSettings({
        meeting_day: teamSettings.meeting_day || '',
        meeting_time: teamSettings.meeting_time || '',
        meeting_frequency: teamSettings.meeting_frequency || '',
        meeting_location: teamSettings.meeting_location || '',
        meeting_notes: teamSettings.meeting_notes || ''
      });
    }
  }, [teamSettings]);

  // Check username cooldown
  useEffect(() => {
    if (user?.last_username_change) {
      const cooldown = checkUsernameCooldown(user.last_username_change);
      setUsernameCooldown(cooldown);
    }
  }, [user]);

  // Fetch usernames for admin users
  useEffect(() => {
    const fetchUsernames = async () => {
      if (!users.length) return;
      
      const userIds = users.map(user => user.user_id);
      const modifiedIds = [...new Set(userIds)];
      
      try {
        const { data, error } = await supabase.auth.admin.listUsers();
        
        if (error) throw error;
        
        const usernameMap: Record<string, string> = {};
        
        if (data && Array.isArray(data.users)) {
          data.users.forEach(user => {
            if (modifiedIds.includes(user.id)) {
              usernameMap[user.id] = user.user_metadata?.name || user.email || 'Unknown';
            }
          });
        }
        
        setUsernames(usernameMap);
      } catch (error) {
        console.error('Error fetching usernames:', error);
      }
    };
    
    fetchUsernames();
  }, [users]);
  
  const fetchTeamSettings = async () => {
    setIsLoadingTeamSettings(true);
    try {
      const settings = await getTeamSettings();
      if (settings) {
        setTeamSettings(settings);
        // Initialize newTeamSettings with the current settings
        setNewTeamSettings({
          meeting_day: settings.meeting_day || '',
          meeting_time: settings.meeting_time || '',
          meeting_frequency: settings.meeting_frequency || '',
          meeting_location: settings.meeting_location || '',
          meeting_notes: settings.meeting_notes || ''
        });
      }
    } catch (error) {
      console.error('Error fetching team settings:', error);
    } finally {
      setIsLoadingTeamSettings(false);
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

  const fetchAdminUsersData = async () => {
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
      console.error('Error fetching applications:', error);
    } finally {
      setLoadingAllApplications(false);
    }
  };

  const fetchApplicationsHistory = async (userId: string) => {
    setIsLoadingApplications(true);
    try {
      const applicationsHistory = await getUserApplicationsHistory(userId);
      if (applicationsHistory) {
        setApplications(applicationsHistory);
      }
    } catch (error) {
      console.error('Error fetching applications history:', error);
    } finally {
      setIsLoadingApplications(false);
    }
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
  
  const handleSaveProfile = () => {
    saveProfileData();
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Fehler",
        description: "Es gab ein Problem beim Abmelden.",
        variant: "destructive"
      });
    }
  };

  const handleInitiateUsernameChange = () => {
    if (!usernameCooldown.canChange) {
      toast({
        title: "Änderung nicht möglich",
        description: `Du kannst deinen Benutzernamen erst in ${usernameCooldown.daysRemaining} Tagen wieder ändern.`,
        variant: "destructive"
      });
      return;
    }
    
    setNewUsername(username);
    setUsernameError('');
    setShowUsernameDialog(true);
  };

  const handleUsernameChange = async () => {
    setVerifyingUsername(true);
    setUsernameError('');
    
    try {
      // Validate username format
      const validationResult = validateUsername(newUsername);
      if (!validationResult.valid) {
        setUsernameError(validationResult.message);
        setVerifyingUsername(false);
        return;
      }
      
      // Check if username is taken
      const isTaken = await isUsernameTaken(newUsername, user?.email);
      if (isTaken) {
        setUsernameError('Dieser Benutzername ist bereits vergeben.');
        setVerifyingUsername(false);
        return;
      }
      
      // Update username
      const { error } = await supabase.auth.updateUser({
        data: { 
          name: newUsername,
          last_username_change: new Date().toISOString()
        }
      });
      
      if (error) throw error;
      
      // Update local state
      setUsername(newUsername);
      if (user) {
        setUser({
          ...user,
          name: newUsername,
          last_username_change: new Date().toISOString()
        });
      }
      
      // Update cooldown
      setUsernameCooldown({
        canChange: false,
        daysRemaining: 30,
        nextChangeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      
      setShowUsernameDialog(false);
      
      toast({
        title: "Benutzername geändert",
        description: "Dein Benutzername wurde erfolgreich aktualisiert.",
      });
    } catch (error) {
      console.error('Error updating username:', error);
      setUsernameError('Es gab ein Problem beim Ändern des Benutzernamens.');
    } finally {
      setVerifyingUsername(false);
    }
  };

  const handleShowEmailChangeDialog = () => {
    if (user?.email_changed) {
      toast({
        title: "Änderung nicht möglich",
        description: "Du hast deine E-Mail-Adresse bereits geändert. Weitere Änderungen sind nicht möglich.",
        variant: "destructive"
      });
      return;
    }
    
    setNewEmail('');
    setEmailError('');
    setShowEmailDialog(true);
  };

  const handleEmailChange = async () => {
    setIsLoading(true);
    setEmailError('');
    
    try {
      if (!newEmail) {
        setEmailError('Bitte gib eine E-Mail-Adresse ein.');
        setIsLoading(false);
        return;
      }
      
      if (newEmail === user?.email) {
        setEmailError('Die neue E-Mail-Adresse muss sich von der aktuellen unterscheiden.');
        setIsLoading(false);
        return;
      }
      
      const result = await updateUserEmail(newEmail);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Mark email as changed in user metadata
      await supabase.auth.updateUser({
        data: { 
          email_changed: true
        }
      });
      
      if (user) {
        setUser({
          ...user,
          email_changed: true
        });
      }
      
      setShowEmailDialog(false);
      
      toast({
        title: "E-Mail-Änderung initiiert",
        description: "Bitte überprüfe dein E-Mail-Postfach, um die Änderung zu bestätigen.",
      });
    } catch (error: any) {
      console.error('Error updating email:', error);
      setEmailError(error.message || 'Es gab ein Problem beim Ändern der E-Mail-Adresse.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowPasswordDialog = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setShowPasswordDialog(true);
  };

  const handlePasswordChange = async () => {
    setIsLoading(true);
    setPasswordError('');
    setPasswordSuccess('');
    
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError('Bitte fülle alle Felder aus.');
        setIsLoading(false);
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setPasswordError('Die Passwörter stimmen nicht überein.');
        setIsLoading(false);
        return;
      }
      
      if (newPassword.length < 8) {
        setPasswordError('Das neue Passwort muss mindestens 8 Zeichen lang sein.');
        setIsLoading(false);
        return;
      }
      
      // Update password
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      
      setPasswordSuccess('Dein Passwort wurde erfolgreich geändert.');
      
      // Clear form after successful change
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        setShowPasswordDialog(false);
        setPasswordSuccess('');
      }, 2000);
      
      toast({
        title: "Passwort geändert",
        description: "Dein Passwort wurde erfolgreich aktualisiert.",
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      setPasswordError(error.message || 'Es gab ein Problem beim Ändern des Passworts.');
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

  const handleUpdateUser = async () => {
    if (!editUserId) return;
    
    setIsLoading(true);
    
    try {
      const result = await updateAdminUser(editUserId, editRole);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Update local state
      setUsers(users.map(user => 
        user.id === editUserId ? { ...user, role: editRole } : user
      ));
      
      setEditDialogOpen(false);
      
      toast({
        title: "Benutzer aktualisiert",
        description: "Die Benutzerrolle wurde erfolgreich aktualisiert.",
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      
      toast({
        title: "Fehler",
        description: error.message || "Es gab ein Problem beim Aktualisieren des Benutzers.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    setIsLoading(true);
    
    try {
      const result = await deleteAdminUser(id);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Update local state
      setUsers(users.filter(user => user.id !== id));
      
      toast({
        title: "Benutzer gelöscht",
        description: "Der Benutzer wurde erfolgreich gelöscht.",
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      
      toast({
        title: "Fehler",
        description: error.message || "Es gab ein Problem beim Löschen des Benutzers.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeleteApplication = (id: string) => {
    setApplicationToDelete(id);
    setConfirmDeleteDialog(true);
  };

  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return;
    
    setIsLoading(true);
    
    try {
      const result = await deleteApplication(applicationToDelete);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Update local state
      setAllApplications(allApplications.filter(app => app.id !== applicationToDelete));
      
      setConfirmDeleteDialog(false);
      setApplicationToDelete(null);
      
      toast({
        title: "Bewerbung gelöscht",
        description: "Die Bewerbung wurde erfolgreich gelöscht.",
      });
    } catch (error: any) {
      console.error('Error deleting application:', error);
      
      toast({
        title: "Fehler",
        description: error.message || "Es gab ein Problem beim Löschen der Bewerbung.",
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

  // Updated profile image handling
  const handleAvatarChange = (url: string | null) => {
    setAvatarUrl(url);
    if (user) {
      setUser({
        ...user,
        avatar_url: url || undefined
      });
    }
  };

  const getUserRoleName = () => {
    if (isAdmin) return 'Administrator';
    if (isModerator) return 'Moderator';
    return 'Benutzer';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unbekannt';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatNextChangeDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Ausstehend</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Genehmigt</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Abgelehnt</Badge>;
      case 'in_review':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Prüfung</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
                  <div className="flex items-center space-x-2">
                    <ProfileImageUpload 
                      userId={user.id} 
                      currentAvatarUrl={avatarUrl} 
                      onAvatarChange={handleAvatarChange} 
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{username}</h3>
                      <Badge 
                        variant={isAdmin ? "destructive" : isModerator ? "secondary" : "outline"}
                        className="mt-1"
                      >
                        {getUserRoleName()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail size={16} />
                    <span>{user.email}</span>
                  </div>
                  {discordId && (
                    <div className="flex items-center space-x-2">
                      <User size={16} />
                      <span>Discord: {discordId}</span>
                    </div>
                  )}
                  {robloxId && (
                    <div className="flex items-center space-x-2">
                      <User size={16} />
                      <span>Roblox: {robloxId}</span>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="border-t pt-4">
                  <Button onClick={handleLogout} variant="outline" className="w-full">
                    Abmelden
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">Beigetreten am {formatDate(session?.user?.created_at || '')}</p>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-2xl font-bold">{greeting}</h1>
                <p className="text-gray-600 mt-1">
                  Willkommen in deinem Profil-Dashboard. Hier kannst du deine Einstellungen verwalten.
                </p>
              </div>
              
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  <TabsTrigger value="dashboard" className="flex items-center">
                    <BarChart size={16} className="mr-2" />
                    <span>Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="profile" className="flex items-center">
                    <User size={16} className="mr-2" />
                    <span>Profil</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center">
                    <ShieldCheck size={16} className="mr-2" />
                    <span>Sicherheit</span>
                  </TabsTrigger>
                  <TabsTrigger value="applications" className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    <span>Bewerbungen</span>
                  </TabsTrigger>
                  {(isAdmin || isModerator) && (
                    <TabsTrigger value="admin" className="flex items-center">
                      <Users size={16} className="mr-2" />
                      <span>Administration</span>
                    </TabsTrigger>
                  )}
                </TabsList>
                
                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Übersicht</CardTitle>
                      <CardDescription>
                        Hier findest du eine Übersicht über dein Konto und aktuelle Informationen.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">Kontoinformationen</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Benutzername:</span>
                              <span>{username}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">E-Mail:</span>
                              <span>{user.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Rolle:</span>
                              <span>{getUserRoleName()}</span>
                            </div>
                          </div>
                        </div>
                        
                        {(isAdmin || isModerator) && teamSettings && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium mb-2">Team-Informationen</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Meeting-Tag:</span>
                                <span>{teamSettings.meeting_day || 'Nicht festgelegt'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Meeting-Zeit:</span>
                                <span>{teamSettings.meeting_time || 'Nicht festgelegt'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Häufigkeit:</span>
                                <span>{teamSettings.meeting_frequency || 'Nicht festgelegt'}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {applications.length > 0 && (
                        <div className="mt-6">
                          <h3 className="font-medium mb-2">Deine Bewerbungen</h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="space-y-3">
                              {applications.slice(0, 3).map((app) => (
                                <div key={app.id} className="flex justify-between items-center">
                                  <div>
                                    <div className="text-sm font-medium">Bewerbung vom {formatDate(app.created_at)}</div>
                                    <div className="text-xs text-gray-500">Letzte Aktualisierung: {formatDate(app.updated_at)}</div>
                                  </div>
                                  <div>
                                    {getStatusBadge(app.status)}
                                  </div>
                                </div>
                              ))}
                              {applications.length > 3 && (
                                <Button 
                                  variant="link" 
                                  className="p-0 h-auto text-sm"
                                  onClick={() => setActiveTab('applications')}
                                >
                                  Alle Bewerbungen anzeigen
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Hinweis</AlertTitle>
                          <AlertDescription>
                            Halte deine Kontaktdaten immer aktuell, damit wir dich bei Bedarf erreichen können.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profilinformationen</CardTitle>
                      <CardDescription>
                        Aktualisiere deine persönlichen Informationen
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Benutzername</Label>
                          <div className="flex">
                            <Input
                              id="username"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="flex-1"
                            />
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={handleInitiateUsernameChange}
                              className="ml-2"
                              title="Benutzername ändern"
                            >
                              <Edit size={16} />
                            </Button>
                          </div>
                          {!usernameCooldown.canChange && (
                            <p className="text-xs text-amber-500">
                              Nächste Änderung in {usernameCooldown.daysRemaining} Tagen möglich 
                              ({formatNextChangeDate(usernameCooldown.nextChangeDate)})
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">E-Mail-Adresse</Label>
                          <div className="flex">
                            <Input
                              id="email"
                              value={user.email}
                              readOnly
                              className="flex-1 bg-gray-50"
                            />
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={handleShowEmailChangeDialog}
                              className="ml-2"
                              title="E-Mail ändern"
                              disabled={user.email_changed}
                            >
                              <Edit size={16} />
                            </Button>
                          </div>
                          {user.email_changed && (
                            <p className="text-xs text-amber-500">
                              E-Mail bereits geändert. Weitere Änderungen nicht möglich.
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="discord_id">Discord-ID</Label>
                          <Input
                            id="discord_id"
                            value={discordId}
                            onChange={(e) => setDiscordId(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="roblox_id">Roblox-ID</Label>
                          <Input
                            id="roblox_id"
                            value={robloxId}
                            onChange={(e) => setRobloxId(e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <Button 
                        onClick={handleSaveProfile} 
                        disabled={isLoading}
                        className="ml-auto"
                      >
                        {isLoading ? 'Speichern...' : 'Profil speichern'}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Security Tab */}
                <TabsContent value="security" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sicherheitseinstellungen</CardTitle>
                      <CardDescription>
                        Verwalte deine Passwörter und Sicherheitsoptionen
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">Passwort ändern</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Ändere dein Passwort regelmäßig für mehr Sicherheit
                              </p>
                            </div>
                            <Button onClick={handleShowPasswordDialog}>
                              Passwort ändern
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">E-Mail-Adresse ändern</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Aktualisiere deine E-Mail-Adresse
                              </p>
                            </div>
                            <Button 
                              onClick={handleShowEmailChangeDialog}
                              disabled={user.email_changed}
                            >
                              E-Mail ändern
                            </Button>
                          </div>
                          {user.email_changed && (
                            <p className="text-xs text-amber-500 mt-2">
                              E-Mail bereits geändert. Weitere Änderungen nicht möglich.
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <Alert className="mt-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Sicherheitshinweis</AlertTitle>
                        <AlertDescription>
                          Verwende ein starkes, einzigartiges Passwort und teile es niemals mit anderen.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Applications Tab */}
                <TabsContent value="applications" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Deine Bewerbungen</CardTitle>
                      <CardDescription>
                        Übersicht über deine eingereichten Bewerbungen
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingApplications ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                        </div>
                      ) : applications.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Datum</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Letzte Aktualisierung</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {applications.map((application) => (
                              <TableRow key={application.id}>
                                <TableCell>{formatDate(application.created_at)}</TableCell>
                                <TableCell>{getStatusBadge(application.status)}</TableCell>
                                <TableCell>{formatDate(application.updated_at)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Du hast noch keine Bewerbungen eingereicht.</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => navigate('/apply')}
                          >
                            Jetzt bewerben
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Admin Tab */}
                {(isAdmin || isModerator) && (
                  <TabsContent value="admin" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Administration</CardTitle>
                        <CardDescription>
                          Verwalte Benutzer und Einstellungen
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Team Settings */}
                        {isAdmin && (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-medium">Team-Einstellungen</h3>
                              <Button 
                                variant="outline" 
                                onClick={() => setEditTeamSettings(!editTeamSettings)}
                              >
                                {editTeamSettings ? 'Abbrechen' : 'Bearbeiten'}
                              </Button>
                            </div>
                            
                            {isLoadingTeamSettings ? (
                              <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                              </div>
                            ) : editTeamSettings ? (
                              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="meeting_day">Meeting-Tag</Label>
                                    <Input
                                      id="meeting_day"
                                      value={newTeamSettings.meeting_day}
                                      onChange={(e) => setNewTeamSettings({...newTeamSettings, meeting_day: e.target.value})}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="meeting_time">Meeting-Zeit</Label>
                                    <Input
                                      id="meeting_time"
                                      value={newTeamSettings.meeting_time}
                                      onChange={(e) => setNewTeamSettings({...newTeamSettings, meeting_time: e.target.value})}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="meeting_frequency">Häufigkeit</Label>
                                    <Input
                                      id="meeting_frequency"
                                      value={newTeamSettings.meeting_frequency}
                                      onChange={(e) => setNewTeamSettings({...newTeamSettings, meeting_frequency: e.target.value})}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="meeting_location">Ort</Label>
                                    <Input
                                      id="meeting_location"
                                      value={newTeamSettings.meeting_location}
                                      onChange={(e) => setNewTeamSettings({...newTeamSettings, meeting_location: e.target.value})}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="meeting_notes">Notizen</Label>
                                  <Textarea
                                    id="meeting_notes"
                                    value={newTeamSettings.meeting_notes}
                                    onChange={(e) => setNewTeamSettings({...newTeamSettings, meeting_notes: e.target.value})}
                                    rows={3}
                                  />
                                </div>
                                <div className="flex justify-end">
                                  <Button 
                                    onClick={handleSaveTeamSettings}
                                    disabled={isLoading}
                                  >
                                    {isLoading ? 'Speichern...' : 'Einstellungen speichern'}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50 p-4 rounded-lg">
                                {teamSettings ? (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-500">Meeting-Tag</h4>
                                        <p>{teamSettings.meeting_day || 'Nicht festgelegt'}</p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-500">Meeting-Zeit</h4>
                                        <p>{teamSettings.meeting_time || 'Nicht festgelegt'}</p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-500">Häufigkeit</h4>
                                        <p>{teamSettings.meeting_frequency || 'Nicht festgelegt'}</p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-500">Ort</h4>
                                        <p>{teamSettings.meeting_location || 'Nicht festgelegt'}</p>
                                      </div>
                                    </div>
                                    {teamSettings.meeting_notes && (
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-500">Notizen</h4>
                                        <p className="whitespace-pre-line">{teamSettings.meeting_notes}</p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-gray-500">Keine Team-Einstellungen vorhanden.</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Admin Users */}
                        {isAdmin && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Admin-Benutzer</h3>
                            
                            {loadingAdminUsers ? (
                              <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                              </div>
                            ) : users.length > 0 ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Benutzer</TableHead>
                                    <TableHead>Rolle</TableHead>
                                    <TableHead>Hinzugefügt am</TableHead>
                                    <TableHead className="text-right">Aktionen</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {users.map((user) => (
                                    <TableRow key={user.id}>
                                      <TableCell>{usernames[user.user_id] || user.user_id}</TableCell>
                                      <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                          {user.role === 'admin' ? 'Administrator' : 'Moderator'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>{formatDate(user.created_at)}</TableCell>
                                      <TableCell className="text-right">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                              <span className="sr-only">Menü öffnen</span>
                                              <Settings className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                              <Edit className="mr-2 h-4 w-4" />
                                              <span>Bearbeiten</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                              onClick={() => handleDeleteUser(user.id)}
                                              className="text-red-600"
                                            >
                                              <Trash2 className="mr-2 h-4 w-4" />
                                              <span>Löschen</span>
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <p className="text-gray-500">Keine Admin-Benutzer vorhanden.</p>
                            )}
                          </div>
                        )}
                        
                        {/* Applications */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Bewerbungen</h3>
                          
                          {loadingAllApplications ? (
                            <div className="flex justify-center py-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                            </div>
                          ) : allApplications.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Benutzer</TableHead>
                                  <TableHead>Discord</TableHead>
                                  <TableHead>Roblox</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Datum</TableHead>
                                  <TableHead className="text-right">Aktionen</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {allApplications.map((app) => (
                                  <TableRow key={app.id}>
                                    <TableCell>{app.user_id}</TableCell>
                                    <TableCell>{app.discord_id}</TableCell>
                                    <TableCell>{app.roblox_username}</TableCell>
                                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                                    <TableCell>{formatDate(app.created_at)}</TableCell>
                                    <TableCell className="text-right">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Menü öffnen</span>
                                            <Settings className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                                          <DropdownMenuItem onClick={() => handleViewApplication(app)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            <span>Ansehen</span>
                                          </DropdownMenuItem>
                                          {isAdmin && (
                                            <>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem 
                                                onClick={() => handleConfirmDeleteApplication(app.id)}
                                                className="text-red-600"
                                              >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Löschen</span>
                                              </DropdownMenuItem>
                                            </>
                                          )}
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <p className="text-gray-500">Keine Bewerbungen vorhanden.</p>
                          )}
                        </div>
                        
                        {/* Stats */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-lg font-medium mb-3">Statistiken</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-3 rounded shadow-sm">
                              <div className="text-sm text-gray-500">Benutzer insgesamt</div>
                              <div className="text-2xl font-bold">{userCount}</div>
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm">
                              <div className="text-sm text-gray-500">Admin-Benutzer</div>
                              <div className="text-2xl font-bold">{users.length}</div>
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm">
                              <div className="text-sm text-gray-500">Bewerbungen</div>
                              <div className="text-2xl font-bold">{allApplications.length}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Passwort ändern</DialogTitle>
            <DialogDescription>
              Gib dein aktuelles Passwort und ein neues Passwort ein.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Aktuelles Passwort</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
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
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          passwordStrength <= 2 ? 'bg-red-500' : 
                          passwordStrength <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                        }`} 
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">{passwordFeedback}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Passwort bestätigen</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
            {passwordError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Fehler</AlertTitle>
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
            {passwordSuccess && (
              <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Erfolg</AlertTitle>
                <AlertDescription>{passwordSuccess}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handlePasswordChange} disabled={isLoading}>
              {isLoading ? 'Speichern...' : 'Passwort ändern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Email Change Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>E-Mail-Adresse ändern</DialogTitle>
            <DialogDescription>
              Gib deine neue E-Mail-Adresse ein. Du erhältst eine Bestätigungs-E-Mail.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-email">Aktuelle E-Mail-Adresse</Label>
              <Input
                id="current-email"
                value={user.email}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Neue E-Mail-Adresse</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            {emailError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Fehler</AlertTitle>
                <AlertDescription>{emailError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleEmailChange} disabled={isLoading}>
              {isLoading ? 'Speichern...' : 'E-Mail ändern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Username Change Dialog */}
      <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Benutzername ändern</DialogTitle>
            <DialogDescription>
              Gib deinen neuen Benutzernamen ein. Du kannst deinen Benutzernamen nur alle 30 Tage ändern.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-username">Aktueller Benutzername</Label>
              <Input
                id="current-username"
                value={username}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-username">Neuer Benutzername</Label>
              <Input
                id="new-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            {usernameError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Fehler</AlertTitle>
                <AlertDescription>{usernameError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUsernameDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleUsernameChange} disabled={isLoading || verifyingUsername}>
              {verifyingUsername ? 'Überprüfen...' : isLoading ? 'Speichern...' : 'Benutzername ändern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Admin User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Benutzerrolle bearbeiten</DialogTitle>
            <DialogDescription>
              Ändere die Rolle des Benutzers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role">Rolle</Label>
              <select
                id="role"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="admin">Administrator</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleUpdateUser} disabled={isLoading}>
              {isLoading ? 'Speichern...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirm Delete Application Dialog */}
      <Dialog open={confirmDeleteDialog} onOpenChange={setConfirmDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bewerbung löschen</DialogTitle>
            <DialogDescription>
              Bist du sicher, dass du diese Bewerbung löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteApplication} 
              disabled={isLoading}
            >
              {isLoading ? 'Löschen...' : 'Löschen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Application Dialog */}
      <Dialog open={viewApplicationDialog} onOpenChange={setViewApplicationDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bewerbung ansehen</DialogTitle>
            <DialogDescription>
              Details der Bewerbung
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {currentViewApplication && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Discord-ID</h4>
                    <p>{currentViewApplication.discord_id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Roblox-Benutzername</h4>
                    <p>{currentViewApplication.roblox_username}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Roblox-ID</h4>
                    <p>{currentViewApplication.roblox_id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Alter</h4>
                    <p>{currentViewApplication.age}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Aktivitätslevel</h4>
                    <p>{currentViewApplication.activity_level}/10</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <p>{getStatusBadge(currentViewApplication.status)}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Admin-Erfahrung</h4>
                  <p className="whitespace-pre-line">{currentViewApplication.admin_experience || 'Keine Angabe'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Andere Server</h4>
                  <p className="whitespace-pre-line">{currentViewApplication.other_servers || 'Keine Angabe'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">FRP-Verständnis</h4>
                  <p className="whitespace-pre-line">{currentViewApplication.frp_understanding}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">VDM-Verständnis</h4>
                  <p className="whitespace-pre-line">{currentViewApplication.vdm_understanding}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Bodycam-Verständnis</h4>
                  <p className="whitespace-pre-line">{currentViewApplication.bodycam_understanding}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Taschen-RP-Verständnis</h4>
                  <p className="whitespace-pre-line">{currentViewApplication.taschen_rp_understanding}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Server-Alter-Verständnis</h4>
                  <p className="whitespace-pre-line">{currentViewApplication.server_age_understanding}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Freund-Regelverstoß</h4>
                  <p className="whitespace-pre-line">{currentViewApplication.friend_rule_violation}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Situationshandhabung</h4>
                  <p className="whitespace-pre-line">{currentViewApplication.situation_handling}</p>
                </div>
                
                {currentViewApplication.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Notizen</h4>
                    <p className="whitespace-pre-line">{currentViewApplication.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setViewApplicationDialog(false)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
