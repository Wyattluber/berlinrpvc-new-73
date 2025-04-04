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
  
  const [newEmail, setNewEmail] = useState('');
  const [showEmailChangeDialog, setShowEmailChangeDialog] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null);
  
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    hasLetter: false,
    hasNumber: false
  });

  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifiedDiscordId, setVerifiedDiscordId] = useState('');
  const [verifiedRobloxId, setVerifiedRobloxId] = useState('');
  const [hasModifiedIds, setHasModifiedIds] = useState(false);
  
  const [showUsernameChangeDialog, setShowUsernameChangeDialog] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameValidationResult, setUsernameValidationResult] = useState<{valid: boolean; reason?: string}>({ valid: true });
  const [isUsernameTakenCheck, setIsUsernameTakenCheck] = useState<boolean | null>(null);
  const [usernameCooldown, setUsernameCooldown] = useState<{canChange: boolean; daysRemaining: number; nextChangeDate: Date | null}>({
    canChange: true,
    daysRemaining: 0,
    nextChangeDate: null
  });

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

  // Time-based greeting update
  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getTimeBasedGreeting());
    };
    
    // Set initial greeting
    updateGreeting();
    
    // Update greeting every minute
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const newTab = searchParams.get('tab');
    if (newTab) {
      setActiveTab(newTab);
    }
  }, [searchParams]);

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
      setVerifiedDiscordId(userProfile.discordId || '');
      setRobloxId(userProfile.robloxId || '');
      setVerifiedRobloxId(userProfile.robloxId || '');
      setUsername(userProfile.name || '');
      setNewUsername(userProfile.name || '');
      setNewEmail(userProfile.email || '');
      
      // Check username cooldown
      if (userProfile.last_username_change) {
        const cooldownInfo = checkUsernameCooldown(new Date(userProfile.last_username_change));
        setUsernameCooldown(cooldownInfo);
      }
      
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
            fetchAdminUsersData();
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
  
  // Validate username when it changes
  useEffect(() => {
    const validateNewUsername = () => {
      if (newUsername) {
        const validationResult = validateUsername(newUsername);
        setUsernameValidationResult(validationResult);
        
        // Check if username is taken (but only if it passed basic validation)
        if (validationResult.valid && user?.email) {
          checkIfUsernameTaken(newUsername, user.email);
        } else {
          setIsUsernameTakenCheck(null);
        }
      } else {
        setUsernameValidationResult({ valid: false, reason: "Benutzername darf nicht leer sein" });
        setIsUsernameTakenCheck(null);
      }
    };
    
    validateNewUsername();
  }, [newUsername, user?.email]);

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
      const count = await getCachedUserCount();
      setUserCount(count);
    } catch (error) {
      console.error('Error fetching user count:', error);
    }
  };

  const fetchAdminUsersData = async () => {
    setLoadingAdminUsers(true);
    try {
      const users = await fetchAdminUsers();
      setUsers(users);
      
      // Fetch usernames for all user IDs
      if (users && users.length > 0) {
        const userIds = users.map(user => user.user_id);
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
  
  const checkIfUsernameTaken = async (username: string, currentEmail: string) => {
    const result = await isUsernameTaken(username, currentEmail);
    setIsUsernameTakenCheck(result);
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
    setShowUsernameChangeDialog(true);
  };
  
  const confirmUsernameChange = async () => {
    if (!newUsername || !usernameValidationResult.valid || isUsernameTakenCheck) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase.auth.updateUser({
        data: { 
          name: newUsername,
          last_username_change: now
        }
      });

      if (error) throw error;

      if (user) {
        setUser({
          ...user,
          name: newUsername,
          last_username_change: now
        });
      }
      
      setUsername(newUsername);
      
      // Update cooldown information
      const cooldownInfo = checkUsernameCooldown(new Date(now));
      setUsernameCooldown(cooldownInfo);
      
      toast({
        title: "Benutzername geändert",
        description: "Dein Benutzername wurde erfolgreich aktualisiert.",
      });
      
      setShowUsernameChangeDialog(false);
    } catch (error) {
      console.error('Error updating username:', error);
      toast({
        title: "Fehler",
        description: "Es gab ein Problem beim Ändern deines Benutzernamens.",
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
  
  const handleShowEmailChangeDialog = () => {
    if (user?.email_changed) {
      toast({
        title: "Hinweis",
        description: "Du hast deine E-Mail bereits geändert. Weitere Änderungen sind nicht möglich.",
        variant: "destructive"
      });
      return;
    }
    
    setNewEmail(user?.email || '');
    setEmailChangeError(null);
    setShowEmailChangeDialog(true);
  };
  
  const handleChangeEmail = async () => {
    setEmailChangeError(null);
    setIsLoading(true);
    
    if (!newEmail || newEmail === user?.email) {
      setEmailChangeError("Bitte gib eine neue E-Mail-Adresse ein");
      setIsLoading(false);
      return;
    }
    
    try {
      // Mark that the user has changed their email
      await supabase.auth.updateUser({
        data: { 
          email_changed: true
        }
      });
      
      const result = await updateUserEmail(newEmail);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      if (user) {
        setUser({
          ...user,
          email_changed: true
        });
      }
      
      setShowEmailChangeDialog(false);
      
      toast({
        title: "E-Mail-Änderung",
        description: result.message,
      });
    } catch (error: any) {
      console.error('Error updating email:', error);
      setEmailChangeError(error.message || "Es gab ein Problem bei der Änderung der E-Mail");
      
      toast({
        title: "Fehler",
        description: error.message || "Es gab ein Problem bei der Änderung der E-Mail",
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
      const result = await updateAdminUser(editUserId!, editRole);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      toast({
        title: "Erfolgreich",
        description: result.message,
      });
      
      fetchAdminUsersData();
      setEditDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Aktualisieren des Benutzers.",
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
      
      toast({
        title: "Erfolgreich",
        description: result.message,
      });
      
      fetchAdminUsersData();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Löschen des Benutzers.",
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
  
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Datei zu groß",
        description: "Das Bild darf maximal 5MB groß sein.",
        variant: "destructive"
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ungültiger Dateityp",
        description: "Bitte wähle ein Bild (JPG, PNG, etc.).",
        variant: "destructive"
      });
      return;
    }
    
    setUploadingImage(true);
    
    try {
      // Upload image to Supabase Storage
      const fileName = `avatar-${user?.id}-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);
      
      if (error) throw error;
      
      // Get public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      if (!urlData.publicUrl) throw new Error("Couldn't get public URL");
      
      // Update user metadata with avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          avatar_url: urlData.publicUrl
        }
      });
      
      if (updateError) throw updateError;
      
      // Update local state
      if (user) {
        setUser({
          ...user,
          avatar_url: urlData.publicUrl
        });
      }
      
      toast({
        title: "Bild hochgeladen",
        description: "Dein Profilbild wurde erfolgreich aktualisiert.",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Fehler",
        description: error.message || "Es gab ein Problem beim Hochladen des Bildes.",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
  
  const formatNextChangeDate = (date: Date | null) => {
    if (!date) return '';
    
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
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
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-100">
                        <img 
                          src={user.avatar_url} 
                          alt={user.name}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="bg-blue-600 text-white p-3 rounded-full w-16 h-16 flex items-center justify-center">
                        <User size={32} />
                      </div>
                    )}
                    <div>
