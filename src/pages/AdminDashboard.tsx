
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { checkIsAdmin } from '@/lib/admin';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const AdminDashboard = () => {
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
        
        // Navigate directly to the profile page with admin tab
        navigate('/profile?tab=admin');
      } catch (error) {
        console.error("Error checking admin access:", error);
        toast({
          title: "Fehler",
          description: "Es gab ein Problem beim Zugriff auf den Admin-Bereich.",
          variant: "destructive"
        });
        navigate('/profile');
      }
    };
    
    checkAccess();
  }, [navigate]);
  
  // Zeige einen Ladeindikator während der Überprüfung
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 rounded-lg bg-white shadow-md flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">Admin-Bereich wird geladen...</h2>
        <p className="text-gray-500 mt-2">Du wirst automatisch weitergeleitet.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
