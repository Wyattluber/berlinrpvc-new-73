
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkIsAdmin } from '@/lib/admin';
import { toast } from '@/hooks/use-toast';
import { fetchAdminUsers, getCachedUserCount } from '@/lib/adminService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderIcon, Users, FileText, Settings, LayoutDashboard, ChevronRight } from 'lucide-react';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarInset,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';

// Dashboard content components
const DashboardOverview = ({ userCount, adminUsers }: { userCount: number, adminUsers: any[] }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Dashboard Übersicht</h2>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Benutzer gesamt
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userCount}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Admin-Benutzer
          </CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{adminUsers.length}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Bewerbungen
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">-</div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const UsersManagement = ({ adminUsers }: { adminUsers: any[] }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Benutzerverwaltung</h2>
    <Card>
      <CardHeader>
        <CardTitle>Administratoren</CardTitle>
        <CardDescription>
          Verwalte Benutzer mit administrativen Berechtigungen
        </CardDescription>
      </CardHeader>
      <CardContent>
        {adminUsers.length === 0 ? (
          <p>Keine Admin-Benutzer gefunden.</p>
        ) : (
          <div className="space-y-2">
            {adminUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">{user.email || "Kein E-Mail"}</p>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
                <Button variant="outline" size="sm">Bearbeiten</Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </div>
);

const ApplicationsManagement = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Bewerbungsverwaltung</h2>
    <Card>
      <CardHeader>
        <CardTitle>Bewerbungen verwalten</CardTitle>
        <CardDescription>
          Verwalte und überprüfe eingehende Bewerbungen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Bewerbungsübersicht wird geladen...</p>
      </CardContent>
    </Card>
  </div>
);

const SettingsManagement = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Systemeinstellungen</h2>
    <Card>
      <CardHeader>
        <CardTitle>Teameinstellungen</CardTitle>
        <CardDescription>
          Verwalte Teameinstellungen wie Meetings und Benachrichtigungen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Einstellungen werden geladen...</p>
      </CardContent>
    </Card>
  </div>
);

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
        
        if (adminStatus) {
          // Fetch admin-related data
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
      }
    };
    
    checkAccess();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 w-full">
        <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (isAdmin === false) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Zugriff verweigert</CardTitle>
          <CardDescription>
            Du benötigst Administrator-Berechtigungen, um auf diesen Bereich zuzugreifen.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Sidebar menu items configuration
  const menuItems = [
    { title: "Dashboard", id: "dashboard", icon: LayoutDashboard },
    { title: "Benutzer", id: "users", icon: Users },
    { title: "Bewerbungen", id: "applications", icon: FileText },
    { title: "Einstellungen", id: "settings", icon: Settings }
  ];
  
  // Render the selected content based on activeSection
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview userCount={userCount} adminUsers={adminUsers} />;
      case 'users':
        return <UsersManagement adminUsers={adminUsers} />;
      case 'applications':
        return <ApplicationsManagement />;
      case 'settings':
        return <SettingsManagement />;
      default:
        return <DashboardOverview userCount={userCount} adminUsers={adminUsers} />;
    }
  };
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full">
        <Sidebar>
          <SidebarHeader className="flex items-center justify-center py-4">
            <h2 className="text-xl font-bold">Admin Panel</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        onClick={() => setActiveSection(item.id)}
                        isActive={activeSection === item.id}
                        tooltip={item.title}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset>
          <div className="p-6">
            {renderContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminPanel;
