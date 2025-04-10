
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from '@/integrations/supabase/client';

// Create context for session
type AuthContextType = {
  session: any;
  loading: boolean;
  loadingError: string | null;
  hasDeletionRequest: boolean;
  resetAuth: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  loadingError: null,
  hasDeletionRequest: false,
  resetAuth: async () => {},
});

// Export SessionContext for backward compatibility
export const SessionContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [hasDeletionRequest, setHasDeletionRequest] = useState(false);

  useEffect(() => {
    let isMounted = true;
    console.log("AuthProvider initialized");
    
    // Improved auth initialization
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...");
        setLoading(true);
        
        // Setup auth listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
          console.log("Auth state changed:", _event, newSession ? "Session exists" : "No session");
          if (!isMounted) return;
          
          setSession(newSession);
          
          // Check for deletion request if user is logged in
          if (newSession?.user) {
            try {
              supabase
                .from('account_deletion_requests')
                .select('id')
                .eq('user_id', newSession.user.id)
                .eq('status', 'pending')
                .maybeSingle()
                .then(({ data, error }) => {
                  if (error) {
                    console.error("Error checking deletion requests:", error);
                    return;
                  }
                  if (isMounted) {
                    setHasDeletionRequest(!!data);
                  }
                });
            } catch (err) {
              console.error("Error checking deletion requests:", err);
            }
          } else {
            setHasDeletionRequest(false);
          }
          
          if (isMounted) {
            setLoading(false);
          }
        });
        
        // Then check current session status
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }
        
        if (isMounted) {
          console.log("Initial session check:", sessionData.session ? "Logged in" : "Not logged in");
          setSession(sessionData.session);
          
          // Check for deletion request if user is logged in
          if (sessionData.session?.user) {
            try {
              const { data, error } = await supabase
                .from('account_deletion_requests')
                .select('id')
                .eq('user_id', sessionData.session.user.id)
                .eq('status', 'pending')
                .maybeSingle();
                
              setHasDeletionRequest(!!data);
            } catch (err) {
              console.error("Error checking deletion requests:", err);
              // Ignore error, assume no deletion request
              setHasDeletionRequest(false);
            }
          }
          
          // Important: set loading to false after we have a session
          setLoading(false);
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Critical app initialization error:", error);
        if (isMounted) {
          setLoading(false);
          setLoadingError("App initialization failed");
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper function to reset authentication on problems
  const resetAuth = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setLoadingError(null);
      
      // Clear local storage auth data to ensure a clean slate
      localStorage.removeItem('supabase.auth.token');
      
      window.location.href = "/";
    } catch (error) {
      console.error("Error resetting auth:", error);
      // Fallback: On severe errors, try to clear localStorage
      localStorage.clear();
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        loading, 
        loadingError, 
        hasDeletionRequest, 
        resetAuth 
      }}
    >
      <SessionContext.Provider value={session}>
        {children}
      </SessionContext.Provider>
    </AuthContext.Provider>
  );
};
