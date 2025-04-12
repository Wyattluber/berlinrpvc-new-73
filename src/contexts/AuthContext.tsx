
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from '@/integrations/supabase/client';
import { ensureUserProfile } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

// Create context for session
type AuthContextType = {
  session: any;
  user: any; // Add user property to the type definition
  loading: boolean;
  loadingError: string | null;
  hasDeletionRequest: boolean;
  resetAuth: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null, // Initialize the user property
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
  const [user, setUser] = useState<any>(null); // Add user state
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [hasDeletionRequest, setHasDeletionRequest] = useState(false);
  const [initTimeout, setInitTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    console.log("AuthProvider initialized");
    
    // Set a safety timeout to prevent infinite loading (reduced from 8s to 6s)
    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        console.error("Auth initialization timeout after 6 seconds");
        setLoadingError("Authentifizierung Timeout - Bitte Seite neu laden oder Cookies löschen");
        setLoading(false);
      }
    }, 6000); // 6 second timeout instead of 8
    
    setInitTimeout(timeout);
    
    // Simplified auth initialization to avoid race conditions
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...");
        
        // First check current session status directly - with timeout
        const sessionPromise = supabase.auth.getSession();
        
        // Add a timeout for the session retrieval to fail faster
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Session retrieval timeout")), 3000)
        );
        
        // Race between session retrieval and timeout
        const { data: sessionData, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise.then(() => {
            throw new Error("Session retrieval timeout");
          })
        ]) as any;
        
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
          setUser(sessionData.session?.user || null); // Set user state
          
          // Clear the safety timeout if session check completed successfully
          if (initTimeout) {
            clearTimeout(initTimeout);
            setInitTimeout(null);
          }
        }
        
        // Then set up the auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
          console.log("Auth state changed:", _event, newSession ? "Session exists" : "No session");
          if (!isMounted) return;
          
          setSession(newSession);
          setUser(newSession?.user || null); // Update user state
          
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
        
        // Force set loading to false after a short delay regardless of session check
        setTimeout(() => {
          if (isMounted && loading) {
            console.log("Forcing loading state to false after delay");
            setLoading(false);
          }
        }, 800);
        
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
      // Show toast to indicate reset is in progress
      toast({
        title: "Authentifizierung wird zurückgesetzt",
        description: "Bitte warten...",
      });
      
      await supabase.auth.signOut({ scope: 'global' });
      setSession(null);
      setUser(null); // Reset user state
      setLoadingError(null);
      
      // Clear local storage auth data to ensure a clean slate
      localStorage.removeItem('supabase.auth.token');
      
      // Show success message
      toast({
        title: "Authentifizierung zurückgesetzt",
        description: "Bitte lade die Seite neu oder versuche erneut einzuloggen. Lösche ggf. alle Cookies.",
      });
      
      // Force reload after a short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      console.error("Error resetting auth:", error);
      // Fallback: On severe errors, try to clear localStorage
      localStorage.clear();
      toast({
        title: "Fehler beim Zurücksetzen",
        description: "Bitte lade die Seite manuell neu und lösche alle Cookies.",
        variant: "destructive",
      });
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        session,
        user, // Include user in the context value
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
