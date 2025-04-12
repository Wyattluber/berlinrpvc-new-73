
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from '@/integrations/supabase/client';
import { ensureUserProfile } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

// Create context for session
type AuthContextType = {
  session: any;
  user: any;
  loading: boolean;
  loadingError: string | null;
  hasDeletionRequest: boolean;
  resetAuth: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [hasDeletionRequest, setHasDeletionRequest] = useState(false);

  useEffect(() => {
    let isMounted = true;
    console.log("AuthProvider initialized");
    
    // Set a safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        console.error("Auth initialization timeout after 6 seconds");
        setLoadingError("Authentifizierung Timeout - Bitte Seite neu laden");
        setLoading(false);
      }
    }, 6000);
    
    // Initialize auth
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...");
        
        // Set up the auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
          console.log("Auth state changed:", _event, newSession ? "Session exists" : "No session");
          if (!isMounted) return;
          
          setSession(newSession);
          setUser(newSession?.user || null);
          
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
        
        // Check current session status
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          if (isMounted) {
            setLoadingError("Fehler beim Laden der Sitzung");
            setLoading(false);
          }
          return;
        }
        
        if (isMounted) {
          console.log("Initial session check:", sessionData.session ? "Logged in" : "Not logged in");
          setSession(sessionData.session);
          setUser(sessionData.session?.user || null);
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
      clearTimeout(timeout);
    };
  }, []);

  // Helper function to reset authentication on problems
  const resetAuth = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      setSession(null);
      setUser(null);
      setLoadingError(null);
      
      // Clear local storage auth data to ensure a clean slate
      localStorage.removeItem('supabase.auth.token');
      
      // Force reload after a short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
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
        user,
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
