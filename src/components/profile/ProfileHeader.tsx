
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface ProfileHeaderProps {
  session: any;
  username: string;
  avatarUrl: string;
  isAdmin: boolean;
  isModerator: boolean;
  profile: any;
  onAvatarUpdate: (url: string) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  session, 
  username, 
  avatarUrl, 
  isAdmin, 
  isModerator, 
  profile,
  onAvatarUpdate
}) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
      <div className="flex-shrink-0">
        <ProfileImageUpload 
          userId={session.user.id} 
          existingImageUrl={avatarUrl} 
          onImageUploaded={onAvatarUpdate} 
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
  );
};

export default ProfileHeader;
