
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
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
        <TabsList className="flex flex-col h-full items-stretch bg-transparent space-y-1">
          <TabsTrigger 
            value="profile" 
            className="justify-start"
            onClick={() => setActiveTab('profile')}
            data-state={activeTab === 'profile' ? 'active' : ''}
          >
            <User className="h-4 w-4 mr-2" />
            Profil
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger 
              value="admin" 
              className="justify-start"
              onClick={() => setActiveTab('admin')}
              data-state={activeTab === 'admin' ? 'active' : ''}
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin Dashboard
            </TabsTrigger>
          )}
          {(isAdmin || isModerator) && (
            <TabsTrigger 
              value="moderator" 
              className="justify-start"
              onClick={() => setActiveTab('moderator')}
              data-state={activeTab === 'moderator' ? 'active' : ''}
            >
              <Settings className="h-4 w-4 mr-2" />
              Moderator
            </TabsTrigger>
          )}
          <TabsTrigger 
            value="applications" 
            className="justify-start"
            onClick={() => setActiveTab('applications')}
            data-state={activeTab === 'applications' ? 'active' : ''}
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            Bewerbungen
          </TabsTrigger>
          <TabsTrigger 
            value="partnership" 
            className="justify-start"
            onClick={() => setActiveTab('partnership')}
            data-state={activeTab === 'partnership' ? 'active' : ''}
          >
            <HandshakeIcon className="h-4 w-4 mr-2" />
            Partnerschaft
          </TabsTrigger>
        </TabsList>
      </CardContent>
    </Card>
  );
};

export default ProfileSidebar;
