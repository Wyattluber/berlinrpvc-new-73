
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { checkIsAdmin, checkIsModerator } from '@/lib/admin';
import { toast } from '@/hooks/use-toast';

export const useNavbarState = () => {
  const { session, resetAuth } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    
    const checkAdminStatus = async () => {
      if (session?.user) {
        setIsLoading(true);
        try {
          const adminStatus = await checkIsAdmin();
          if (isMounted) setIsAdmin(adminStatus);
          
          const moderatorStatus = await checkIsModerator();
          if (isMounted) setIsModerator(moderatorStatus);
        } catch (error) {
          console.error("Error checking admin/moderator status:", error);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      } else {
        setIsAdmin(false);
        setIsModerator(false);
      }
    };
    
    checkAdminStatus();
    
    return () => {
      isMounted = false;
    };
  }, [session]);
  
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);
  
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      
      // Clear auth data from local storage
      localStorage.removeItem('supabase.auth.token');
      
      toast({
        title: "Erfolgreicher Logout",
        description: "Du wurdest erfolgreich ausgeloggt.",
      });
      
      // Use the resetAuth function to ensure a clean state
      resetAuth();
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Fehler beim Logout",
        description: "Es gab ein Problem beim Ausloggen.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  return {
    session,
    isAdmin,
    isModerator,
    sidebarOpen,
    setSidebarOpen,
    handleLogout,
    isLoading
  };
};
