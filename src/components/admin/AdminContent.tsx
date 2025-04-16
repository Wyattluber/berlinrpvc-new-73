
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardOverview from '@/components/admin/DashboardOverview';
import UsersManagement from '@/components/admin/UsersManagement';
import ApplicationsList from '@/components/ApplicationsList';
import NewsManagement from '@/components/NewsManagement';
import PartnerServersManagement from '@/components/PartnerServersManagement';
import SubServersManagement from '@/components/SubServersManagement';
import TeamSettingsForm from '@/components/admin/TeamSettingsForm';
import TeamAbsencesList from '@/components/admin/TeamAbsencesList';
import ModeratorAbsencePanel from '@/components/admin/ModeratorAbsencePanel';
import ServerStats from '@/components/ServerStats';
import IdChangeRequestManager from '@/components/admin/IdChangeRequestManager';
import AccountDeletionRequestManager from '@/components/admin/AccountDeletionRequestManager';
import DiscordLinkManager from '@/components/admin/DiscordLinkManager';
import PartnershipRequestsManager from '@/components/admin/PartnershipRequestsManager';
import ApplicationTextsManager from '@/components/admin/ApplicationTextsManager';

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
  // Only moderators and admins should see team-related content
  if (!isModerator && !isAdmin) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Zugriff verweigert</CardTitle>
          <CardDescription>
            Du benötigst Administrator- oder Moderator-Berechtigungen, um auf diesen Inhalt zuzugreifen.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Common sections for both admins and moderators
  if (activeSection === 'partnerships') {
    return <PartnershipRequestsManager />;
  }

  if (activeSection === 'team-settings') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Teameinstellungen</h2>
        <TeamSettingsForm />
      </div>
    );
  }

  if (isAdmin) {
    // Admin-specific sections
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview userCount={userCount} adminUsers={adminUsers} />;
      case 'users':
        return <UsersManagement adminUsers={adminUsers} handleUpdateRole={handleUpdateRole} handleDeleteUser={handleDeleteUser} />;
      case 'applications':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Bewerbungsverwaltung</h2>
            <ApplicationsList />
          </div>
        );
      case 'application_texts':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Bewerbungstexte</h2>
            <ApplicationTextsManager />
          </div>
        );
      case 'news':
        return <NewsManagement />;
      case 'partners':
        return <PartnerServersManagement />;
      case 'sub_servers':
        return <SubServersManagement />;
      case 'change-requests':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Änderungsanträge</h2>
            <IdChangeRequestManager />
          </div>
        );
      case 'discord-link':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Discord-Link verwalten</h2>
            <DiscordLinkManager />
          </div>
        );
      case 'deletion-requests':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Kontolöschungsanträge</h2>
            <AccountDeletionRequestManager />
          </div>
        );
      case 'absences':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Team-Abmeldungen</h2>
            <Card>
              <CardHeader>
                <CardTitle>Übersicht der Abmeldungen</CardTitle>
                <CardDescription>
                  Sieh ein, welche Teammitglieder sich vom Meeting abgemeldet haben
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TeamAbsencesList />
              </CardContent>
            </Card>
            <ModeratorAbsencePanel />
          </div>
        );
      default:
        return <DashboardOverview userCount={userCount} adminUsers={adminUsers} />;
    }
  } else if (isModerator) {
    // Moderator-specific sections
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Moderator Dashboard</h2>
            <Card>
              <CardHeader>
                <CardTitle>Willkommen im Moderatorenbereich</CardTitle>
                <CardDescription>
                  Hier kannst du Bewerbungen einsehen und dich von Team-Meetings abmelden
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ServerStats isAdmin={false} />
              </CardContent>
            </Card>
          </div>
        );
      case 'applications':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Bewerbungsverwaltung</h2>
            <ApplicationsList />
          </div>
        );
      case 'absence-form':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Vom Team-Meeting abmelden</h2>
            <ModeratorAbsencePanel />
          </div>
        );
      default:
        return <div>Bereich nicht gefunden</div>;
    }
  }
  
  return null;
};

export default AdminContent;
