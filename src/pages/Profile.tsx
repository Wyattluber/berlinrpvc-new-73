
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
                      <h3 className="text-lg font-medium">{username}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <Badge className="mt-1">{getUserRoleName()}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                  />
                  <Button 
                    variant="outline" 
                    className="w-full mb-2 flex items-center justify-center"
                    onClick={handleFileUpload}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <>Wird hochgeladen...</>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Profilbild ändern
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    Abmelden
                  </Button>
                </CardContent>
              </Card>
              
              <div className="mt-6">
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger 
                    value="dashboard" 
                    className="flex items-center justify-start"
                    onClick={() => setActiveTab('dashboard')}
                    data-state={activeTab === 'dashboard' ? 'active' : ''}
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    Dashboard
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="profile" 
                    className="flex items-center justify-start"
                    onClick={() => setActiveTab('profile')}
                    data-state={activeTab === 'profile' ? 'active' : ''}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="security" 
                    className="flex items-center justify-start"
                    onClick={() => setActiveTab('security')}
                    data-state={activeTab === 'security' ? 'active' : ''}
                  >
                    <KeyRound className="mr-2 h-4 w-4" />
                    Sicherheit
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="applications" 
                    className="flex items-center justify-start"
                    onClick={() => setActiveTab('applications')}
                    data-state={activeTab === 'applications' ? 'active' : ''}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Bewerbungen
                  </TabsTrigger>
                  
                  {isAdmin && (
                    <TabsTrigger 
                      value="admin" 
                      className="flex items-center justify-start"
                      onClick={() => setActiveTab('admin')}
                      data-state={activeTab === 'admin' ? 'active' : ''}
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Admin
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>
            </div>
            
            <div className="flex-grow">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsContent value="dashboard" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {greeting}, {username}!
                      </CardTitle>
                      <CardDescription>
                        Hier siehst du eine Übersicht deines Kontos.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {applications.length > 0 ? (
                          <div>
                            <h3 className="text-lg font-medium mb-2">Deine Bewerbung</h3>
                            <div className="rounded-lg border p-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">Status: {getStatusBadge(applications[0].status)}</div>
                                  <div className="text-sm text-gray-500">Eingereicht am: {formatDate(applications[0].created_at)}</div>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setActiveTab('applications')}
                                >
                                  Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-dashed p-4 text-center">
                            <div className="text-gray-500">
                              <Calendar className="h-10 w-10 mx-auto mb-2" />
                              <p>Du hast noch keine Bewerbung eingereicht.</p>
                              <Button 
                                variant="outline" 
                                className="mt-3"
                                onClick={() => navigate('/apply')}
                              >
                                Jetzt bewerben
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {user.last_username_change && (
                          <div className="rounded-lg border p-4">
                            <h3 className="text-lg font-medium mb-2">Benutzername</h3>
                            {!usernameCooldown.canChange ? (
                              <Alert variant="default" className="bg-blue-50 border-blue-200">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Hinweis</AlertTitle>
                                <AlertDescription>
                                  Du kannst deinen Benutzernamen erst wieder in {usernameCooldown.daysRemaining} Tagen ändern.
                                  {usernameCooldown.nextChangeDate && (
                                    <span className="block mt-1">
                                      Nächste mögliche Änderung: {formatNextChangeDate(usernameCooldown.nextChangeDate)}
                                    </span>
                                  )}
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">{username}</div>
                                  <div className="text-sm text-gray-500">Du kannst deinen Benutzernamen ändern</div>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={handleInitiateUsernameChange}
                                >
                                  Ändern
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Profile Tab */}
                <TabsContent value="profile" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profil</CardTitle>
                      <CardDescription>
                        Verwalte deine persönlichen Informationen.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Benutzername</Label>
                        <div className="flex space-x-4">
                          <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            readOnly={!usernameCooldown.canChange}
                            className={!usernameCooldown.canChange ? "bg-gray-100" : ""}
                          />
                          {usernameCooldown.canChange ? (
                            <Button 
                              variant="outline" 
                              onClick={handleInitiateUsernameChange}
                            >
                              Ändern
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              disabled
                              title={`Nächste Änderung in ${usernameCooldown.daysRemaining} Tagen möglich`}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              {usernameCooldown.daysRemaining}T
                            </Button>
                          )}
                        </div>
                        {!usernameCooldown.canChange && (
                          <p className="text-xs text-gray-500">
                            Benutzernamen können nur alle 30 Tage geändert werden.
                            Nächste mögliche Änderung: {formatNextChangeDate(usernameCooldown.nextChangeDate)}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="discordId">Discord ID</Label>
                        <Input
                          id="discordId"
                          value={discordId}
                          onChange={(e) => setDiscordId(e.target.value)}
                          placeholder="Deine Discord ID (optional)"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="robloxId">Roblox ID</Label>
                        <Input
                          id="robloxId"
                          value={robloxId}
                          onChange={(e) => setRobloxId(e.target.value)}
                          placeholder="Deine Roblox ID (optional)"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-6 flex justify-between">
                      <Button variant="outline" onClick={() => {
                        setDiscordId(verifiedDiscordId);
                        setRobloxId(verifiedRobloxId);
                      }}>
                        Zurücksetzen
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={isLoading}>
                        {isLoading ? 'Wird gespeichert...' : 'Speichern'}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Security Tab */}
                <TabsContent value="security" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sicherheit</CardTitle>
                      <CardDescription>
                        Verwalte deine Sicherheitseinstellungen.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Email-Adresse</h3>
                        <div className="flex space-x-4 items-center">
                          <div className="flex-grow">
                            <Input
                              id="email"
                              value={user.email}
                              readOnly
                              className="bg-gray-100"
                            />
                          </div>
                          <Button
                            variant="outline"
                            onClick={handleShowEmailChangeDialog}
                            disabled={user.email_changed}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Ändern
                          </Button>
                        </div>
                        {user.email_changed && (
                          <p className="text-xs text-gray-500 mt-2">
                            Du hast deine Email bereits geändert. Weitere Änderungen sind nicht möglich.
                          </p>
                        )}
                      </div>
                      
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-medium mb-4">Passwort ändern</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">Neues Passwort</Label>
                            <div className="relative">
                              <Input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                autoComplete="new-password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3"
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                            <div className="relative">
                              <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm font-medium mb-2">Anforderungen an das Passwort:</p>
                            <div className="flex items-center space-x-2">
                              <div className={`w-4 h-4 rounded-full ${passwordValidation.length ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <span className="text-sm">Mindestens 8 Zeichen</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className={`w-4 h-4 rounded-full ${passwordValidation.hasLetter ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <span className="text-sm">Mindestens ein Buchstabe</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className={`w-4 h-4 rounded-full ${passwordValidation.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <span className="text-sm">Mindestens eine Ziffer</span>
                            </div>
                          </div>
                          
                          {passwordError && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Fehler</AlertTitle>
                              <AlertDescription>
                                {passwordError}
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {passwordChangeSuccess && (
                            <Alert className="bg-green-50 border-green-200">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <AlertTitle>Erfolg</AlertTitle>
                              <AlertDescription>
                                Dein Passwort wurde erfolgreich aktualisiert.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-6">
                      <Button 
                        disabled={isLoading || !newPassword || !confirmPassword || !passwordValidation.length || !passwordValidation.hasLetter || !passwordValidation.hasNumber} 
                        onClick={handleChangePassword}
                      >
                        {isLoading ? 'Wird geändert...' : 'Passwort ändern'}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Applications Tab */}
                <TabsContent value="applications" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Bewerbungen</CardTitle>
                      <CardDescription>
                        Deine Bewerbungshistorie und Status.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingApplications ? (
                        <div className="py-8 text-center">
                          <p>Daten werden geladen...</p>
                        </div>
                      ) : applications.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Status</TableHead>
                              <TableHead>Eingereicht</TableHead>
                              <TableHead>Aktualisiert</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {applications.map((application) => (
                              <TableRow key={application.id}>
                                <TableCell>{getStatusBadge(application.status)}</TableCell>
                                <TableCell>{formatDate(application.created_at)}</TableCell>
                                <TableCell>{formatDate(application.updated_at)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="py-8 text-center border rounded-lg">
                          <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <h3 className="text-lg font-medium mb-2">Keine Bewerbungen</h3>
                          <p className="text-gray-500 mb-4">Du hast noch keine Bewerbung eingereicht.</p>
                          <Button onClick={() => navigate('/apply')}>
                            Jetzt bewerben
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Admin Tab */}
                {isAdmin && (
                  <TabsContent value="admin" className="mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Admin-Bereich</CardTitle>
                        <CardDescription>
                          Verwalte Nutzer, Bewerbungen und Einstellungen.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-3 flex items-center">
                            <Users className="mr-2 h-5 w-5" />
                            Nutzer-Statistik
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="border rounded-lg p-4 bg-gray-50">
                              <h4 className="text-sm font-medium text-gray-500">Gesamt-Nutzer</h4>
                              <p className="text-2xl font-bold">{userCount}</p>
                            </div>
                            <div className="border rounded-lg p-4 bg-gray-50">
                              <h4 className="text-sm font-medium text-gray-500">Admins</h4>
                              <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
                            </div>
                            <div className="border rounded-lg p-4 bg-gray-50">
                              <h4 className="text-sm font-medium text-gray-500">Moderatoren</h4>
                              <p className="text-2xl font-bold">{users.filter(u => u.role === 'moderator').length}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t">
                          <h3 className="text-lg font-medium mb-3 flex items-center">
                            <Users className="mr-2 h-5 w-5" />
                            Admin-Nutzer verwalten
                          </h3>
                          
                          {loadingAdminUsers ? (
                            <div className="py-8 text-center">
                              <p>Daten werden geladen...</p>
                            </div>
                          ) : users.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Benutzer-ID</TableHead>
                                  <TableHead>Rolle</TableHead>
                                  <TableHead>Erstellt</TableHead>
                                  <TableHead className="text-right">Aktionen</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {users.map((adminUser) => (
                                  <TableRow key={adminUser.id}>
                                    <TableCell>{getUsernameById(adminUser.user_id)}</TableCell>
                                    <TableCell>
                                      <Badge variant={adminUser.role === 'admin' ? 'default' : 'outline'}>
                                        {adminUser.role === 'admin' ? 'Administrator' : 'Moderator'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{formatDate(adminUser.created_at)}</TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => handleEditUser(adminUser)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="text-red-500 hover:text-red-700"
                                          onClick={() => handleDeleteUser(adminUser.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="py-8 text-center border rounded-lg">
                              <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                              <h3 className="text-lg font-medium mb-2">Keine Admin-Nutzer</h3>
                              <p className="text-gray-500">Es wurden keine Admin-Nutzer gefunden.</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="pt-4 border-t">
                          <h3 className="text-lg font-medium mb-3 flex items-center">
                            <Calendar className="mr-2 h-5 w-5" />
                            Bewerbungen
                          </h3>
                          
                          {loadingAllApplications ? (
                            <div className="py-8 text-center">
                              <p>Daten werden geladen...</p>
                            </div>
                          ) : allApplications.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Eingereicht</TableHead>
                                  <TableHead>Aktualisiert</TableHead>
                                  <TableHead className="text-right">Aktionen</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {allApplications.map((application) => (
                                  <TableRow key={application.id}>
                                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                                    <TableCell>{formatDate(application.created_at)}</TableCell>
                                    <TableCell>{formatDate(application.updated_at)}</TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => handleViewApplication(application)}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="text-red-500 hover:text-red-700"
                                          onClick={() => handleDeleteApplication(application.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="py-8 text-center border rounded-lg">
                              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                              <h3 className="text-lg font-medium mb-2">Keine Bewerbungen</h3>
                              <p className="text-gray-500">Es wurden keine Bewerbungen gefunden.</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="pt-4 border-t">
                          <h3 className="text-lg font-medium mb-3 flex items-center">
                            <Settings className="mr-2 h-5 w-5" />
                            Team-Einstellungen
                          </h3>
                          
                          {isLoadingTeamSettings ? (
                            <div className="py-8 text-center">
                              <p>Daten werden geladen...</p>
                            </div>
                          ) : (
                            <>
                              {editTeamSettings ? (
                                <div className="space-y-4 p-4 border rounded-lg">
                                  <div className="space-y-2">
                                    <Label htmlFor="meeting_day">Meeting-Tag</Label>
                                    <Input
                                      id="meeting_day"
                                      value={newTeamSettings.meeting_day}
                                      onChange={(e) => setNewTeamSettings({...newTeamSettings, meeting_day: e.target.value})}
                                      placeholder="z.B. Montag"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="meeting_time">Meeting-Zeit</Label>
                                    <Input
                                      id="meeting_time"
                                      value={newTeamSettings.meeting_time}
                                      onChange={(e) => setNewTeamSettings({...newTeamSettings, meeting_time: e.target.value})}
                                      placeholder="z.B. 18:00 Uhr"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="meeting_frequency">Meeting-Häufigkeit</Label>
                                    <Input
                                      id="meeting_frequency"
                                      value={newTeamSettings.meeting_frequency}
                                      onChange={(e) => setNewTeamSettings({...newTeamSettings, meeting_frequency: e.target.value})}
                                      placeholder="z.B. Wöchentlich"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="meeting_location">Meeting-Ort</Label>
                                    <Input
                                      id="meeting_location"
                                      value={newTeamSettings.meeting_location}
                                      onChange={(e) => setNewTeamSettings({...newTeamSettings, meeting_location: e.target.value})}
                                      placeholder="z.B. Discord-Server"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="meeting_notes">Notizen</Label>
                                    <Textarea
                                      id="meeting_notes"
                                      value={newTeamSettings.meeting_notes}
                                      onChange={(e) => setNewTeamSettings({...newTeamSettings, meeting_notes: e.target.value})}
                                      placeholder="Zusätzliche Informationen"
                                      rows={3}
                                    />
                                  </div>
                                  
                                  <div className="flex justify-end space-x-2 pt-4">
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
                                      {isLoading ? 'Wird gespeichert...' : 'Speichern'}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 border rounded-lg">
                                  {teamSettings ? (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-500">Meeting-Tag</h4>
                                          <p>{teamSettings.meeting_day || 'Nicht festgelegt'}</p>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-500">Meeting-Zeit</h4>
                                          <p>{teamSettings.meeting_time || 'Nicht festgelegt'}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4">
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
                                      
                                      <div className="pt-2">
                                        <Button
                                          variant="outline"
                                          onClick={() => setEditTeamSettings(true)}
                                        >
                                          <Edit className="mr-2 h-4 w-4" />
                                          Bearbeiten
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center py-6">
                                      <Settings className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                      <h3 className="text-lg font-medium mb-2">Keine Einstellungen</h3>
                                      <p className="text-gray-500 mb-4">Es wurden noch keine Team-Einstellungen konfiguriert.</p>
                                      <Button onClick={() => setEditTeamSettings(true)}>
                                        Einstellungen festlegen
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
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
      
      {/* Dialogs */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Änderungen bestätigen</DialogTitle>
            <DialogDescription>
              Bitte bestätige, dass du diese IDs ändern möchtest.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {verifiedDiscordId !== discordId && (
              <div>
                <p className="font-medium">Discord ID</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="bg-gray-100 px-3 py-1 rounded text-gray-600 line-through">
                    {verifiedDiscordId || 'Nicht gesetzt'}
                  </div>
                  <span>→</span>
                  <div className="bg-blue-50 px-3 py-1 rounded text-blue-600 font-medium">
                    {discordId || 'Nicht gesetzt'}
                  </div>
                </div>
              </div>
            )}
            
            {verifiedRobloxId !== robloxId && (
              <div>
                <p className="font-medium">Roblox ID</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="bg-gray-100 px-3 py-1 rounded text-gray-600 line-through">
                    {verifiedRobloxId || 'Nicht gesetzt'}
                  </div>
                  <span>→</span>
                  <div className="bg-blue-50 px-3 py-1 rounded text-blue-600 font-medium">
                    {robloxId || 'Nicht gesetzt'}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelIdChange}>
              Abbrechen
            </Button>
            <Button onClick={confirmIdChange}>
              Bestätigen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showUsernameChangeDialog} onOpenChange={setShowUsernameChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Benutzernamen ändern</DialogTitle>
            <DialogDescription>
              Du kannst deinen Benutzernamen nur alle 30 Tage ändern. 
              Bitte wähle sorgfältig einen neuen Namen aus.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="newUsername">Neuer Benutzername</Label>
              <Input
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Neuer Benutzername"
              />
            </div>
            
            {!usernameValidationResult.valid && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Ungültiger Benutzername</AlertTitle>
                <AlertDescription>
                  {usernameValidationResult.reason}
                </AlertDescription>
              </Alert>
            )}
            
            {isUsernameTakenCheck === true && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Benutzername bereits vergeben</AlertTitle>
                <AlertDescription>
                  Dieser Benutzername wird bereits von einem anderen Nutzer verwendet.
                </AlertDescription>
              </Alert>
            )}
            
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertTitle>Wichtiger Hinweis</AlertTitle>
              <AlertDescription>
                Nach der Änderung kannst du deinen Benutzernamen erst in 30 Tagen wieder ändern.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUsernameChangeDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={confirmUsernameChange} 
              disabled={!usernameValidationResult.valid || isUsernameTakenCheck === true || isLoading}
            >
              {isLoading ? 'Wird geändert...' : 'Bestätigen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showEmailChangeDialog} onOpenChange={setShowEmailChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>E-Mail-Adresse ändern</DialogTitle>
            <DialogDescription>
              Du kannst deine E-Mail-Adresse nur einmal ändern.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="newEmail">Neue E-Mail-Adresse</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="neue@email.de"
              />
            </div>
            
            {emailChangeError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Fehler</AlertTitle>
                <AlertDescription>
                  {emailChangeError}
                </AlertDescription>
              </Alert>
            )}
            
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertTitle>Wichtiger Hinweis</AlertTitle>
              <AlertDescription>
                Du erhältst eine Bestätigungs-E-Mail an deine neue Adresse. 
                Die Änderung wird erst wirksam, nachdem du den Link in dieser E-Mail bestätigt hast.
                <br /><br />
                <span className="font-semibold">Du kannst deine E-Mail-Adresse nur einmal ändern.</span>
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailChangeDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleChangeEmail} 
              disabled={!newEmail || newEmail === user.email || isLoading}
            >
              {isLoading ? 'Wird geändert...' : 'Bestätigen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Benutzer bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeite die Rolle des Benutzers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="role">Rolle</Label>
              <select
                id="role"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="moderator">Moderator</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleSaveUser} 
              disabled={isLoading}
            >
              {isLoading ? 'Wird gespeichert...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={confirmDeleteDialog} onOpenChange={setConfirmDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bewerbung löschen</DialogTitle>
            <DialogDescription>
              Möchtest du diese Bewerbung wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteApplication} 
              disabled={isLoading}
            >
              {isLoading ? 'Wird gelöscht...' : 'Löschen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={viewApplicationDialog} onOpenChange={setViewApplicationDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bewerbungsdetails</DialogTitle>
            <DialogDescription>
              Details der ausgewählten Bewerbung.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            {currentViewApplication && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <div className="mt-1">{getStatusBadge(currentViewApplication.status)}</div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Eingereicht am</h3>
                    <p>{formatDate(currentViewApplication.created_at)}</p>
                  </div>
                </div>
                
                {Object.entries(currentViewApplication).map(([key, value]) => {
                  // Skip internal fields and arrays/objects that would need special handling
                  if (['id', 'user_id', 'created_at', 'updated_at', 'status'].includes(key) || 
                      typeof value === 'object' || Array.isArray(value)) {
                    return null;
                  }
                  
                  return (
                    <div key={key} className="border-t pt-4">
                      <h3 className="text-sm font-medium text-gray-500 capitalize">
                        {key.replace(/_/g, ' ')}
                      </h3>
                      <p className="mt-1 whitespace-pre-line">{value as string || 'Nicht angegeben'}</p>
                    </div>
                  );
                })}
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
      
      <Toaster />
    </div>
  );
};

export default Profile;
