
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '../LoadingSpinner';
import { toast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireModerator?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireModerator = false }) => {
  const { session, user, loading, loadingError } = useAuth();
  const [checkingModRole, setCheckingModRole] = useState(requireModerator);
  const [hasModerator, setHasModerator] = useState(false);
  const [loadingMod, setLoadingMod] = useState(requireModerator);
  const [modCheckAttempted, setModCheckAttempted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkModeratorStatus = async () => {
      if (!requireModerator || !session) {
        setCheckingModRole(false);
        setLoadingMod(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking moderator status:', error);
          throw error;
        }

        setHasModerator(!!data);
      } catch (error) {
        console.error('Failed to check moderator status:', error);
        toast({
          title: 'Fehler',
          description: 'Dein Moderatorstatus konnte nicht überprüft werden.',
          variant: 'destructive',
        });
      } finally {
        setLoadingMod(false);
        setCheckingModRole(false);
        setModCheckAttempted(true);
      }
    };

    if (session && requireModerator) {
      checkModeratorStatus();
    } else if (!session && !loading) {
      setLoadingMod(false);
      setCheckingModRole(false);
    }
  }, [session, requireModerator]);

  // Handle loading state
  if (loading || (requireModerator && checkingModRole)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner 
          message={requireModerator ? "Überprüfe Moderatorberechtigung..." : "Überprüfe Anmeldung..."} 
          timeout={true}
          timeoutMs={3000}
        />
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!session) {
    // Display toast only once
    if (!loadingError) {
      toast({
        title: 'Anmeldung erforderlich',
        description: 'Du musst angemeldet sein, um auf diese Seite zuzugreifen.',
      });
    }
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If moderator role required but user doesn't have it
  if (requireModerator && !hasModerator && modCheckAttempted) {
    toast({
      title: 'Zugriff verweigert',
      description: 'Du benötigst Moderatorrechte, um auf diese Seite zuzugreifen.',
      variant: 'destructive',
    });
    
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
