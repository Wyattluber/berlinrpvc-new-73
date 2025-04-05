import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SessionContext } from '../App';
import { LoaderIcon, CheckCircle, Calendar, Bell, HelpCircle, AlertTriangle, Plus, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getUserApplicationsHistory, checkIsAdmin } from '@/lib/admin';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import MeetingCountdown from '@/components/MeetingCountdown';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { loadNewsIntoProfile } from '@/helpers/newsLoader';
import AdminPanel from '@/pages/AdminPanel';
import { getTeamSettings } from '@/lib/adminService';
import UserDataChangeRequest from '@/components/profile/UserDataChangeRequest';
import AccountDeletionRequest from '@/components/profile/AccountDeletionRequest';
import AnnouncementsList from '@/components/AnnouncementsList';

type Application = {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  season_id?: string | null;
};

type ProfileLocks = {
  discord_locked: boolean;
  roblox_locked: boolean;
};

const checkProfileIdsLocked = async (userId: string): Promise<ProfileLocks> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('discord_id, roblox_id')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error checking profile locks:', error);
      return { discord_locked: false, roblox_locked: false };
    }
    
    return {
      discord_locked: !!data?.discord_id,
      roblox_locked: !!data?.roblox_id
    };
  } catch (error) {
    console.error('Error checking profile locks:', error);
    return { discord_locked: false, roblox_locked: false };
  }
};

const updateUserProfile = async (userId: string, profileData: { discord_id?: string, roblox_id?: string }) => {
  try {
    if (profileData.discord_id && !/^\d+$/.test(profileData.discord_id)) {
      return { success: false, message: 'Discord ID muss nur aus Zahlen bestehen.' };
    }
    
    if (profileData.roblox_id && !/^\d+$/.test(profileData.roblox_id)) {
      return { success: false, message: 'Roblox ID muss nur aus Zahlen bestehen.' };
    }
    
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('discord_id, roblox_id')
      .eq('id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return { success: false, message: 'Fehler beim Abrufen des Profils.' };
    }
    
    const updatedData: any = {};
    
    if (profileData.discord_id && !existingProfile?.discord_id) {
      updatedData.discord_id = profileData.discord_id;
    }
    
    if (profileData.roblox_id && !existingProfile?.roblox_id) {
      updatedData.roblox_id = profileData.roblox_id;
    }
    
    if (Object.keys(updatedData).length > 0) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        return { success: false, message: 'Fehler beim Aktualisieren des Profils.' };
      }
    }
    
    return { success: true, message: 'Profil erfolgreich aktualisiert.' };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return { success: false, message: 'Ein unerwarteter Fehler ist aufgetreten.' };
  }
};

const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [username, setUsername] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [discordId, setDiscordId] = useState('');
  const [robloxId, setRobloxId] = useState('');
  const [profileLocks, setProfileLocks] = useState<ProfileLocks>({ discord_locked: false, roblox_locked: false });
  const [isUsernameAvailable, setIsUsernameAvailable] = useState({ valid: true, reason: '' });
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingProfiles, setIsUpdatingProfiles] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailUpdateMessage, setEmailUpdateMessage] = useState('');
  const [emailUpdateSuccess, setEmailUpdateSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [activeSeasonApplications, setActiveSeasonApplications] = useState<Application[]>([]);
  const [previousSeasonApplications, setPreviousSeasonApplications] = useState<Application[]>([]);
  const [teamSettings, setTeamSettings] = useState<any>(null);
  const [showUserRoleDialog, setShowUserRoleDialog] = useState(false);
  const [roleUserEmail, setRoleUserEmail] = useState('');
  const [roleUserSelection, setRoleUserSelection] = useState('');
  const [roleType, setRoleType] = useState<'admin' | 'moderator'>('moderator');
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();
  const session = useContext(SessionContext);
  const activeTab = searchParams.get('tab') || 'dashboard';
  const announcementId = searchParams.get('id');

  const { 
    isLoading: isApplicationsLoading, 
    error: applicationsError, 
    data: applicationsData,
    refetch: refetchApplications 
  } = useQuery({
    queryKey: ['userApplications', session?.user?.id], 
    queryFn: () => getUserApplicationsHistory(session?.user?.id || ''),
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (applicationsData) {
      const allApplications = applicationsData as Application[];
      setApplications(allApplications);
      
      setActiveSeasonApplications(allApplications);
      setPreviousSeasonApplications([]);
    }
  }, [applicationsData]);

  useEffect(() => {
    const fetchTeamSettings = async () => {
      try {
        const settings = await getTeamSettings();
        setTeamSettings(settings);
      } catch (error) {
        console.error("Error fetching team settings:", error);
      }
    };
    
    fetchTeamSettings();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      
      if (!session?.user) {
        setLoading(false);
        return;
      }
      
      try {
        const { data: userDetails, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        setUser(userDetails?.user || null);
        setUsername(userDetails?.user?.user_metadata?.name || '');
        setUserAvatar(userDetails?.user?.user_metadata?.avatar_url || '');
        
        const locks = await checkProfileIdsLocked(session.user.id);
        setProfileLocks(locks);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('discord_id, roblox_id')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile data:", profileError);
        } else if (profileData) {
          setDiscordId(profileData.discord_id || '');
          setRobloxId(profileData.roblox_id || '');
        }
        
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
        
        const { data: modData, error: modError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('role', 'moderator');
          
        if (!modError && modData && modData.length > 0) {
          setIsModerator(true);
        }
        
        refetchApplications();
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Fehler",
          description: error.message || "Es gab ein Problem beim Laden deines Profils.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [session, refetchApplications]);

  useEffect(() => {
    const getTimeBasedGreeting = () => {
      const hour = new Date().getHours();
      let greetingText = '';
      
      if (hour >= 5 && hour < 12) {
        greetingText = 'Guten Morgen';
      } else if (hour >= 12 && hour < 18) {
        greetingText = 'Guten Tag';
      } else if (hour >= 18 && hour < 22) {
        greetingText = 'Guten Abend';
      } else {
        greetingText = 'Gute Nacht';
      }
      
      setGreeting(greetingText);
    };
    
    getTimeBasedGreeting();
    
    const intervalId = setInterval(getTimeBasedGreeting, 3600000);
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      setTimeout(() => {
        loadNewsIntoProfile();
      }, 500);
    }
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleAvatarChange = (url: string) => {
    setUserAvatar(url);
    setUser(prevUser => ({
      ...prevUser,
      user_metadata: {
        ...prevUser.user_metadata,
        avatar_url: url
      }
    }));
  };

  const checkUsernameAvailability = async (name: string) => {
    if (!name || name.length < 3) {
      setIsUsernameAvailable({ valid: false, reason: 'Benutzername muss mindestens 3 Zeichen lang sein.' });
      return;
    }
    
    if (name === user?.user_metadata?.name) {
      setIsUsernameAvailable({ valid: true, reason: '' });
      return;
    }
    
    try {
      const response = await fetch(`/api/checkUsername?username=${name}`);
      const data = await response.json();
      setIsUsernameAvailable(data);
    } catch (error) {
      console.error("Error checking username availability:", error);
      setIsUsernameAvailable({ valid: false, reason: 'Fehler beim Überprüfen der Verfügbarkeit des Benutzernamens.' });
    }
  };

  const updateUsername = async () => {
    setIsUpdatingUsername(true);
    
    if (!username || username.length < 3) {
      toast({
        title: "Fehler",
        description: "Benutzername muss mindestens 3 Zeichen lang sein.",
        variant: "destructive"
      });
      setIsUpdatingUsername(false);
      return;
    }
    
    if (!isUsernameAvailable.valid) {
      toast({
        title: "Fehler",
        description: isUsernameAvailable.reason || "Benutzername ist nicht verfügbar.",
        variant: "destructive"
      });
      setIsUpdatingUsername(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          name: username
        }
      });
      
      if (error) throw error;
      
      setUser(prevUser => ({
        ...prevUser,
        user_metadata: {
          ...prevUser.user_metadata,
          name: username,
          username_changed_at: new Date().toISOString()
        }
      }));
      
      toast({
        title: "Benutzername aktualisiert",
        description: "Dein Benutzername wurde erfolgreich aktualisiert.",
      });
    } catch (error: any) {
      console.error("Error updating username:", error);
      toast({
        title: "Fehler",
        description: error.message || "Es gab ein Problem beim Aktualisieren deines Benutzernamens.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const updateProfileData = async () => {
    setIsUpdatingProfiles(true);
    
    try {
      const result = await updateUserProfile(session?.user?.id || '', {
        discord_id: discordId,
        roblox_id: robloxId
      });
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      const locks = await checkProfileIdsLocked(session?.user?.id || '');
      setProfileLocks(locks);
      
      toast({
        title: "Profil aktualisiert",
        description: "Deine Profildaten wurden erfolgreich aktualisiert.",
      });
    } catch (error: any) {
      console.error("Error updating profile data:", error);
      toast({
        title: "Fehler",
        description: error.message || "Es gab ein Problem beim Aktualisieren deiner Profildaten.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingProfiles(false);
    }
  };

  const updateEmail = async () => {
    setIsUpdatingEmail(true);
    setEmailUpdateMessage('');
    setEmailUpdateSuccess(false);
    
    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      toast({
        title: "Fehler",
        description: "Bitte gib eine gültige E-Mail-Adresse ein.",
        variant: "destructive"
      });
      setIsUpdatingEmail(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });
      
      if (error) throw error;
      
      setEmailUpdateSuccess(true);
      setEmailUpdateMessage('E-Mail Aktualisierungsanfrage gesendet. Bitte überprüfe dein E-Mail-Postfach, um die Änderung zu bestätigen.');
      toast({
        title: "E-Mail Aktualisierung",
        description: "E-Mail Aktualisierungsanfrage gesendet. Bitte überprüfe dein E-Mail-Postfach, um die Änderung zu bestätigen.",
      });
    } catch (error: any) {
      console.error("Error updating email:", error);
      setEmailUpdateSuccess(false);
      setEmailUpdateMessage(error.message || 'Fehler beim Aktualisieren der E-Mail');
      toast({
        title: "Fehler",
        description: error.message || "Es gab ein Problem beim Aktualisieren deiner E-Mail.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const requestPasswordReset = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        user?.email || '',
        {
          redirectTo: window.location.origin + '/reset-password',
        }
      );
      
      if (error) throw error;
      
      toast({
        title: "Passwort-Reset",
        description: "Eine E-Mail zum Zurücksetzen deines Passworts wurde versendet. Bitte überprüfe dein E-Mail-Postfach.",
      });
    } catch (error: any) {
      console.error("Error requesting password reset:", error);
      toast({
        title: "Fehler",
        description: error.message || "Es gab ein Problem beim Senden des Passwort-Reset-Links.",
        variant: "destructive"
      });
    }
  };

  const formatMeetingDay = (day: string) => {
    const days: Record<string, string> = {
      'monday': 'Montag',
      'tuesday': 'Dienstag',
      'wednesday': 'Mittwoch',
      'thursday': 'Donnerstag',
      'friday': 'Freitag',
      'saturday': 'Samstag',
      'sunday': 'Sonntag'
    };
    return days[day] || day;
  };

  const isAdminOrModerator = () => {
    return isAdmin || isModerator;
  };
  
  const handleAddUserRole = async () => {
    if (!roleUserEmail || !roleType) {
      toast({
        title: "Fehler",
        description: "Bitte fülle alle Felder aus.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Rolle vergeben",
      description: `${roleType === 'admin' ? 'Admin' : 'Moderator'}-Rolle an ${roleUserEmail} vergeben.`,
    });
    
    setShowUserRoleDialog(false);
    setRoleUserEmail('');
    setRoleType('moderator');
  };

  const showAdminTab = isAdminOrModerator();

  const tabs = [
    { id: 'profile', label: 'Profil' },
    { id: 'announcements', label: 'Ankündigungen' },
    ...(showAdminTab ? [{ id: 'admin', label: 'Admin' }] : []),
  ];

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!session) {
    navigate('/login');
    return null;
  }

  const lastChanged = user?.user_metadata?.username_changed_at
  ? new Date(user.user_metadata.username_changed_at)
  : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-10 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center border-b pb-4">
              <div className="flex justify-center mb-4">
                <Avatar className="h-20 w-20">
                  {userAvatar ? (
                    <AvatarImage src={userAvatar} />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                      {username ? username.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <CardTitle className="text-2xl font-bold">
                {greeting}, {username || 'Benutzer'}!
              </CardTitle>
              <CardDescription>
                {user?.email || 'Keine E-Mail-Adresse'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs 
                defaultValue={activeTab} 
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="w-full rounded-none border-b">
                  {tabs.map(tab => (
                    <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
                  ))}
                </TabsList>
                
                <TabsContent value="profile" className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {isAdminOrModerator() && (
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-medium text-blue-800">Teammeetings</CardTitle>
                            <Calendar className="h-5 w-5 text-blue-500" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <React.Suspense fallback={<div>Lade...</div>}>
                            <MeetingCountdown />
                          </React.Suspense>
                        </CardContent>
                      </Card>
                    )}

                    {!isAdminOrModerator() && (
                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-medium text-purple-800">Deine Bewerbungen</CardTitle>
                            <Bell className="h-5 w-5 text-purple-500" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          {isApplicationsLoading ? (
                            <div className="text-sm text-gray-600">Lade Bewerbungen...</div>
                          ) : applications.length > 0 ? (
                            <div className="space-y-2">
                              <div className="text-sm mb-2">
                                <span className="font-medium">Anzahl: </span> 
                                {applications.length}
                              </div>
                              {applications.slice(0, 3).map((app) => (
                                <div key={app.id} className="text-sm p-2 bg-white rounded-md border border-purple-200 shadow-sm">
                                  <p className="font-medium">Status: {app.status}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(app.created_at).toLocaleDateString('de-DE')}
                                  </p>
                                </div>
                              ))}
                              {applications.length > 3 && (
                                <Button 
                                  variant="link" 
                                  className="text-purple-600 p-0 h-auto text-sm"
                                  onClick={() => handleTabChange('applications')}
                                >
                                  Alle {applications.length} Bewerbungen anzeigen
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600">
                              Du hast noch keine Bewerbungen eingereicht.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    <Card className={`bg-gradient-to-br from-green-50 to-green-100 border-green-200 ${isAdminOrModerator() ? "md:col-span-2" : ""}`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg font-medium text-green-800">Account Status</CardTitle>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">E-Mail verifiziert</span>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              ✓ Verifiziert
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Profilvollständigkeit</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${discordId && robloxId ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {discordId && robloxId ? '100%' : '80%'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Mitglied seit</span>
                            <span className="text-sm">
                              {user?.created_at ? new Date(user.created_at).toLocaleDateString('de-DE') : 'Unbekannt'}
                            </span>
                          </div>
                          {isAdmin && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Rolle</span>
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                Administrator
                              </span>
                            </div>
                          )}
                          {isModerator && !isAdmin && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Rolle</span>
                              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                                Moderator
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Neuigkeiten & Ankündigungen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div id="profile-news-feed" className="space-y-4">
                        <div className="text-center py-4">
                          <LoaderIcon className="h-8 w-8 mx-auto animate-spin text-gray-300 mb-2" />
                          <p className="text-sm text-gray-500">Neuigkeiten werden geladen...</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="announcements" className="pt-6">
                  <AnnouncementsList selectedId={announcementId} />
                </TabsContent>
                
                <TabsContent value="account" className="p-6 space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    <ProfileImageUpload
                      userId={session?.user?.id || ''}
                      existingImageUrl={userAvatar}
                      onImageUploaded={handleAvatarChange}
                    />
                    <p className="text-sm text-gray-500">Profilbild ändern</p>
                  </div>
                  <Separator />
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Benutzername</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="name"
                          placeholder="Benutzername"
                          value={username}
                          onChange={(e) => {
                            setUsername(e.target.value);
                            checkUsernameAvailability(e.target.value);
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          disabled={isUpdatingUsername || !isUsernameAvailable.valid}
                          onClick={updateUsername}
                        >
                          {isUpdatingUsername ? (
                            <>
                              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                              Aktualisieren...
                            </>
                          ) : (
                            "Aktualisieren"
                          )}
                        </Button>
                      </div>
                      {!isUsernameAvailable.valid && (
                        <p className="text-sm text-red-500">{isUsernameAvailable.reason}</p>
                      )}
                      {lastChanged && (
                        <p className="text-sm text-gray-500">
                          Zuletzt geändert: {lastChanged.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <UserDataChangeRequest 
                      currentDiscordId={discordId} 
                      currentRobloxId={robloxId} 
                      userId={session?.user?.id || ''}
                    />
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="current-discord-id">Aktuelle Discord ID</Label>
                        {profileLocks.discord_locked && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Lock className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Diese ID kann nur über einen Änderungsantrag ge��ndert werden.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <Input
                        id="current-discord-id"
                        value={discordId || "Nicht gesetzt"}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="current-roblox-id">Aktuelle Roblox ID</Label>
                        {profileLocks.roblox_locked && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Lock className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Diese ID kann nur über einen Änderungsantrag geändert werden.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <Input
                        id="current-roblox-id"
                        value={robloxId || "Nicht gesetzt"}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUpdatingProfiles || (profileLocks.discord_locked && profileLocks.roblox_locked)}
                      onClick={updateProfileData}
                      className="mt-2"
                    >
                      {isUpdatingProfiles ? (
                        <>
                          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                          Speichern...
                        </>
                      ) : (
                        "Profildaten speichern"
                      )}
                    </Button>
                    {(profileLocks.discord_locked && profileLocks.roblox_locked) && (
                      <p className="text-xs text-gray-500 text-center">Alle IDs wurden bereits gesetzt und können nicht mehr geändert werden.</p>
                    )}
                  </div>
                </TabsContent>
                
                {showApplicationsTab && (
                  <TabsContent value="applications" className="p-6 space-y-4">
                    <CardTitle>Deine Bewerbungen</CardTitle>
                    <CardDescription>Hier findest du eine Übersicht deiner bisherigen Bewerbungen.</CardDescription>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Aktuelle Bewerbungen</h3>
                        <p className="text-sm text-gray-500">
                          Anzahl Bewerbungen: {applications.length}
                        </p>
                      </div>
                    </div>
                    
                    {isApplicationsLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <LoaderIcon className="mr-2 h-6 w-6 animate-spin text-blue-500" />
                        <span>Lade Bewerbungen...</span>
                      </div>
                    ) : applicationsError ? (
                      <div className="p-8 text-center">
                        <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                        <p className="text-red-500">Fehler beim Laden der Bewerbungen.</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => refetchApplications()}
                        >
                          Erneut versuchen
                        </Button>
                      </div>
                    ) : applications.length === 0 ? (
                      <div className="p-8 text-center bg-gray-50 rounded-md">
                        <p>Du hast noch keine Bewerbungen eingereicht.</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => navigate('/apply')}
                        >
                          Neue Bewerbung starten
                        </Button>
                      </div>
                    ) : (
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Datum</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Letzte Aktualisierung</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {applications.map((app) => (
                              <TableRow key={app.id}>
                                <TableCell>{new Date(app.created_at).toLocaleDateString('de-DE')}</TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    app.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                    app.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {app.status}
                                  </span>
                                </TableCell>
                                <TableCell>{new Date(app.updated_at).toLocaleDateString('de-DE')}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>
                )}
                
                <TabsContent value="security" className="p-6 space-y-4">
                  <CardTitle>Sicherheitseinstellungen</CardTitle>
                  <CardDescription>Ändere dein Passwort oder deine E-Mail-Adresse.</CardDescription>
                  
                  <Card className="border border-blue-100">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="text-lg">E-Mail-Adresse ändern</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <p className="text-sm">
                        Deine aktuelle E-Mail-Adresse: <strong>{user?.email}</strong>
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="email">Neue E-Mail-Adresse</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="email"
                            placeholder="Neue E-Mail-Adresse"
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                          />
                          <Button
                            type="button"
                            disabled={isUpdatingEmail || !newEmail}
                            onClick={updateEmail}
                          >
                            {isUpdatingEmail ? (
                              <>
                                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                Aktualisieren...
                              </>
                            ) : (
                              "Aktualisieren"
                            )}
                          </Button>
                        </div>
                        {emailUpdateMessage && (
                          <div className={`flex items-center space-x-2 p-2 rounded ${emailUpdateSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {emailUpdateSuccess ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <AlertTriangle className="h-4 w-4" />
                            )}
                            <p className="text-sm">{emailUpdateMessage}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-blue-100">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="text-lg">Passwort ändern</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <p className="text-sm">
                        Du kannst dein Passwort ändern, indem du einen Reset-Link an deine E-Mail-Adresse sendest.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={requestPasswordReset}
                      >
                        Passwort-Reset-Link senden
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <AccountDeletionRequest />
                  
                  <Card className="border border-amber-100">
                    <CardHeader className="bg-amber-50">
                      <CardTitle className="text-lg">Sicherheitshinweise</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-4">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <p className="text-sm">Verwende ein starkes, einzigartiges Passwort für deinen Account.</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <p className="text-sm">Teile deine Anmeldedaten niemals mit anderen Personen.</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <p className="text-sm">Überprüfe regelmäßig deine Account-Aktivitäten auf verdächtige Vorgänge.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {(isAdmin || isModerator) && (
                  <TabsContent value="admin" className="h-auto overflow-hidden rounded-md border">
                    <div className="p-4 bg-blue-50 flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Admin-Funktionen</h3>
                      <Dialog open={showUserRoleDialog} onOpenChange={setShowUserRoleDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <Plus className="h-4 w-4" />
                            Neue Benutzerrolle
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Benutzerrolle vergeben</DialogTitle>
                            <DialogDescription>
                              Gib die E-Mail-Adresse des Benutzers ein, dem du eine Rolle zuweisen möchtest.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="user-email">E-Mail des Benutzers</Label>
                              <Input 
                                id="user-email" 
                                placeholder="beispiel@email.com" 
                                value={roleUserEmail}
                                onChange={(e) => setRoleUserEmail(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Rolle</Label>
                              <div className="flex space-x-2">
                                <Button 
                                  type="button"
                                  variant={roleType === 'moderator' ? 'default' : 'outline'}
                                  className="flex-1"
                                  onClick={() => setRoleType('moderator')}
                                >
                                  Moderator
                                </Button>
                                <Button 
                                  type="button"
                                  variant={roleType === 'admin' ? 'default' : 'outline'}
                                  className="flex-1"
                                  onClick={() => setRoleType('admin')}
                                >
                                  Administrator
                                </Button>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleAddUserRole}>Rolle zuweisen</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <AdminPanel />
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer hideApplyButton={isAdminOrModerator()} />
    </div>
  );
};

export default Profile;
