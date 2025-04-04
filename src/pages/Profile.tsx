import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Settings, User, Calendar, BarChart, AlertCircle, CheckCircle, Clock, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SessionContext } from '@/App';

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
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const session = useContext(SessionContext);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    hasLetter: false,
    hasNumber: false
  });

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
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.username || 'User',
        email: user.email || '',
        role: 'user',
        discordId: user.user_metadata?.discord_id || '',
        avatar_url: user.user_metadata?.avatar_url || '',
      };

      setUser(userProfile);
      setDiscordId(userProfile.discordId || '');
      
      fetchApplications(user.id);
    };

    checkUser();
  }, [navigate, session]);

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

  const getRoleName = (role: string) => {
    switch (role) {
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
                    <Button 
                      variant={activeTab === 'security' ? 'default' : 'ghost'} 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('security')}
                    >
                      <KeyRound size={16} className="mr-2" />
                      Sicherheit
                    </Button>
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
                              {getRoleName(user.role)}
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

              {activeTab === 'security' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sicherheitseinstellungen</CardTitle>
                    <CardDescription>Passwort ändern</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {passwordError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Fehler</AlertTitle>
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {passwordChangeSuccess && (
                      <Alert className="mb-4 bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Passwort geändert</AlertTitle>
                        <AlertDescription className="text-green-700">
                          Dein Passwort wurde erfolgreich aktualisiert.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Aktuelles Passwort</Label>
                      <div className="relative">
                        <Input 
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"} 
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-0 top-0 h-10 w-10 text-gray-400 hover:text-gray-500"
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
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-0 top-0 h-10 w-10 text-gray-400 hover:text-gray-500"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                      
                      <div className="text-xs space-y-1 mt-2">
                        <p className="font-semibold text-gray-600">Passwort muss:</p>
                        <div className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-full ${passwordValidation.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={passwordValidation.length ? 'text-green-600' : 'text-gray-500'}>
                            Mindestens 8 Zeichen lang sein
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-full ${passwordValidation.hasLetter ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={passwordValidation.hasLetter ? 'text-green-600' : 'text-gray-500'}>
                            Mindestens einen Buchstaben enthalten
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-full ${passwordValidation.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                            Mindestens eine Ziffer enthalten
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-new-password">Neues Passwort bestätigen</Label>
                      <div className="relative">
                        <Input 
                          id="confirm-new-password"
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-0 top-0 h-10 w-10 text-gray-400 hover:text-gray-500"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                      
                      {confirmPassword && (
                        <div className="flex items-center gap-1 mt-1 text-xs">
                          <div className={`w-2 h-2 rounded-full ${confirmPassword === newPassword ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={confirmPassword === newPassword ? 'text-green-600' : 'text-red-500'}>
                            {confirmPassword === newPassword ? 'Passwörter stimmen überein' : 'Passwörter stimmen nicht überein'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-indigo-700 w-full"
                      onClick={handleChangePassword}
                      disabled={isLoading}
                    >
                      {isLoading ? "Passwort wird geändert..." : "Passwort ändern"}
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
