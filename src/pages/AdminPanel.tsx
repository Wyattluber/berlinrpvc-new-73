import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkIsAdmin, checkIsModerator } from '@/lib/admin';
import { toast } from '@/hooks/use-toast';
import { fetchAdminUsers, getCachedUserCount, updateAdminUser, deleteAdminUser } from '@/lib/adminService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LoaderIcon, Users, FileText, Settings, LayoutDashboard, 
  UserCog, ShieldCheck, BellRing, ChevronRight, Menu, X,
  Share, Server, Info
} from 'lucide-react';
import ServerStats from '@/components/ServerStats';
import NewsManagement from '@/components/NewsManagement';
import ApplicationsList from '@/components/ApplicationsList';
import PartnerServersManagement from '@/components/PartnerServersManagement';
import SubServersManagement from '@/components/SubServersManagement';
import TeamSettingsForm from '@/components/admin/TeamSettingsForm';
import TeamAbsencesList from '@/components/admin/TeamAbsencesList';
import ModeratorAbsencePanel from '@/components/admin/ModeratorAbsencePanel';
import UsersManagement from '@/components/admin/UsersManagement';
import DashboardOverview from '@/components/admin/DashboardOverview';

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isModerator, setIsModerator] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          setIsModerator(false);
          setLoading(false);
          return;
        }
        
        const adminStatus = await checkIsAdmin();
        const moderatorStatus = await checkIsModerator();
        
        setIsAdmin(adminStatus);
        setIsModerator(moderatorStatus || adminStatus); // Admins are implicitly moderators
        
        if (adminStatus) {
          const users = await fetchAdminUsers();
          setAdminUsers(users);
          
          const count = await getCachedUserCount();
          setUserCount(count);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking admin access:", error);
        setLoading(false);
        setIsAdmin(false);
        setIsModerator(false);
      }
    };
    
    checkAccess();
  }, []);

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const result = await updateAdminUser(userId, role);
      
      if (result.success) {
        toast({
          title: "Erfolg",
          description: "Benutzerrolle erfolgreich aktualisiert."
        });
        
        setAdminUsers(prevUsers => prevUsers.map(user => 
          user.id === userId ? { ...user, role } : user
        ));
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Aktualisieren der Benutzerrolle.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const result = await deleteAdminUser(userId);
      
      if (result.success) {
        toast({
          title: "Erfolg",
          description: "Benutzer erfolgreich gelöscht."
        });
        
        setAdminUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Löschen des Benutzers.",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 w-full">
        <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (isAdmin === false && isModerator === false) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Zugriff verweigert</CardTitle>
          <CardDescription>
            Du benötigst Administrator- oder Moderator-Berechtigungen, um auf diesen Bereich zuzugreifen.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const menuItems = isAdmin ? [
    { title: "Dashboard", id: "dashboard", icon: LayoutDashboard },
    { title: "Benutzer", id: "users", icon: Users },
    { title: "Bewerbungen", id: "applications", icon: FileText },
    { title: "Neuigkeiten", id: "news", icon: BellRing },
    { title: "Partner", id: "partners", icon: Share },
    { title: "Unterserver", id: "sub_servers", icon: Server },
    { title: "Teameinstellungen", id: "team-settings", icon: Settings },
    { title: "Abmeldungen", id: "absences", icon: UserCog }
  ] : [
    { title: "Dashboard", id: "dashboard", icon: LayoutDashboard },
    { title: "Bewerbungen", id: "applications", icon: FileText },
    { title: "Vom Meeting abmelden", id: "absence-form", icon: UserCog },
  ];
  
  const handleMenuClick = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false); // Close mobile menu when an item is clicked
  };
  
  const renderContent = () => {
    if (isAdmin) {
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
        case 'news':
          return <NewsManagement />;
        case 'partners':
          return <PartnerServersManagement />;
        case 'sub_servers':
          return <SubServersManagement />;
        case 'team-settings':
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Teameinstellungen</h2>
              <TeamSettingsForm />
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
  };

  const desktopSidebar = (
    <div className="hidden md:block md:w-64 bg-gray-50 border-r min-h-[calc(100vh-64px)]">
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold px-2 mb-4">
          {isAdmin ? "Admin Panel" : "Moderator Panel"}
        </h2>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center px-2 py-2 text-sm rounded-md transition-colors ${
                activeSection === item.id
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.title}</span>
              {activeSection === item.id && <ChevronRight className="ml-auto h-4 w-4" />}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );

  const mobileHeader = (
    <div className="md:hidden border-b py-3 px-4 flex items-center justify-between sticky top-0 bg-white z-10">
      <h1 className="text-xl font-semibold">
        {isAdmin ? "Admin Panel" : "Moderator Panel"}
      </h1>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
    </div>
  );

  const mobileSidebar = mobileMenuOpen && (
    <div className="md:hidden bg-white w-full border-b shadow-sm z-10">
      <nav className="py-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            className={`w-full flex items-center px-4 py-3 text-sm ${
              activeSection === item.id
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700"
            }`}
          >
            <item.icon className="mr-3 h-5 w-5" />
            <span>{item.title}</span>
            {activeSection === item.id && <ChevronRight className="ml-auto h-4 w-4" />}
          </button>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {desktopSidebar}
      <div className="flex-1">
        {mobileHeader}
        {mobileSidebar}
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
