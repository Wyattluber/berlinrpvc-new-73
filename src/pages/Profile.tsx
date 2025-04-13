
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import UserDataChangeRequest from '@/components/profile/UserDataChangeRequest';
import AccountDeletionRequest from '@/components/profile/AccountDeletionRequest';
import PartnershipStatus from '@/components/profile/PartnershipStatus';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  User, LogOut, Settings, Shield, ClipboardList, 
  FileText, Clock, AlertTriangle, Loader2, HandshakeIcon 
} from 'lucide-react';

const Profile = () => {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [username, setUsername] = useState('');
  const [discordId, setDiscordId] = useState('');
  const [robloxId, setRobloxId] = useState('');
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;
        
        setProfile(profileData);
        setUsername(profileData?.username || '');
        setDiscordId(profileData?.discord_id || '');
        setRobloxId(profileData?.roblox_id || '');
        setAvatarUrl(profileData?.avatar_url || '');

        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (!adminError && adminData) {
          setIsAdmin(adminData.role === 'admin');
          setIsModerator(adminData.role === 'moderator' || adminData.role === 'admin');
        }

        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (!applicationsError) {
          setApplications(applicationsData || []);
        }

      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast({
          title: 'Fehler',
          description: 'Deine Profildaten konnten nicht geladen werden.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [session, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: 'Abgemeldet',
        description: 'Du wurdest erfolgreich abgemeldet.',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Fehler',
        description: 'Abmeldung fehlgeschlagen.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-gray-600">Lade Profildaten...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex-shrink-0">
              <ProfileImageUpload 
                userId={session.user.id} 
                existingImageUrl={avatarUrl} 
                onImageUploaded={(url) => setAvatarUrl(url)} 
                size={100} 
              />
            </div>
            
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-2xl font-bold">{username || 'Benutzer'}</h1>
              <p className="text-gray-500">{session.user.email}</p>
              
              <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                {isAdmin && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    Administrator
                  </span>
                )}
                {isModerator && !isAdmin && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Moderator
                  </span>
                )}
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  Mitglied seit {new Date(profile?.created_at || Date.now()).toLocaleDateString('de-DE')}
                </span>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowConfirmLogout(true)}
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </Button>
              
              {showConfirmLogout && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    <h3 className="text-lg font-bold mb-4">Abmelden bestätigen</h3>
                    <p className="mb-6">Bist du sicher, dass du dich abmelden möchtest?</p>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowConfirmLogout(false)}>
                        Abbrechen
                      </Button>
                      <Button variant="destructive" onClick={handleLogout}>
                        Abmelden
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <TabsList className="flex flex-col h-full items-stretch bg-transparent space-y-1">
                    <TabsTrigger 
                      value="profile" 
                      className="justify-start"
                      onClick={() => setActiveTab('profile')}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profil
                    </TabsTrigger>
                    {isAdmin && (
                      <TabsTrigger 
                        value="admin" 
                        className="justify-start"
                        onClick={() => setActiveTab('admin')}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </TabsTrigger>
                    )}
                    {(isAdmin || isModerator) && (
                      <TabsTrigger 
                        value="moderator" 
                        className="justify-start"
                        onClick={() => setActiveTab('moderator')}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Moderator
                      </TabsTrigger>
                    )}
                    <TabsTrigger 
                      value="applications" 
                      className="justify-start"
                      onClick={() => setActiveTab('applications')}
                    >
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Bewerbungen
                    </TabsTrigger>
                    <TabsTrigger 
                      value="partnership" 
                      className="justify-start"
                      onClick={() => setActiveTab('partnership')}
                    >
                      <HandshakeIcon className="h-4 w-4 mr-2" />
                      Partnerschaft
                    </TabsTrigger>
                  </TabsList>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profil Informationen</CardTitle>
                      <CardDescription>
                        Deine persönlichen Informationen und Einstellungen
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">E-Mail</Label>
                            <Input 
                              id="email" 
                              value={session.user.email} 
                              disabled 
                              className="bg-gray-50"
                            />
                            <p className="text-xs text-gray-500">Deine E-Mail-Adresse kann nicht geändert werden</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="username">Benutzername</Label>
                            <Input 
                              id="username" 
                              value={username} 
                              disabled 
                              className="bg-gray-50"
                            />
                            <UserDataChangeRequest 
                              userId={session.user.id}
                              currentValue={username}
                              fieldName="username"
                              buttonText="Benutzernamen ändern"
                            />
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="discord_id">Discord ID</Label>
                            <Input 
                              id="discord_id" 
                              value={discordId || 'Nicht angegeben'} 
                              disabled 
                              className="bg-gray-50"
                            />
                            <UserDataChangeRequest 
                              userId={session.user.id}
                              currentValue={discordId}
                              fieldName="discord_id"
                              buttonText="Discord ID ändern"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="roblox_id">Roblox ID</Label>
                            <Input 
                              id="roblox_id" 
                              value={robloxId || 'Nicht angegeben'} 
                              disabled 
                              className="bg-gray-50"
                            />
                            <UserDataChangeRequest 
                              userId={session.user.id}
                              currentValue={robloxId}
                              fieldName="roblox_id"
                              buttonText="Roblox ID ändern"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-red-600">Gefahrenzone</CardTitle>
                      <CardDescription>
                        Aktionen, die nicht rückgängig gemacht werden können
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AccountDeletionRequest />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="admin">
                  {isAdmin && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Admin Dashboard</CardTitle>
                        <CardDescription>
                          Zugriff auf Verwaltungsfunktionen
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button onClick={() => navigate('/admin/dashboard')}>
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Dashboard öffnen
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="moderator">
                  {(isAdmin || isModerator) && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Moderator Funktionen</CardTitle>
                        <CardDescription>
                          Zugriff auf Moderationsfunktionen
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Button onClick={() => navigate('/admin/applications')}>
                            <ClipboardList className="h-4 w-4 mr-2" />
                            Bewerbungen verwalten
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="applications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Deine Bewerbungen</CardTitle>
                      <CardDescription>
                        Übersicht und Status deiner Bewerbungen
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {applications.length === 0 ? (
                        <div className="text-center py-6">
                          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                          <h3 className="text-lg font-medium text-gray-900">Keine Bewerbungen</h3>
                          <p className="text-gray-500 mt-1">Du hast noch keine Bewerbungen eingereicht.</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => navigate('/apply')}
                          >
                            Jetzt bewerben
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {applications.map((application) => (
                            <div 
                              key={application.id} 
                              className="border rounded-lg p-4 bg-white"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">Teammitglied-Bewerbung</h3>
                                  <p className="text-sm text-gray-500">
                                    Eingereicht am {new Date(application.created_at).toLocaleDateString('de-DE')}
                                  </p>
                                </div>
                                <div>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    application.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {application.status === 'approved' ? 'Angenommen' :
                                     application.status === 'rejected' ? 'Abgelehnt' :
                                     'In Bearbeitung'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                                <div className="text-gray-500">Discord ID:</div>
                                <div>{application.discord_id}</div>
                                <div className="text-gray-500">Roblox Username:</div>
                                <div>{application.roblox_username}</div>
                                <div className="text-gray-500">Alter:</div>
                                <div>{application.age} Jahre</div>
                              </div>
                              
                              {application.status === 'rejected' && (
                                <div className="mt-4 p-3 bg-red-50 rounded-md flex items-start">
                                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm text-red-800 font-medium">Bewerbung abgelehnt</p>
                                    <p className="text-sm text-red-700 mt-1">
                                      Deine Bewerbung wurde leider abgelehnt. Du kannst dich nach einer Wartezeit erneut bewerben.
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {application.status === 'pending' && (
                                <div className="mt-4 p-3 bg-yellow-50 rounded-md flex items-start">
                                  <Clock className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm text-yellow-800 font-medium">Bewerbung in Bearbeitung</p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                      Deine Bewerbung wird derzeit geprüft. Wir werden dich benachrichtigen, sobald eine Entscheidung getroffen wurde.
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate('/apply')}
                      >
                        Neue Bewerbung
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="partnership">
                  <PartnershipStatus />
                  
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Partnerschaft beantragen</CardTitle>
                      <CardDescription>
                        Beantrage eine Partnerschaft für deinen Server oder deine Community
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => navigate('/apply?tab=partnership')}>
                        <HandshakeIcon className="h-4 w-4 mr-2" />
                        Partnerschaft beantragen
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
