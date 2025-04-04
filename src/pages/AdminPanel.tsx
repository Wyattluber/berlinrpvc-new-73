
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { checkIsAdmin } from '@/lib/admin';
import { toast } from '@/hooks/use-toast';

const AdminPanel = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "Zugriff verweigert",
            description: "Du musst angemeldet sein, um auf diesen Bereich zuzugreifen.",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }
        
        const isAdmin = await checkIsAdmin();
        
        if (!isAdmin) {
          toast({
            title: "Zugriff verweigert",
            description: "Du hast keine Administratorrechte für diesen Bereich.",
            variant: "destructive"
          });
          navigate('/profile');
          return;
        }
        
        // If user has admin access, redirect to profile with admin tab
        navigate('/profile?tab=admin');
      } catch (error) {
        console.error("Error checking admin access:", error);
        navigate('/profile');
      }
    };
    
    checkAccess();
  }, [navigate]);
  
  // Return null while checking, effect will handle redirection
  return null;
};

export default AdminPanel;
