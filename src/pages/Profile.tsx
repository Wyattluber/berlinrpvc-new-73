
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

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
      
      <main className="flex-grow py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <Card className="w-full max-w-2xl mx-auto shadow-lg border-t-4 border-t-blue-600">
            <CardHeader className="space-y-1">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold">Dein Profil</CardTitle>
                {user.role === 'admin' && (
                  <Button variant="outline" onClick={() => navigate('/admin')}>
                    Admin-Bereich
                  </Button>
                )}
              </div>
              <CardDescription>
                Vervollständige dein Profil, um Zugang zu allen Funktionen zu erhalten
              </CardDescription>
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
                  placeholder="z.B.: username#1234" 
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
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto" 
                onClick={handleLogout}
              >
                Abmelden
              </Button>
              <Button
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700"
                onClick={handleSaveProfile}
                disabled={isLoading}
              >
                {isLoading ? "Speichern..." : "Profil speichern"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
