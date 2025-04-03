
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Settings, User, Shield, Calendar, BarChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  discordId?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [discordId, setDiscordId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(storedUser) as UserProfile;
    setUser(userData);
    setDiscordId(userData.discordId || '');
  }, [navigate]);

  const handleSaveProfile = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (user) {
        const updatedUser = {
          ...user,
          discordId
        };
        
        // Update local storage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        toast({
          title: "Profil gespeichert",
          description: "Deine Discord ID wurde erfolgreich gespeichert.",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    // Clear user data from local storage
    localStorage.removeItem('user');
    toast({
      title: "Abgemeldet",
      description: "Du wurdest erfolgreich abgemeldet.",
    });
    navigate('/');
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
                    <div className="bg-blue-600 text-white p-2 rounded-full">
                      <User size={24} />
                    </div>
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
                    {user.role === 'admin' && (
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
                            {discordId ? (
                              <div className="text-sm bg-blue-50 p-3 rounded-md border border-blue-100 text-blue-700">
                                Du kannst jetzt eine Bewerbung einreichen.
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
                      <Input id="role" value={user.role === 'admin' ? 'Administrator' : 'Benutzer'} disabled />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Passwort ändern</Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type="password"
                          placeholder="Neues Passwort" 
                          disabled
                          className="blur-sm"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 rounded-md">
                          <span className="text-sm font-medium text-gray-500">Coming Soon</span>
                        </div>
                      </div>
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
