
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresAuth = true 
}) => {
  const { session, loading, hasDeletionRequest } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    console.log("ProtectedRoute:", { 
      loading, 
      authenticated: !!session, 
      path: location.pathname,
      hasDeletionRequest 
    });
  }, [loading, session, location.pathname, hasDeletionRequest]);
  
  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!session && requiresAuth) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  if (session && hasDeletionRequest && location.pathname !== '/cancel-deletion') {
    console.log("User has deletion request, redirecting to cancel-deletion");
    return <Navigate to="/cancel-deletion" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
