
import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '@/App';
import { checkIsAdmin } from '@/lib/admin';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const session = useContext(SessionContext);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const checkAdminStatus = async () => {
      try {
        if (!session?.user) {
          navigate('/login');
          return;
        }

        const adminStatus = await checkIsAdmin();
        
        // Only navigate if the component is still mounted
        if (isMounted) {
          setIsChecking(false);
          // Always redirect to profile page with admin section
          navigate('/profile');
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        if (isMounted) {
          setIsChecking(false);
          navigate('/profile');
        }
      }
    };
    
    checkAdminStatus();
    
    // Cleanup function to prevent navigation after unmount
    return () => {
      isMounted = false;
    };
  }, [session, navigate]);

  // Only show loading indicator if still checking
  if (!isChecking) {
    return null;
  }

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

export default AdminDashboard;
