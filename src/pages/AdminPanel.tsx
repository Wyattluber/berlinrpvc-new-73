
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkIsAdmin, checkIsModerator } from '@/lib/admin';
import { toast } from '@/hooks/use-toast';
import { 
  fetchAdminUsers, 
  getCachedUserCount, 
  updateAdminUser, 
  deleteAdminUser 
} from '@/lib/admin/users';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderIcon } from 'lucide-react';
import { getAdminMenuItems } from '@/components/admin/AdminMenuItems';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileHeader, AdminMobileSidebar } from '@/components/admin/AdminMobileNav';
import AdminContent from '@/components/admin/AdminContent';

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

  const menuItems = getAdminMenuItems(isAdmin!);
  
  const handleMenuClick = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false); // Close mobile menu when an item is clicked
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <AdminSidebar 
        isAdmin={isAdmin!} 
        menuItems={menuItems} 
        activeSection={activeSection} 
        handleMenuClick={handleMenuClick} 
      />
      <div className="flex-1">
        <AdminMobileHeader 
          isAdmin={isAdmin!} 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
        />
        {mobileMenuOpen && (
          <AdminMobileSidebar 
            menuItems={menuItems} 
            activeSection={activeSection} 
            handleMenuClick={handleMenuClick} 
          />
        )}
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <AdminContent 
            isAdmin={isAdmin!} 
            isModerator={isModerator!} 
            activeSection={activeSection} 
            userCount={userCount} 
            adminUsers={adminUsers} 
            handleUpdateRole={handleUpdateRole} 
            handleDeleteUser={handleDeleteUser} 
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
