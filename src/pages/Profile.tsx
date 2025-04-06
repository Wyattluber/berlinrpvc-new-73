
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile } from '@/lib/admin/users';
import ProfileActionCards from '@/components/profile/ProfileActionCards';
import { loadNewsIntoProfile } from '@/helpers/newsLoader';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        setLoading(true);
        
        // Get the logged in user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Handle not logged in state
          setLoading(false);
          return;
        }
        
        setUser(user);
        
        // Get the user's profile
        const profileData = await getUserProfile(user.id);
        setProfile(profileData);
        
        // Load news after profile is loaded
        setTimeout(() => {
          loadNewsIntoProfile();
        }, 100);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndProfile();
  }, []);

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Nicht angemeldet</h1>
          <p>Du musst dich anmelden, um dein Profil anzuzeigen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Dein Profil</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Profilinformationen</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Benutzername</h3>
                <p className="text-base">{profile?.username || 'Kein Benutzername festgelegt'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Discord ID</h3>
                <p className="text-base break-all">{profile?.discord_id || 'Keine Discord ID festgelegt'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Roblox ID</h3>
                <p className="text-base break-all">{profile?.roblox_id || 'Keine Roblox ID festgelegt'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Neuigkeiten</h2>
            <div id="profile-news-feed" className="space-y-4">
              <div className="text-center text-gray-500">
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                <p className="mt-2">Lade Neuigkeiten...</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <ProfileActionCards 
            userId={user.id} 
            discordId={profile?.discord_id} 
            robloxId={profile?.roblox_id} 
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
