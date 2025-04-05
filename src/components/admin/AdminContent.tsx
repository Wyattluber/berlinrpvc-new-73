
import React from 'react';
import AdminUserTable from '@/components/admin/UserRoleManager';
import AnnouncementsList from '@/components/admin/AnnouncementsManagement';
import ApplicationsList from '@/components/ApplicationsList';
import TeamSettingsForm from '@/components/admin/TeamSettingsForm';
import NewsManagement from '@/components/NewsManagement';
import AccountDeletionRequestManager from '@/components/admin/AccountDeletionRequestManager';
import IdChangeRequestManager from '@/components/admin/IdChangeRequestManager';
import ApplicationSeasonManager from '@/components/ApplicationSeasonManager';
import DashboardOverview from '@/components/admin/DashboardOverview';
import SubServersManagement from '@/components/SubServersManagement';
import PartnerServersManagement from '@/components/PartnerServersManagement';
import ModeratorAbsencePanel from '@/components/admin/ModeratorAbsencePanel';
import TeamAbsencesList from '@/components/admin/TeamAbsencesList';
import AnnouncementsManagement from '@/components/admin/AnnouncementsManagement';

interface AdminContentProps {
  isAdmin: boolean;
  isModerator: boolean;
  activeSection: string;
  userCount: number;
  adminUsers: any[];
  handleUpdateRole: (userId: string, role: string) => Promise<void>;
  handleDeleteUser: (userId: string) => Promise<void>;
}

const AdminContent: React.FC<AdminContentProps> = ({
  isAdmin,
  isModerator,
  activeSection,
  userCount,
  adminUsers,
  handleUpdateRole,
  handleDeleteUser
}) => {
  // Render component based on active section
  const renderComponent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview userCount={userCount} />;
      case 'users':
        if (!isAdmin) return <AccessDenied />;
        return (
          <AdminUserTable
            adminUsers={adminUsers}
            onUpdateRole={handleUpdateRole}
            onDeleteUser={handleDeleteUser}
          />
        );
      case 'applications':
        return <ApplicationsList />;
      case 'announcements':
        return <AnnouncementsManagement />;
      case 'news':
        return <NewsManagement />;
      case 'team-settings':
        if (!isAdmin) return <AccessDenied />;
        return <TeamSettingsForm />;
      case 'team-absences':
        return <TeamAbsencesList />;
      case 'my-absences':
        return <ModeratorAbsencePanel />;
      case 'change-requests':
        if (!isAdmin) return <AccessDenied />;
        return (
          <div className="space-y-6">
            <IdChangeRequestManager />
          </div>
        );
      case 'delete-requests':
        if (!isAdmin) return <AccessDenied />;
        return (
          <div className="space-y-6">
            <AccountDeletionRequestManager />
          </div>
        );
      case 'seasons':
        if (!isAdmin) return <AccessDenied />;
        return <ApplicationSeasonManager />;
      case 'subservers':
        if (!isAdmin) return <AccessDenied />;
        return <SubServersManagement />;
      case 'partners':
        if (!isAdmin) return <AccessDenied />;
        return <PartnerServersManagement />;
      default:
        return <DashboardOverview userCount={userCount} />;
    }
  };

  return <div>{renderComponent()}</div>;
};

const AccessDenied = () => (
  <div className="p-6 bg-red-50 border border-red-200 rounded-md">
    <h2 className="text-lg font-bold text-red-800 mb-2">Zugriff verweigert</h2>
    <p className="text-red-600">
      Du hast keine Berechtigung, auf diesen Bereich zuzugreifen. Bitte kontaktiere einen Administrator, wenn du glaubst, dass dies ein Fehler ist.
    </p>
  </div>
);

export default AdminContent;
