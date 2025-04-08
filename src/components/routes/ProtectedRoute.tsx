
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresAuth = true 
}) => {
  const { session, hasDeletionRequest } = useAuth();
  
  if (!session && requiresAuth) {
    return <Navigate to="/login" />;
  }
  
  if (session && hasDeletionRequest && window.location.pathname !== '/cancel-deletion') {
    return <Navigate to="/cancel-deletion" />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
