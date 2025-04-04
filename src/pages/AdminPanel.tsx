
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminPanel = () => {
  // Use direct navigation to profile page with admin tab
  return <Navigate to="/profile?tab=admin" replace />;
};

export default AdminPanel;
