
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartnershipManagement from './PartnershipManagement';
import TeamMeetingsManagement from './TeamMeetingsManagement';
import StoreItemsManagement from './StoreItemsManagement';
import ApplicationManagement from './ApplicationManagement';

const ModeratorContent = () => {
  const [activeTab, setActiveTab] = useState<string>("applications");
  
  return (
    <Tabs defaultValue="applications" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-6 grid grid-cols-4 w-full max-w-md">
        <TabsTrigger value="applications">Bewerbungen</TabsTrigger>
        <TabsTrigger value="partnerships">Partnerschaften</TabsTrigger>
        <TabsTrigger value="team-meetings">Teammeetings</TabsTrigger>
        <TabsTrigger value="store">Store</TabsTrigger>
      </TabsList>
      
      <TabsContent value="applications">
        <ApplicationManagement />
      </TabsContent>
      
      <TabsContent value="partnerships">
        <PartnershipManagement />
      </TabsContent>
      
      <TabsContent value="team-meetings">
        <TeamMeetingsManagement />
      </TabsContent>
      
      <TabsContent value="store">
        <StoreItemsManagement />
      </TabsContent>
    </Tabs>
  );
};

export default ModeratorContent;
