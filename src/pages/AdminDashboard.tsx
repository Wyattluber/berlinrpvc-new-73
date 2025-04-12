
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import AdminContent from '@/components/admin/AdminContent';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileHeader, AdminMobileSidebar } from '@/components/admin/AdminMobileNav';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminMenuItems } from '@/components/admin/AdminMenuItems';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { section } = useParams();
  const [activeSection, setActiveSection] = useState(section || 'dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [adminUsers, setAdminUsers] = useState([]);
  const { session } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Redirect to external admin panel if the external-admin option is selected
  useEffect(() => {
    if (activeSection === 'external-admin') {
      window.location.href = 'https://berlinrpvc-new-51.lovable.app/login';
    }
  }, [activeSection]);
  
  useEffect(() => {
    const checkUserRole = async () => {
      setLoading(true);
      
      if (!session) {
        navigate('/login');
        return;
      }
      
      try {
        // Check if the user is an admin or moderator
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
          
        if (adminError && adminError.code !== 'PGRST116') {
          console.error('Error checking admin status:', adminError);
          toast({
            title: 'Fehler',
            description: 'Fehler beim Überprüfen der Administratorberechtigungen.',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }
        
        const isUserAdmin = adminData && adminData.role === 'admin';
        const isUserModerator = adminData && adminData.role === 'moderator';
        
        setIsAdmin(isUserAdmin);
        setIsModerator(isUserModerator);
        
        if (!isUserAdmin && !isUserModerator) {
          toast({
            title: 'Zugriff verweigert',
            description: 'Du hast keine Berechtigung, auf das Admin-Dashboard zuzugreifen.',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }
        
        // Fetch user count and admin users for the dashboard
        if (isUserAdmin) {
          const { count: userCountData, error: userCountError } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true });
            
          if (!userCountError) {
            setUserCount(userCountData || 0);
          }
          
          const { data: adminUsersData, error: adminUsersError } = await supabase
            .from('admin_users')
            .select('*');
            
          if (!adminUsersError) {
            setAdminUsers(adminUsersData || []);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in admin dashboard:', error);
        toast({
          title: 'Fehler',
          description: 'Ein unerwarteter Fehler ist aufgetreten.',
          variant: 'destructive',
        });
        navigate('/');
      }
    };
    
    checkUserRole();
  }, [session, navigate]);
  
  const handleUpdateRole = async (userId, role) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ role })
        .eq('user_id', userId);
        
      if (error) throw error;
      
      toast({
        title: 'Erfolgreich',
        description: 'Benutzerrolle wurde aktualisiert.',
      });
      
      // Refresh admin users list
      const { data, error: fetchError } = await supabase
        .from('admin_users')
        .select('*');
        
      if (!fetchError) setAdminUsers(data);
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Fehler',
        description: 'Benutzerrolle konnte nicht aktualisiert werden.',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('user_id', userId);
        
      if (error) throw error;
      
      toast({
        title: 'Erfolgreich',
        description: 'Benutzer wurde aus dem Administrationsteam entfernt.',
      });
      
      // Refresh admin users list
      const { data, error: fetchError } = await supabase
        .from('admin_users')
        .select('*');
        
      if (!fetchError) setAdminUsers(data);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Fehler',
        description: 'Benutzer konnte nicht entfernt werden.',
        variant: 'destructive',
      });
    }
  };
  
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setMobileMenuOpen(false); // Close mobile menu when changing sections
  };
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center flex-grow bg-gray-100">
          <div className="p-8 rounded-lg bg-white shadow-md flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">Admin-Bereich wird geladen...</h2>
            <p className="text-gray-500 mt-2">Bitte warte einen Moment.</p>
          </div>
        </div>
      </div>
    );
  }
  
  const menuItems = getAdminMenuItems(isAdmin);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex">
        {/* Sidebar (hidden on mobile) */}
        <AdminSidebar
          isAdmin={isAdmin}
          menuItems={menuItems}
          activeSection={activeSection}
          handleMenuClick={handleSectionChange}
        />
        
        {/* Mobile navigation */}
        <div className="md:hidden">
          <AdminMobileHeader
            isAdmin={isAdmin}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
          
          {mobileMenuOpen && (
            <AdminMobileSidebar
              menuItems={menuItems}
              activeSection={activeSection}
              handleMenuClick={handleSectionChange}
            />
          )}
        </div>
        
        {/* Main content */}
        <div className="flex-1 bg-gray-50 p-4 md:p-6 overflow-auto">
          <AdminContent 
            isAdmin={isAdmin}
            isModerator={isModerator}
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

export default AdminDashboard;
