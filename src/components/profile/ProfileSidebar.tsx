
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, Settings, ClipboardList, HandshakeIcon } from 'lucide-react';

interface ProfileSidebarProps {
  isAdmin: boolean;
  isModerator: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ 
  isAdmin, 
  isModerator, 
  activeTab, 
  setActiveTab 
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-col h-full items-stretch bg-transparent space-y-1">
            <TabsTrigger 
              value="profile" 
              className="justify-start"
            >
              <User className="h-4 w-4 mr-2" />
              Profil
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger 
                value="admin" 
                className="justify-start"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin Dashboard
              </TabsTrigger>
            )}
            {(isAdmin || isModerator) && (
              <TabsTrigger 
                value="moderator" 
                className="justify-start"
              >
                <Settings className="h-4 w-4 mr-2" />
                Moderator
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="applications" 
              className="justify-start"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Bewerbungen
            </TabsTrigger>
            <TabsTrigger 
              value="partnership" 
              className="justify-start"
            >
              <HandshakeIcon className="h-4 w-4 mr-2" />
              Partnerschaft
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProfileSidebar;
