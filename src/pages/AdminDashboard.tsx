
import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '@/App';
import { checkIsAdmin } from '@/lib/admin';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const session = useContext(SessionContext);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        if (!session?.user) {
          navigate('/login');
          return;
        }

        const adminStatus = await checkIsAdmin();
        
        if (adminStatus) {
          // Redirect to the new admin section in the profile page
          navigate('/profile');
        } else {
          navigate('/profile');
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate('/profile');
      }
    };
    
    checkAdminStatus();
  }, [session, navigate]);

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
