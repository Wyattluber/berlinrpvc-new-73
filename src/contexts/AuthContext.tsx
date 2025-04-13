
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from '@/integrations/supabase/client';

// Create context for session
type AuthContextType = {
  session: any;
  loading: boolean;
  loadingError: string | null;
  hasDeletionRequest: boolean;
  resetAuth: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  loadingError: null,
  hasDeletionRequest: false,
  resetAuth: async () => {},
  signOut: async () => {},
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
        
        // Set up auth state change listener first to catch any auth events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
          console.log("Auth state changed:", _event, newSession ? "Session exists" : "No session");
          if (!isMounted) return;
          
          setSession(newSession);
          
          // Check for deletion request if user is logged in
          if (newSession?.user) {
            try {
              // Check for user in profiles table
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', newSession.user.id)
                .maybeSingle();

              // If user doesn't exist in profiles or discord_id is empty, update the profile
              if (profileError || !profileData || !profileData.discord_id) {
                // Get Discord info from user metadata
                const discordId = newSession.user?.user_metadata?.provider_id || 
                                  newSession.user?.identities?.[0]?.identity_data?.provider_id ||
                                  null;
                
                const avatarUrl = newSession.user?.user_metadata?.avatar_url || 
                                  newSession.user?.identities?.[0]?.identity_data?.avatar_url ||
                                  null;
                
                const username = newSession.user?.user_metadata?.full_name || 
                                 newSession.user?.identities?.[0]?.identity_data?.full_name ||
                                 newSession.user.email;
                
                console.log("Updating profile with Discord info:", { discordId, avatarUrl, username });
                
                // Update or create profile
                const { error: updateError } = await supabase
                  .from('profiles')
                  .upsert({
                    id: newSession.user.id,
                    username: username,
                    discord_id: discordId,
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString()
                  });
                  
                if (updateError) {
                  console.error("Error updating profile:", updateError);
                }
              }
              
              // Also check for deletion requests
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
              // Check for user in profiles table and update if needed
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', sessionData.session.user.id)
                .maybeSingle();

              // If user doesn't exist in profiles or discord_id is empty, update the profile
              if (profileError || !profileData || !profileData.discord_id) {
                // Get Discord info from user metadata
                const discordId = sessionData.session.user?.user_metadata?.provider_id || 
                                  sessionData.session.user?.identities?.[0]?.identity_data?.provider_id ||
                                  null;
                
                const avatarUrl = sessionData.session.user?.user_metadata?.avatar_url || 
                                  sessionData.session.user?.identities?.[0]?.identity_data?.avatar_url ||
                                  null;
                
                const username = sessionData.session.user?.user_metadata?.full_name || 
                                 sessionData.session.user?.identities?.[0]?.identity_data?.full_name ||
                                 sessionData.session.user.email;
                
                console.log("Initial session - Updating profile with Discord info:", { discordId, avatarUrl, username });
                
                // Update or create profile
                const { error: updateError } = await supabase
                  .from('profiles')
                  .upsert({
                    id: sessionData.session.user.id,
                    username: username,
                    discord_id: discordId,
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString()
                  });
                  
                if (updateError) {
                  console.error("Error updating profile:", updateError);
                }
              }
              
              // Also check for deletion requests
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

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        loading, 
        loadingError, 
        hasDeletionRequest, 
        resetAuth,
        signOut 
      }}
    >
      <SessionContext.Provider value={session}>
        {children}
      </SessionContext.Provider>
    </AuthContext.Provider>
  );
};
