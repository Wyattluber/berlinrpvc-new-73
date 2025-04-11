
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from '@/integrations/supabase/client';
import { ensureUserProfile } from '@/lib/auth';

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
  const [initTimeout, setInitTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    console.log("AuthProvider initialized");
    
    // Set a safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        console.error("Auth initialization timeout after 10 seconds");
        setLoadingError("Authentifizierung Timeout - Bitte Seite neu laden");
        setLoading(false);
      }
    }, 10000); // 10 second timeout
    
    setInitTimeout(timeout);
    
    // Improved auth initialization with race condition handling
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...");
        
        // First set up the auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
          console.log("Auth state changed:", _event, newSession ? "Session exists" : "No session");
          if (!isMounted) return;
          
          setSession(newSession);
          
          // Create profile for new users if needed
          if (newSession?.user && _event === 'SIGNED_IN') {
            try {
              // Use setTimeout to prevent blocking the auth state change
              setTimeout(async () => {
                await ensureUserProfile(newSession.user);
              }, 0);
            } catch (err) {
              console.error("Error ensuring user profile:", err);
            }
          }
          
          // Check for deletion request if user is logged in
          if (newSession?.user) {
            try {
              // Use setTimeout to prevent blocking the auth state change
              setTimeout(async () => {
                const { data, error } = await supabase
                  .from('account_deletion_requests')
                  .select('id')
                  .eq('user_id', newSession.user.id)
                  .eq('status', 'pending')
                  .maybeSingle();
                
                if (error) {
                  console.error("Error checking deletion requests:", error);
                  return;
                }
                
                if (isMounted) {
                  setHasDeletionRequest(!!data);
                }
              }, 0);
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
        
        // Then check current session status with reduced timeout (5 seconds)
        const sessionPromise = new Promise<any>(async (resolve, reject) => {
          try {
            const result = await supabase.auth.getSession();
            resolve(result);
          } catch (error) {
            reject(new Error("Session check failed"));
          }
          
          // Add internal timeout
          setTimeout(() => {
            reject(new Error("Session check timeout"));
          }, 5000);
        });
        
        try {
          const { data: sessionData } = await sessionPromise;
          
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
            
            setLoading(false);
            
            // Clear the safety timeout if auth completed successfully
            if (initTimeout) {
              clearTimeout(initTimeout);
              setInitTimeout(null);
            }
          }
        } catch (error) {
          console.error("Session check failed:", error);
          // Continue without error, the auth state change listener will handle authentication
          if (isMounted) {
            setLoading(false);
          }
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
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
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
      
      // Force reload to ensure clean state
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
