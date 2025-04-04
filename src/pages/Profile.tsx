
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
                      <h2 className="font-semibold text-lg">{username}</h2>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                    <TabsList className="flex flex-col items-stretch space-y-1 h-auto bg-transparent p-0">
                      <TabsTrigger value="dashboard" className="justify-start">
                        <User className="mr-2" size={18} />
                        Profil
                      </TabsTrigger>
                      <TabsTrigger value="applications" className="justify-start">
                        <Calendar className="mr-2" size={18} />
                        Bewerbungen
                      </TabsTrigger>
                      <TabsTrigger value="security" className="justify-start">
                        <KeyRound className="mr-2" size={18} />
                        Sicherheit
                      </TabsTrigger>
                      {(isAdmin || isModerator) && (
                        <TabsTrigger value="team" className="justify-start">
                          <Settings className="mr-2" size={18} />
                          Team
                        </TabsTrigger>
                      )}
                      {isAdmin && (
                        <TabsTrigger value="admin" className="justify-start">
                          <ShieldCheck className="mr-2" size={18} />
                          Admin
                        </TabsTrigger>
                      )}
                    </TabsList>
                  </Tabs>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    Abmelden
                  </Button>
                </CardFooter>
              </Card>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
              
              <Button
                variant="outline"
                className="w-full mt-4 flex items-center justify-center gap-2"
                onClick={handleFileUpload}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <span>Wird hochgeladen...</span>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Profilbild hochladen</span>
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-2xl font-bold">{greeting}, {username}</h1>
                <p className="text-gray-600">
                  <Badge className="mt-1" variant="outline">
                    {getUserRoleName()}
                  </Badge>
                </p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="dashboard" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Persönliche Daten</span>
                        <Badge variant="outline" className="ml-2">
                          {getUserRoleName()}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Verwalte deine persönlichen Informationen
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
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
                              variant="outline" 
                              className="ml-2" 
                              onClick={handleInitiateUsernameChange}
                              title={!usernameCooldown.canChange 
                                ? `Nächste Änderung möglich ab: ${formatNextChangeDate(usernameCooldown.nextChangeDate)}`
                                : "Benutzernamen ändern"
                              }
                            >
                              <Edit size={16} />
                            </Button>
                          </div>
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
                              variant="outline" 
                              className="ml-2" 
                              onClick={handleShowEmailChangeDialog}
                              disabled={user.email_changed}
                              title={user.email_changed 
                                ? "E-Mail wurde bereits geändert und kann nicht erneut geändert werden" 
                                : "E-Mail-Adresse ändern"
                              }
                            >
                              <Mail size={16} />
                            </Button>
                          </div>
                          {user.email_changed && (
                            <p className="text-xs text-amber-600">
                              <AlertTriangle className="inline-block mr-1" size={12} />
                              E-Mails können nur einmal geändert werden
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="discord">Discord ID</Label>
                          <Input
                            id="discord"
                            value={discordId}
                            onChange={(e) => setDiscordId(e.target.value)}
                            placeholder="Deine Discord ID"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="roblox">Roblox ID</Label>
                          <Input
                            id="roblox"
                            value={robloxId}
                            onChange={(e) => setRobloxId(e.target.value)}
                            placeholder="Deine Roblox ID"
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="default"
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Wird gespeichert...' : 'Speichern'}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="applications" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Deine Bewerbungen</CardTitle>
                      <CardDescription>
                        Hier siehst du den Verlauf deiner Bewerbungen
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingApplications ? (
                        <div className="flex justify-center py-8">
                          <p>Bewerbungen werden geladen...</p>
                        </div>
                      ) : applications.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Status</TableHead>
                              <TableHead>Eingereicht am</TableHead>
                              <TableHead>Letzte Aktualisierung</TableHead>
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
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <AlertCircle className="mb-2 text-amber-500" size={36} />
                          <p className="text-gray-600">Du hast noch keine Bewerbungen eingereicht</p>
                          <Button className="mt-4" onClick={() => navigate('/apply')}>
                            Jetzt bewerben
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Passwort ändern</CardTitle>
                      <CardDescription>
                        Hier kannst du dein Passwort ändern
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                          <div className={`text-xs flex items-center ${passwordValidation.length ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-3 h-3 rounded-full mr-1 ${passwordValidation.length ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                            Mindestens 8 Zeichen
                          </div>
                          <div className={`text-xs flex items-center ${passwordValidation.hasLetter ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-3 h-3 rounded-full mr-1 ${passwordValidation.hasLetter ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                            Mindestens 1 Buchstabe
                          </div>
                          <div className={`text-xs flex items-center ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-3 h-3 rounded-full mr-1 ${passwordValidation.hasNumber ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                            Mindestens 1 Ziffer
                          </div>
                        </div>
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
                      
                      {passwordChangeSuccess && (
                        <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertTitle>Erfolg</AlertTitle>
                          <AlertDescription>Dein Passwort wurde erfolgreich geändert</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={handleChangePassword}
                        disabled={
                          isLoading ||
                          !currentPassword ||
                          !newPassword ||
                          !confirmPassword ||
                          newPassword !== confirmPassword ||
                          !passwordValidation.length ||
                          !passwordValidation.hasLetter ||
                          !passwordValidation.hasNumber
                        }
                      >
                        {isLoading ? 'Wird gespeichert...' : 'Passwort ändern'}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {(isAdmin || isModerator) && (
                  <TabsContent value="team" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Team-Einstellungen</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditTeamSettings(!editTeamSettings)}
                          >
                            {editTeamSettings ? 'Abbrechen' : 'Bearbeiten'}
                          </Button>
                        </CardTitle>
                        <CardDescription>
                          Verwalte die Einstellungen für dein Team
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {isLoadingTeamSettings ? (
                          <div className="text-center py-4">Einstellungen werden geladen...</div>
                        ) : (
                          <>
                            {editTeamSettings ? (
                              <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label htmlFor="meeting-day">Meeting-Tag</Label>
                                    <Input
                                      id="meeting-day"
                                      value={newTeamSettings.meeting_day}
                                      onChange={(e) => setNewTeamSettings({
                                        ...newTeamSettings,
                                        meeting_day: e.target.value
                                      })}
                                      placeholder="z.B. Montag"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="meeting-time">Meeting-Zeit</Label>
                                    <Input
                                      id="meeting-time"
                                      value={newTeamSettings.meeting_time}
                                      onChange={(e) => setNewTeamSettings({
                                        ...newTeamSettings,
                                        meeting_time: e.target.value
                                      })}
                                      placeholder="z.B. 18:00 Uhr"
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label htmlFor="meeting-frequency">Häufigkeit</Label>
                                    <Input
                                      id="meeting-frequency"
                                      value={newTeamSettings.meeting_frequency}
                                      onChange={(e) => setNewTeamSettings({
                                        ...newTeamSettings,
                                        meeting_frequency: e.target.value
                                      })}
                                      placeholder="z.B. Wöchentlich"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="meeting-location">Ort</Label>
                                    <Input
                                      id="meeting-location"
                                      value={newTeamSettings.meeting_location}
                                      onChange={(e) => setNewTeamSettings({
                                        ...newTeamSettings,
                                        meeting_location: e.target.value
                                      })}
                                      placeholder="z.B. Discord"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="meeting-notes">Notizen</Label>
                                  <Textarea
                                    id="meeting-notes"
                                    value={newTeamSettings.meeting_notes}
                                    onChange={(e) => setNewTeamSettings({
                                      ...newTeamSettings,
                                      meeting_notes: e.target.value
                                    })}
                                    placeholder="Zusätzliche Informationen"
                                    rows={3}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {teamSettings ? (
                                  <>
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div>
                                        <p className="text-sm font-medium text-gray-500">Meeting-Tag</p>
                                        <p>{teamSettings.meeting_day || '-'}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-500">Meeting-Zeit</p>
                                        <p>{teamSettings.meeting_time || '-'}</p>
                                      </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div>
                                        <p className="text-sm font-medium text-gray-500">Häufigkeit</p>
                                        <p>{teamSettings.meeting_frequency || '-'}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-500">Ort</p>
                                        <p>{teamSettings.meeting_location || '-'}</p>
                                      </div>
                                    </div>
                                    {teamSettings.meeting_notes && (
                                      <div>
                                        <p className="text-sm font-medium text-gray-500">Notizen</p>
                                        <p className="whitespace-pre-line">{teamSettings.meeting_notes}</p>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="text-center py-4 text-gray-500">
                                    Keine Einstellungen vorhanden. Klicke auf "Bearbeiten" um Einstellungen hinzuzufügen.
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                      {editTeamSettings && (
                        <CardFooter>
                          <Button
                            onClick={handleSaveTeamSettings}
                            disabled={isLoading}
                          >
                            {isLoading ? 'Wird gespeichert...' : 'Speichern'}
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  </TabsContent>
                )}

                {isAdmin && (
                  <TabsContent value="admin" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Benutzer verwalten</CardTitle>
                        <CardDescription>
                          Hier kannst du Admin- und Moderator-Benutzer verwalten
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <div className="stats bg-blue-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Gesamte Benutzer</p>
                              <p className="text-2xl font-bold">{userCount}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Admin Benutzer</p>
                              <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
                            </div>
                          </div>
                        </div>
                        <div className="overflow-hidden rounded-md border">
                          {loadingAdminUsers ? (
                            <div className="text-center py-8">Benutzer werden geladen...</div>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Benutzer</TableHead>
                                  <TableHead>Rolle</TableHead>
                                  <TableHead>Erstellt am</TableHead>
                                  <TableHead className="w-[100px]">Aktionen</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {users.length > 0 ? (
                                  users.map((user) => (
                                    <TableRow key={user.id}>
                                      <TableCell className="font-medium">{getUsernameById(user.user_id)}</TableCell>
                                      <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                          {user.role === 'admin' ? 'Administrator' : 'Moderator'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {formatDate(user.created_at)}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center space-x-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditUser(user)}
                                          >
                                            <Edit size={16} />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <Trash2 size={16} />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                      Keine Benutzer gefunden
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Bewerbungen</CardTitle>
                        <CardDescription>
                          Alle eingegangenen Bewerbungen anzeigen und verwalten
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-hidden rounded-md border">
                          {loadingAllApplications ? (
                            <div className="text-center py-8">Bewerbungen werden geladen...</div>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Erstellt am</TableHead>
                                  <TableHead>Aktualisiert am</TableHead>
                                  <TableHead className="w-[100px]">Aktionen</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {allApplications.length > 0 ? (
                                  allApplications.map((application) => (
                                    <TableRow key={application.id}>
                                      <TableCell>
                                        {getStatusBadge(application.status)}
                                      </TableCell>
                                      <TableCell>
                                        {formatDate(application.created_at)}
                                      </TableCell>
                                      <TableCell>
                                        {formatDate(application.updated_at)}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center space-x-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleViewApplication(application)}
                                          >
                                            <Eye size={16} />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteApplication(application.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <Trash2 size={16} />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                      Keine Bewerbungen gefunden
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
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
      
      {/* Dialog for ID verification */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>IDs überprüfen</DialogTitle>
            <DialogDescription>
              Bist du sicher, dass du deine IDs ändern möchtest? Dies könnte Auswirkungen auf deine Berechtigungen haben.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {discordId !== verifiedDiscordId && (
              <div className="flex items-center space-x-2">
                <p className="flex-1">Discord ID ändern von <span className="font-mono">{verifiedDiscordId || '-'}</span> zu <span className="font-mono">{discordId}</span></p>
              </div>
            )}
            
            {robloxId !== verifiedRobloxId && (
              <div className="flex items-center space-x-2">
                <p className="flex-1">Roblox ID ändern von <span className="font-mono">{verifiedRobloxId || '-'}</span> zu <span className="font-mono">{robloxId}</span></p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={cancelIdChange}>Abbrechen</Button>
            <Button onClick={confirmIdChange}>Bestätigen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for username change */}
      <Dialog open={showUsernameChangeDialog} onOpenChange={setShowUsernameChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Benutzernamen ändern</DialogTitle>
            <DialogDescription>
              Wähle einen neuen Benutzernamen. Du kannst deinen Benutzernamen nur alle 30 Tage ändern.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-username">Neuer Benutzername</Label>
              <Input
                id="new-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
              
              {!usernameValidationResult.valid && (
                <p className="text-sm text-red-500">{usernameValidationResult.reason}</p>
              )}
              
              {isUsernameTakenCheck && (
                <p className="text-sm text-red-500">Dieser Benutzername ist bereits vergeben</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUsernameChangeDialog(false)}>Abbrechen</Button>
            <Button 
              onClick={confirmUsernameChange}
              disabled={!usernameValidationResult.valid || isUsernameTakenCheck === true || isLoading}
            >
              {isLoading ? 'Wird gespeichert...' : 'Bestätigen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for email change */}
      <Dialog open={showEmailChangeDialog} onOpenChange={setShowEmailChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>E-Mail-Adresse ändern</DialogTitle>
            <DialogDescription>
              Gib deine neue E-Mail-Adresse ein. Du kannst diese nur einmal ändern.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">Neue E-Mail-Adresse</Label>
              <Input
                id="new-email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                type="email"
              />
              
              {emailChangeError && (
                <p className="text-sm text-red-500">{emailChangeError}</p>
              )}
              
              <Alert variant="warning" className="mt-4 bg-amber-50 border-amber-200 text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Wichtiger Hinweis</AlertTitle>
                <AlertDescription>
                  Die E-Mail-Adresse kann nur einmal geändert werden.
                  Nach der Änderung erhältst du eine Bestätigungs-E-Mail an die neue Adresse.
                </AlertDescription>
              </Alert>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailChangeDialog(false)}>Abbrechen</Button>
            <Button 
              onClick={handleChangeEmail}
              disabled={!newEmail || newEmail === user.email || isLoading}
            >
              {isLoading ? 'Wird gespeichert...' : 'Bestätigen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for editing user role */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Benutzerrolle bearbeiten</DialogTitle>
            <DialogDescription>
              Ändere die Rolle des Benutzers
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-role">Rolle</Label>
              <select 
                id="user-role" 
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
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Abbrechen</Button>
            <Button 
              onClick={handleSaveUser}
              disabled={isLoading}
            >
              {isLoading ? 'Wird gespeichert...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for confirming application deletion */}
      <Dialog open={confirmDeleteDialog} onOpenChange={setConfirmDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bewerbung löschen</DialogTitle>
            <DialogDescription>
              Bist du sicher, dass du diese Bewerbung löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteDialog(false)}>Abbrechen</Button>
            <Button 
              onClick={confirmDeleteApplication}
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? 'Wird gelöscht...' : 'Löschen bestätigen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for viewing application details */}
      <Dialog open={viewApplicationDialog} onOpenChange={setViewApplicationDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bewerbungsdetails</DialogTitle>
            <DialogDescription>
              Vollständige Informationen zur Bewerbung
            </DialogDescription>
          </DialogHeader>
          
          {currentViewApplication && (
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(currentViewApplication.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Erstellt am</p>
                  <p>{formatDate(currentViewApplication.created_at)}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Bewerbungsdaten</h4>
                {Object.entries(currentViewApplication).map(([key, value]) => {
                  // Skip internal or redundant fields
                  if (['id', 'user_id', 'created_at', 'updated_at', 'status'].includes(key)) {
                    return null;
                  }
                  
                  return (
                    <div key={key} className="mb-3">
                      <p className="text-sm font-medium text-gray-500 capitalize">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="whitespace-pre-line">{String(value || '-')}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewApplicationDialog(false)}>Schließen</Button>
            {currentViewApplication && (
              <Button 
                variant="destructive"
                onClick={() => {
                  setViewApplicationDialog(false);
                  handleDeleteApplication(currentViewApplication.id);
                }}
              >
                Löschen
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </div>
  );
};

export default Profile;
