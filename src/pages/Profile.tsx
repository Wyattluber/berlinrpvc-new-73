
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SessionContext } from '@/App';
import { checkIsAdmin, checkIsModerator } from '@/lib/admin';
import { getUserProfile } from '@/lib/admin/users';
import ProfileTabs from '@/components/profile/ProfileTabs';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AdminPanel from './AdminPanel';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import TeamAbsencesTab from '@/components/profile/TeamAbsencesTab';
import MeetingCountdown from '@/components/MeetingCountdown';
import { Badge } from '@/components/ui/badge';
import { LoaderIcon, LogOut, Shield, ShieldAlert, ShieldCheck, User } from 'lucide-react';
import UserDataChangeRequest from '@/components/profile/UserDataChangeRequest';
import { Separator } from '@/components/ui/separator';
import { AccountDeletionRequest } from '@/components/profile/AccountDeletionRequest';

const Profile = () => {
  const session = useContext(SessionContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        if (!session?.user?.id) {
          navigate('/login');
          return;
        }
        
        // Check admin status
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
        
        // Check moderator status
        const moderatorStatus = await checkIsModerator();
        setIsModerator(moderatorStatus);
        
        // Get user profile
        const profileData = await getUserProfile(session.user.id);
        setProfile(profileData);
        
        // Set up news loader
        if (typeof window !== 'undefined' && window.loadNewsIntoProfile) {
          window.loadNewsIntoProfile();
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Fehler",
          description: "Dein Profil konnte nicht geladen werden.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [session, navigate]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Fehler",
        description: "Abmeldung fehlgeschlagen. Bitte versuche es erneut.",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <LoaderIcon className="h-12 w-12 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <ProfileTabs defaultTab={defaultTab} isAdmin={isAdmin} isModerator={isModerator}>
        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Profile Card */}
            <Card className="md:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Mein Profil</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Abmelden
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center">
                <div className="w-24 h-24 relative mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.username || 'User'} />
                    <AvatarFallback className="text-2xl">
                      {profile?.username?.charAt(0)?.toUpperCase() || <User />}
                    </AvatarFallback>
                  </Avatar>
                  <ProfileImageUpload userId={session.user.id} />
                </div>
                
                <h3 className="text-xl font-semibold">{profile?.username || 'Kein Nutzername'}</h3>
                <p className="text-sm text-gray-500 mt-1">{session.user.email}</p>
                
                {(isAdmin || isModerator) && (
                  <div className="flex gap-2 mt-2">
                    {isAdmin && (
                      <Badge className="bg-red-100 text-red-800 flex gap-1 items-center">
                        <ShieldAlert className="h-3 w-3" />
                        Administrator
                      </Badge>
                    )}
                    {isModerator && !isAdmin && (
                      <Badge className="bg-blue-100 text-blue-800 flex gap-1 items-center">
                        <ShieldCheck className="h-3 w-3" />
                        Moderator
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* IDs and Accounts */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>IDs und Kontoeinstellungen</CardTitle>
                <CardDescription>
                  Verwalte deine Discord- und Roblox-IDs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <UserDataChangeRequest 
                  currentDiscordId={profile?.discord_id}
                  currentRobloxId={profile?.roblox_id}
                  userId={session.user.id}
                />
                
                <Separator className="my-4" />
                
                <AccountDeletionRequest userId={session.user.id} />
              </CardContent>
            </Card>
            
            {/* News Feed */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Neuigkeiten</CardTitle>
                <CardDescription>
                  Die neuesten Updates und Ankündigungen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div id="profile-news-feed">
                  <div className="text-center py-4">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></div>
                    <p className="mt-2 text-sm text-gray-500">Neuigkeiten werden geladen...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Team Meeting Info */}
            <MeetingCountdown display="card" className="md:col-span-1" />
          </div>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kontoeinstellungen</CardTitle>
              <CardDescription>
                Verwalte deine persönlichen Einstellungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Kontoeinstellungen werden demnächst verfügbar sein.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Admin Panel Tab */}
        <TabsContent value="admin">
          <AdminPanel />
        </TabsContent>
        
        {/* Absences Tab */}
        <TabsContent value="absences">
          <TeamAbsencesTab />
        </TabsContent>
        
        {/* News Tab */}
        <TabsContent value="news" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Neuigkeiten und Ankündigungen</CardTitle>
              <CardDescription>
                Alle aktuellen Neuigkeiten und Ankündigungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div id="profile-news-feed-full">
                {/* This will be filled by a duplicate news loader for this tab */}
                <script dangerouslySetInnerHTML={{
                  __html: `
                    if (typeof window !== 'undefined' && window.loadNewsIntoProfile) {
                      window.loadNewsIntoProfile = function() {
                        const original = document.getElementById('profile-news-feed');
                        const full = document.getElementById('profile-news-feed-full');
                        if (original && full) {
                          full.innerHTML = original.innerHTML;
                        }
                      }
                      window.loadNewsIntoProfile();
                    }
                  `
                }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Meetings Tab */}
        <TabsContent value="meetings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team-Meetings</CardTitle>
              <CardDescription>
                Übersicht aller kommenden Team-Meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <MeetingCountdown display="card" className="bg-white shadow-sm" />
              </div>
              
              {(isAdmin || isModerator) && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Vom Meeting abmelden</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <TeamAbsencesTab />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </ProfileTabs>
    </div>
  );
};

export default Profile;
