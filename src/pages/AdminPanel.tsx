
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

const AdminPanel = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to external admin panel
    window.location.href = 'https://berlinrpvc-new-51.lovable.app/login';
  }, []);
  
  // Show a loading indicator during verification with Navbar for consistent layout
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center flex-grow bg-gray-100">
        <div className="p-8 rounded-lg bg-white shadow-md flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Du wirst zum Admin-Bereich weitergeleitet...</h2>
          <p className="text-gray-500 mt-2">Bitte warte einen Moment.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
