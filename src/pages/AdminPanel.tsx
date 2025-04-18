
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminPanel = () => {
  // Redirect to external admin panel
  window.location.href = 'https://berlinrpvc-new-51.lovable.app/login';
  return null;
};

export default AdminPanel;
