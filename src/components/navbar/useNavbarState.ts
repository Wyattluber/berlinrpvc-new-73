
import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SessionContext } from '../../App';
import { checkIsAdmin } from '@/lib/admin';
import { toast } from '@/hooks/use-toast';

export const useNavbarState = () => {
  const session = useContext(SessionContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user) {
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
        
        const { data: modData, error: modError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('role', 'moderator');
          
        if (!modError && modData && modData.length > 0) {
          setIsModerator(true);
        }
      }
    };
    
    checkAdminStatus();
  }, [session]);
  
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Erfolgreicher Logout",
        description: "Du wurdest erfolgreich ausgeloggt.",
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Fehler beim Logout",
        description: "Es gab ein Problem beim Ausloggen.",
        variant: "destructive",
      });
    }
  };
  
  return {
    session,
    isAdmin,
    isModerator,
    sidebarOpen,
    setSidebarOpen,
    handleLogout
  };
};
