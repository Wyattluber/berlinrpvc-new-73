
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../LoadingSpinner';
import { checkIsModerator } from '@/lib/admin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireModerator?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requireModerator = false
}) => {
  const { session, loading } = useAuth();
  const [isCheckingModerator, setIsCheckingModerator] = useState(requireModerator);
  const [isModerator, setIsModerator] = useState(false);

  useEffect(() => {
    const checkModeratorAccess = async () => {
      if (requireModerator && session) {
        try {
          const hasAccess = await checkIsModerator();
          setIsModerator(hasAccess);
        } catch (error) {
          console.error('Error checking moderator access:', error);
          setIsModerator(false);
        } finally {
          setIsCheckingModerator(false);
        }
      }
    };

    checkModeratorAccess();
  }, [session, requireModerator]);

  if (loading || (requireModerator && isCheckingModerator)) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (requireModerator && !isModerator) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
