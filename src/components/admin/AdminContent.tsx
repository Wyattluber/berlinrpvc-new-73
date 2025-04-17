
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import NewsManager from './NewsManager';
import SubServerManager from './SubServerManager';
import ApplicationSeasonsManager from './ApplicationSeasonsManager';
import AccountDeletionRequestsManager from './AccountDeletionRequestsManager';
import IdChangeRequestsManager from './IdChangeRequestsManager';
import StoreItemsWrapper from './StoreItemsWrapper';
import PartnershipRequestsManager from './PartnershipRequestsManager';
import DashboardOverview from './DashboardOverview';

const AdminContent = ({ 
  isAdmin, 
  isModerator,
  activeSection, 
  userCount,
  adminUsers,
  handleUpdateRole,
  handleDeleteUser
}) => {
  const renderDashboardContent = () => {
    return (
      <DashboardOverview userCount={userCount} adminUsers={adminUsers} />
    );
  };

  // Render content based on active section
  const renderContent = () => {
    switch(activeSection) {
      case 'dashboard':
        return renderDashboardContent();
      
      case 'news':
        return (
          <NewsManager />
        );
      
      case 'sub_servers':
        return (
          <SubServerManager />
        );
      
      case 'application-seasons':
        return (
          <ApplicationSeasonsManager />
        );
      
      case 'deletion-requests':
        return (
          <AccountDeletionRequestsManager />
        );
      
      case 'change-requests':
        return (
          <IdChangeRequestsManager />
        );
      
      case 'partnerships':
        return (
          <PartnershipRequestsManager />
        );
      
      case 'store':
        return (
          <StoreItemsWrapper />
        );
        
      default:
        return (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold text-gray-800">Willkommen im Admin-Bereich</h2>
            <p className="text-gray-500 mt-2">Wähle eine Option aus dem Menü, um fortzufahren.</p>
          </div>
        );
    }
  };
  
  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default AdminContent;
