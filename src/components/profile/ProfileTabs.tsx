
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Settings, ShieldAlert, CalendarX, MessageSquare, 
  Clock, AlertCircle 
} from 'lucide-react';

interface ProfileTabsProps {
  defaultTab?: string;
  isAdmin: boolean;
  isModerator: boolean;
  children: React.ReactNode;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ 
  defaultTab = 'profile', 
  isAdmin, 
  isModerator,
  children 
}) => {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-8">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profil</span>
        </TabsTrigger>
        
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Einstellungen</span>
        </TabsTrigger>
        
        {(isAdmin || isModerator) && (
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </TabsTrigger>
        )}
        
        {(isAdmin || isModerator) && (
          <TabsTrigger value="absences" className="flex items-center gap-2">
            <CalendarX className="h-4 w-4" />
            <span className="hidden sm:inline">Abmeldungen</span>
          </TabsTrigger>
        )}
        
        <TabsTrigger value="news" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Neuigkeiten</span>
        </TabsTrigger>
        
        <TabsTrigger value="meetings" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Meetings</span>
        </TabsTrigger>
      </TabsList>
      
      {children}
    </Tabs>
  );
};

export default ProfileTabs;
