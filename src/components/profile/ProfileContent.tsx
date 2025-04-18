
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import ProfileTab from '@/components/profile/tabs/ProfileTab';
import ApplicationsTab from '@/components/profile/tabs/ApplicationsTab';
import AdminTab from '@/components/profile/tabs/AdminTab';
import ModeratorTab from '@/components/profile/tabs/ModeratorTab';
import PartnershipTab from '@/components/profile/tabs/PartnershipTab';
import ModinfoTab from '@/components/profile/tabs/ModinfoTab';

interface ProfileContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  session: any;
  username: string;
  discordId: string;
  robloxId: string;
  isAdmin: boolean;
  isModerator: boolean;
  applications: any[];
  navigate: any;
}

const ProfileContent: React.FC<ProfileContentProps> = ({
  activeTab,
  setActiveTab,
  session,
  username,
  discordId,
  robloxId,
  isAdmin,
  isModerator,
  applications,
  navigate
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsContent value="profile">
        <ProfileTab 
          session={session}
          username={username}
          discordId={discordId}
          robloxId={robloxId}
        />
      </TabsContent>
      
      <TabsContent value="admin">
        {isAdmin && (
          <AdminTab />
        )}
      </TabsContent>
      
      <TabsContent value="moderator">
        {(isAdmin || isModerator) && (
          <ModeratorTab />
        )}
      </TabsContent>
      
      <TabsContent value="modinfo">
        {(isAdmin || isModerator) && (
          <ModinfoTab />
        )}
      </TabsContent>
      
      <TabsContent value="applications">
        <ApplicationsTab 
          applications={applications}
          navigate={navigate}
        />
      </TabsContent>
      
      <TabsContent value="partnership">
        <PartnershipTab 
          navigate={navigate}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileContent;
