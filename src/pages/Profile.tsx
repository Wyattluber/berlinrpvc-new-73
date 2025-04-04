import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SessionContext } from '../App';
import { ReloadIcon, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getUserApplicationsHistory } from '@/lib/admin';
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

// Define a type for the application history items
type Application = {
  id: string;
  status: string;
  created_at: any;
  updated_at: any;
};

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [username, setUsername] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState({ valid: true, reason: '' });
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailUpdateMessage, setEmailUpdateMessage] = useState('');
  const [emailUpdateSuccess, setEmailUpdateSuccess] = useState(false);
  const navigate = useNavigate();
  const session = useContext(SessionContext);

  // Fetch user applications history
  const { 
    isLoading: isApplicationsLoading, 
    error: applicationsError, 
    refetch: refetchApplications 
  } = useQuery(
    ['userApplications', session?.user?.id], 
    () => getUserApplicationsHistory(session?.user?.id || ''),
    {
      enabled: !!session?.user?.id, // Only run when the user is logged in
      onSuccess: (data) => {
        setApplications(data || []);
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
  );

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

  // Function to update email
  const updateEmail = async () => {
    setIsUpdatingEmail(true);
    setEmailUpdateMessage('');
    setEmailUpdateSuccess(false);
    
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });
      
      if (error) throw error;
      
      setEmailUpdateSuccess(true);
      setEmailUpdateMessage('E-Mail Aktualisierungsanfrage gesendet. Bitte überprüfe dein E-Mail-Postfach.');
      toast({
        title: "E-Mail Aktualisierung",
        description: "E-Mail Aktualisierungsanfrage gesendet. Bitte überprüfe dein E-Mail-Postfach.",
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
  : new Date();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-10 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Dein Profil</CardTitle>
              <CardDescription>
                Verwalte dein Konto und deine Einstellungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="account" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="account">Konto</TabsTrigger>
                  <TabsTrigger value="applications">Bewerbungen</TabsTrigger>
                  <TabsTrigger value="security">Sicherheit</TabsTrigger>
                  {session?.user?.email === 'admin@berlinrpvc.de' && (
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                  )}
                </TabsList>
                <TabsContent value="account" className="space-y-4">
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
                              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
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
                      {user?.user_metadata?.name && (
                        <p className="text-sm text-gray-500">
                          Zuletzt geändert: {lastChanged.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="applications" className="space-y-4">
                  <CardTitle>Deine Bewerbungen</CardTitle>
                  <CardDescription>Hier findest du eine Übersicht deiner bisherigen Bewerbungen.</CardDescription>
                  {isApplicationsLoading ? (
                    <div className="flex items-center justify-center">
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
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
                <TabsContent value="security" className="space-y-4">
                  <CardTitle>Sicherheitseinstellungen</CardTitle>
                  <CardDescription>Ändere dein Passwort oder deine E-Mail-Adresse.</CardDescription>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail-Adresse</Label>
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
                          size="sm"
                          disabled={isUpdatingEmail}
                          onClick={updateEmail}
                        >
                          {isUpdatingEmail ? (
                            <>
                              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                              Aktualisieren...
                            </>
                          ) : (
                            "Aktualisieren"
                          )}
                        </Button>
                      </div>
                      {emailUpdateMessage && (
                        <p className={`text-sm ${emailUpdateSuccess ? 'text-green-500' : 'text-red-500'}`}>
                          {emailUpdateMessage}
                        </p>
                      )}
                    </div>
                    <Link to="/login">
                      <Button variant="outline">Passwort ändern</Button>
                    </Link>
                  </div>
                </TabsContent>
                {session?.user?.email === 'admin@berlinrpvc.de' && (
                  <TabsContent value="admin" className="space-y-4">
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
