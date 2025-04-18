
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { checkIsModerator } from '@/lib/admin';
import ModeratorContent from '@/components/moderator/ModeratorContent';

const ModeratorPanel = () => {
  const navigate = useNavigate();
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  
  useEffect(() => {
    const checkUserRole = async () => {
      setLoading(true);
      
      if (!session) {
        navigate('/login');
        return;
      }
      
      try {
        // Check if the user is a moderator
        const isUserModerator = await checkIsModerator();
        setIsModerator(isUserModerator);
        
        if (!isUserModerator) {
          toast({
            title: 'Zugriff verweigert',
            description: 'Du hast keine Berechtigung, auf das Moderator-Dashboard zuzugreifen.',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in moderator dashboard:', error);
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
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center flex-grow bg-gray-100">
          <div className="p-8 rounded-lg bg-white shadow-md flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">Moderator-Bereich wird geladen...</h2>
            <p className="text-gray-500 mt-2">Bitte warte einen Moment.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 bg-gray-50 p-4 md:p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Moderator Dashboard</h1>
          <ModeratorContent />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ModeratorPanel;
