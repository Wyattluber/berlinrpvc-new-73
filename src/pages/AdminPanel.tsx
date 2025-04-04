
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminPanel = () => {
  // Instead of using useEffect for navigation, use Navigate component directly
  // This prevents unnecessary mounting/unmounting cycles
  return <Navigate to="/profile?tab=admin" replace />;
};

export default AdminPanel;
