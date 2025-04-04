
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SessionContext } from '../App';
import { LoaderIcon, CheckCircle, Calendar, Clock, Users, MessageSquare, Bell, HelpCircle, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getUserApplicationsHistory, checkIsAdmin } from '@/lib/admin';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import AdminPanel from './AdminPanel';
import { getTeamSettings } from '@/lib/adminService';

// Define a type for the application history items
type Application = {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
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
  const [isUsernameAvailable, setIsUsernameAvailable] = useState({ valid: true, reason: '' });
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingProfiles, setIsUpdatingProfiles] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailUpdateMessage, setEmailUpdateMessage] = useState('');
  const [emailUpdateSuccess, setEmailUpdateSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [teamSettings, setTeamSettings] = useState<any>(null);
  const navigate = useNavigate();
  const session = useContext(SessionContext);
  const activeTab = searchParams.get('tab') || 'dashboard';

  // Fetch user applications history
  const { 
    isLoading: isApplicationsLoading, 
    error: applicationsError, 
    refetch: refetchApplications 
  } = useQuery({
    queryKey: ['userApplications', session?.user?.id], 
    queryFn: () => getUserApplicationsHistory(session?.user?.id || ''),
    enabled: !!session?.user?.id, // Only run when the user is logged in
    meta: {
      onSuccess: (data) => {
        if (data) {
          setApplications(data as Application[]);
        }
      },
      onError: (error: any) => {
        console.error('Error fetching applications:', error);
        toast({
          title: "Fehler",
          description: "Es gab ein Problem beim Abrufen deiner Bewerbungen.",
          variant: "destructive"
        });
      }
    }
  });

  // Fetch team settings
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
        
        // Fetch user profile data
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
        
        // Check if user is admin
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
        
        // Load applications history
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

  // Function to handle tab changes
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // Function to handle avatar changes
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

  // Function to check username availability
  const checkUsernameAvailability = async (name: string) => {
    if (!name || name.length < 3) {
      setIsUsernameAvailable({ valid: false, reason: 'Benutzername muss mindestens 3 Zeichen lang sein.' });
      return;
    }
    
    // Optimistically set to valid if the username hasn't changed
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

  // Function to update username
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
      
      // Optimistically update the user state
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

  // Function to update Discord and Roblox IDs
  const updateProfileData = async () => {
    setIsUpdatingProfiles(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          discord_id: discordId,
          roblox_id: robloxId,
          updated_at: new Date().toISOString()
        })
        .eq('id', session?.user?.id);
      
      if (error) throw error;
      
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

  // Function to update email
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
  
  // Function to request password reset
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

  // Format meeting day in German
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
              <CardTitle className="text-2xl font-bold">{username || 'Benutzer'}</CardTitle>
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
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="account">Konto</TabsTrigger>
                  <TabsTrigger value="applications">Bewerbungen</TabsTrigger>
                  <TabsTrigger value="security">Sicherheit</TabsTrigger>
                  {(isAdmin || session?.user?.email === 'admin@berlinrpvc.de') && (
                    <TabsTrigger value="admin">Admin Dashboard</TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="dashboard" className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg font-medium text-blue-800">Teammeetings</CardTitle>
                          <Calendar className="h-5 w-5 text-blue-500" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        {teamSettings ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                              <span>{formatMeetingDay(teamSettings.meeting_day) || 'Samstag'}</span>
                            </p>
                            <p className="text-sm font-medium flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-blue-500" />
                              <span>{teamSettings.meeting_time || '19:00'} Uhr</span>
                            </p>
                            <p className="text-sm font-medium flex items-center">
                              <Users className="h-4 w-4 mr-2 text-blue-500" />
                              <span>{teamSettings.meeting_frequency || 'Wöchentlich'}</span>
                            </p>
                            <p className="text-sm font-medium flex items-center">
                              <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                              <span>{teamSettings.meeting_location || 'Discord'}</span>
                            </p>
                            {teamSettings.meeting_notes && (
                              <p className="text-sm text-gray-600 mt-2">
                                {teamSettings.meeting_notes}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">
                            Teammeetings werden geladen...
                          </div>
                        )}
                      </CardContent>
                    </Card>

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

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
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
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Neuigkeiten & Ankündigungen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { title: "Neues Feature: Discord Integration", date: "Vor 2 Tagen", content: "Ab sofort kannst du deinen Discord-Account mit deinem Profil verknüpfen." },
                          { title: "Serverupdate", date: "Vor 5 Tagen", content: "Wir haben unseren Server aktualisiert. Falls du Probleme bemerkst, melde dich bitte bei einem Admin." },
                          { title: "Neue Teammitglieder", date: "Vor 1 Woche", content: "Wir begrüßen 3 neue Teammitglieder in unserem Server-Team!" }
                        ].map((news, i) => (
                          <div key={i} className="p-3 bg-gray-50 rounded-md">
                            <div className="flex justify-between items-center mb-1">
                              <h3 className="font-medium">{news.title}</h3>
                              <span className="text-xs text-gray-500">{news.date}</span>
                            </div>
                            <p className="text-sm text-gray-600">{news.content}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="discord_id">Discord ID</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="discord_id"
                          placeholder="Deine Discord ID"
                          value={discordId}
                          onChange={(e) => setDiscordId(e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Deine Discord ID findest du in Discord unter Einstellungen &gt; Mein Account &gt; Discord-Tag
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="roblox_id">Roblox ID</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="roblox_id"
                          placeholder="Deine Roblox ID"
                          value={robloxId}
                          onChange={(e) => setRobloxId(e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Deine Roblox ID findest du in deinem Roblox-Profil
                      </p>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUpdatingProfiles}
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
                  </div>
                </TabsContent>
                
                <TabsContent value="applications" className="p-6 space-y-4">
                  <CardTitle>Deine Bewerbungen</CardTitle>
                  <CardDescription>Hier findest du eine Übersicht deiner bisherigen Bewerbungen.</CardDescription>
                  {isApplicationsLoading ? (
                    <div className="flex items-center justify-center">
                      <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                      Lade Bewerbungen...
                    </div>
                  ) : applicationsError ? (
                    <p className="text-red-500">Fehler beim Laden der Bewerbungen.</p>
                  ) : applications.length === 0 ? (
                    <p>Du hast noch keine Bewerbungen eingereicht.</p>
                  ) : (
                    <Accordion type="single" collapsible>
                      {applications.map((app) => (
                        <AccordionItem key={app.id} value={app.id}>
                          <AccordionTrigger>
                            {new Date(app.created_at).toLocaleDateString()} - {app.status}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p>
                              Bewerbungsstatus: {app.status}
                              <br />
                              Erstellt am: {new Date(app.created_at).toLocaleString()}
                              <br />
                              Zuletzt aktualisiert: {new Date(app.updated_at).toLocaleString()}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </TabsContent>
                
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
                
                {(isAdmin || session?.user?.email === 'admin@berlinrpvc.de') && (
                  <TabsContent value="admin" className="h-[70vh] overflow-hidden rounded-md border">
                    <AdminPanel />
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
