
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkIsAdmin } from '@/lib/admin';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AdminPanel = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    const checkAdminStatus = async () => {
      try {
        const adminStatus = await checkIsAdmin();
        
        if (isMounted) {
          // Instead of showing the panel here, redirect to Profile with admin tab
          navigate('/profile?tab=admin');
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        if (isMounted) {
          navigate('/profile');
        }
      }
    };
    
    checkAdminStatus();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-gray-600">Leite weiter zum Admin-Bereich...</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPanel;
