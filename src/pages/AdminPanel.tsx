
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminPanel = () => {
  // Instead of using useEffect to redirect, use Navigate component
  return <Navigate to="/admin/dashboard" replace />;
};

export default AdminPanel;
