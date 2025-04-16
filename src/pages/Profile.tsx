
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';

// Profile Components
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ProfileContent from '@/components/profile/ProfileContent';

const Profile = () => {
  const { session } = useAuth();
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
        
        const discordAvatar = session.user.user_metadata?.avatar_url;
        if (discordAvatar && discordAvatar !== profileData.avatar_url) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: discordAvatar })
            .eq('id', session.user.id);

          if (updateError) throw updateError;
          
          setAvatarUrl(discordAvatar);
        } else {
          setAvatarUrl(profileData?.avatar_url || '');
        }

        setProfile(profileData);
        setUsername(profileData?.username || '');
        setDiscordId(profileData?.discord_id || '');
        setRobloxId(profileData?.roblox_id || '');

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
          <ProfileHeader 
            session={session}
            username={username}
            avatarUrl={avatarUrl}
            isAdmin={isAdmin}
            isModerator={isModerator}
            profile={profile}
            onAvatarUpdate={setAvatarUrl}
          />
          
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <ProfileSidebar 
                isAdmin={isAdmin}
                isModerator={isModerator}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <ProfileContent 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                session={session}
                username={username}
                discordId={discordId}
                robloxId={robloxId}
                isAdmin={isAdmin}
                isModerator={isModerator}
                applications={applications}
                navigate={navigate}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
