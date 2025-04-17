
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const AdminPanel = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to internal admin panel
    navigate('/admin/dashboard');
  }, [navigate]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow bg-gray-100"></div>
    </div>
  );
};

export default AdminPanel;
