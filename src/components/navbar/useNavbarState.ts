
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { checkIsAdmin, checkIsModerator } from '@/lib/admin';
import { toast } from '@/hooks/use-toast';

export const useNavbarState = () => {
  const { session } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user) {
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
        
        const moderatorStatus = await checkIsModerator();
        setIsModerator(moderatorStatus);
      } else {
        setIsAdmin(false);
        setIsModerator(false);
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
      
      // Optionally force reload after logout to ensure clean state
      window.location.href = '/';
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
