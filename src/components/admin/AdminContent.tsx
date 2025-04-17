import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import AdminUsersManager from './AdminUsersManager';
import NewsManager from './NewsManager';
import SubServerManager from './SubServerManager';
import ApplicationSeasonsManager from './ApplicationSeasonsManager';
import AccountDeletionRequestsManager from './AccountDeletionRequestsManager';
import IdChangeRequestsManager from './IdChangeRequestsManager';
import StoreItemsWrapper from './StoreItemsWrapper';
import PartnershipRequestsManager from './PartnershipRequestsManager';

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Benutzerstatistik</CardTitle>
            <CardDescription>Anzahl registrierter Benutzer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-2xl font-bold">{userCount}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Admin-Team</CardTitle>
            <CardDescription>Administratoren und Moderatoren</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-none pl-0">
              {adminUsers.map(admin => (
                <li key={admin.id} className="py-2 border-b last:border-b-0">
                  <div className="flex items-center justify-between">
                    <span>{admin.user_id}</span>
                    <Badge variant="secondary">{admin.role}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render content based on active section
  const renderContent = () => {
    switch(activeSection) {
      case 'dashboard':
        return renderDashboardContent();
      
      case 'admin-users':
        return (
          <AdminUsersManager 
            adminUsers={adminUsers}
            handleUpdateRole={handleUpdateRole}
            handleDeleteUser={handleDeleteUser}
          />
        );
      
      case 'news':
        return (
          <NewsManager />
        );
      
      case 'sub-server':
        return (
          <SubServerManager />
        );
      
      case 'application-seasons':
        return (
          <ApplicationSeasonsManager />
        );
      
      case 'account-deletion-requests':
        return (
          <AccountDeletionRequestsManager />
        );
      
      case 'id-change-requests':
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
