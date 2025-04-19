
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PartnershipManagement from './PartnershipManagement';
import TeamMeetingsManagement from './TeamMeetingsManagement';
import StoreItemsManagement from './StoreItemsManagement';
import ApplicationManagement from './ApplicationManagement';
import { Handshake, Calendar, ShoppingBag, UserPlus, Layout } from 'lucide-react';

const ModeratorContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSection = searchParams.get('section') || 'applications';
  const [activeSection, setActiveSection] = useState(initialSection);
  
  // Update URL when tab changes
  const handleTabChange = (value) => {
    setActiveSection(value);
    setSearchParams({ section: value });
  };
  
  // Update state if URL changes
  useEffect(() => {
    const section = searchParams.get('section');
    if (section && section !== activeSection) {
      setActiveSection(section);
    }
  }, [searchParams, activeSection]);

  return (
    <div className="space-y-4">
      <Tabs 
        value={activeSection} 
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden md:inline">Bewerbungen</span>
          </TabsTrigger>
          <TabsTrigger value="partnerships" className="flex items-center gap-2">
            <Handshake className="h-4 w-4" />
            <span className="hidden md:inline">Partnerschaften</span>
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden md:inline">Teammeetings</span>
          </TabsTrigger>
          <TabsTrigger value="store" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden md:inline">Store</span>
          </TabsTrigger>
          <TabsTrigger value="discord" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            <span className="hidden md:inline">Discord</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="applications" className="mt-0">
          <ApplicationManagement />
        </TabsContent>
        
        <TabsContent value="partnerships" className="mt-0">
          <PartnershipManagement />
        </TabsContent>
        
        <TabsContent value="meetings" className="mt-0">
          <TeamMeetingsManagement />
        </TabsContent>
        
        <TabsContent value="store" className="mt-0">
          <StoreItemsManagement />
        </TabsContent>
        
        <TabsContent value="discord" className="mt-0">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-bold mb-4">Discord Manager Verwaltung</h3>
            <p className="text-gray-600 mb-6">
              Hier können Discord Manager-Anfragen verwaltet werden. 
              Diese Funktionalität wird in Kürze implementiert.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModeratorContent;
