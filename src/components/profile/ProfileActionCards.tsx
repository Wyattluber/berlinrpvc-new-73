
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import AccountDeletionRequest from './AccountDeletionRequest';
import UserDataChangeRequest from './UserDataChangeRequest';
import TeamAbsencesDisplay from './TeamAbsencesDisplay';
import { checkIsAdmin, checkIsModerator } from '@/lib/admin';

interface ProfileActionCardsProps {
  userId: string;
  discordId: string | null;
  robloxId: string | null;
}

const ProfileActionCards: React.FC<ProfileActionCardsProps> = ({
  userId,
  discordId,
  robloxId,
}) => {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isModerator, setIsModerator] = React.useState(false);

  React.useEffect(() => {
    const checkUserRole = async () => {
      const adminStatus = await checkIsAdmin();
      const modStatus = await checkIsModerator();
      setIsAdmin(adminStatus);
      setIsModerator(modStatus || adminStatus); // Admins are implicitly moderators
    };

    checkUserRole();
  }, []);

  return (
    <div className="space-y-6">
      {/* Show absences for team members */}
      {(isAdmin || isModerator) && (
        <TeamAbsencesDisplay userId={userId} />
      )}
      
      {/* ID Change Request Card */}
      <UserDataChangeRequest 
        currentDiscordId={discordId} 
        currentRobloxId={robloxId} 
        userId={userId} 
      />
      
      {/* Account Deletion Request Card */}
      <AccountDeletionRequest />
    </div>
  );
};

export default ProfileActionCards;
