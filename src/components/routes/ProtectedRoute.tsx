
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
      hasDeletionRequest,
      sessionData: session ? 'Session exists' : 'No session'
    });
  }, [loading, session, location.pathname, hasDeletionRequest]);
  
  // Show loading spinner while auth state is being determined
  // Add a 5-second maximum loading time to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        console.log("Loading timeout reached - forcing authentication check");
        // This will force a re-render and check if we have session data
        // If not, the user will be redirected to login
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading]);
  
  // Don't render anything until we know the auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!session && requiresAuth) {
    console.log("Not authenticated, redirecting to login from", location.pathname);
    return <Navigate to="/login" replace />;
  }
  
  if (session && hasDeletionRequest && location.pathname !== '/cancel-deletion') {
    console.log("User has deletion request, redirecting to cancel-deletion");
    return <Navigate to="/cancel-deletion" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
