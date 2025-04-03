
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Settings, User, Shield, Calendar, BarChart, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  discordId?: string;
  avatar_url?: string;
}

interface Application {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [discordId, setDiscordId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      // Check Supabase authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      const { user } = session;
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Extract user data
      const userProfile: UserProfile = {
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
        email: user.email || '',
        role: 'user',
        discordId: user.user_metadata?.provider_id || '',
        avatar_url: user.user_metadata?.avatar_url || '',
      };

      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!adminError && adminData) {
        userProfile.role = 'admin';
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      setUser(userProfile);
      setDiscordId(userProfile.discordId || '');
      
      // Fetch user applications
      fetchApplications(user.id);
    };

    checkUser();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate('/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchApplications = async (userId: string) => {
    setIsLoadingApplications(true);
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
    } finally {
      setIsLoadingApplications(false);
    }
  };

  const handleSaveProfile = () => {
    setIsLoading(true);
    
    // Update user metadata
    const updateProfile = async () => {
      try {
        const { error } = await supabase.auth.updateUser({
          data: { 
            discord_id: discordId 
          }
        });

        if (error) throw error;

        if (user) {
          setUser({
            ...user,
            discordId
          });
        }
        
        toast({
          title: "Profil gespeichert",
          description: "Deine Discord ID wurde erfolgreich gespeichert.",
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

    updateProfile();
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Abgemeldet",
        description: "Du wurdest erfolgreich abgemeldet.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Fehler",
        description: "Es gab ein Problem bei der Abmeldung.",
        variant: "destructive"
      });
    }
  };

  // Function to display the proper role name
  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'moderator':
        return 'Moderator';
      default:
        return 'Benutzer';
    }
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

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left sidebar */}
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
                      <CardDescription className="text-xs truncate">{user.email}</CardDescription>
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
                    {isAdmin && (
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => navigate('/admin')}
                      >
                        <Shield size={16} className="mr-2" />
                        Admin-Bereich
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

            {/* Main content */}
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
                                        'Deine Bewerbung wurde leider abgelehnt.'}
                                    </p>
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
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Team-Meetings</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm text-gray-500">
                              <Calendar size={32} className="mb-3 text-blue-600" />
                              <p>Keine anstehenden Meetings</p>
                              <span className="text-xs">Meetings werden hier angezeigt, sobald du im Team bist.</span>
                            </div>
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
                              <span className="text-sm font-medium">Discord ID:</span>
                              <span className="text-sm">{discordId ? "✓ Eingegeben" : "✗ Fehlt"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Rolle:</span>
                              <span className="text-sm font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                {getRoleName(user.role)}
                              </span>
                            </div>
                            {!discordId && (
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
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={user.name} disabled />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail</Label>
                      <Input id="email" type="email" value={user.email} disabled />
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
                      />
                      <p className="text-xs text-gray-500">
                        Bitte gib deine vollständige Discord ID ein, damit wir dich kontaktieren können.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Rolle</Label>
                      <Input id="role" value={getRoleName(user.role)} disabled />
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
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
