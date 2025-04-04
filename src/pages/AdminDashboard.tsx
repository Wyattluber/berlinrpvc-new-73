
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  // Use direct navigation instead of useEffect
  return <Navigate to="/profile?tab=admin" replace />;
};

export default AdminDashboard;
