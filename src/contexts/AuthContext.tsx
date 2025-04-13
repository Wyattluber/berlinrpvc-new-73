
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from '@/integrations/supabase/client';
import { updateUserProfile } from '@/lib/auth';

// Create context for session
type AuthContextType = {
  session: any;
  loading: boolean;
  loadingError: string | null;
  hasDeletionRequest: boolean;
  resetAuth: () => Promise<void>;
  signOut: () => Promise<void>; // Added signOut method
};

export const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  loadingError: null,
  hasDeletionRequest: false,
  resetAuth: async () => {},
  signOut: async () => {}, // Added signOut default implementation
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
          
          // Update user profile with Discord data when signing in
          if (_event === 'SIGNED_IN' && newSession?.user) {
            setTimeout(async () => {
              try {
                const userData = newSession.user;
                
                // Extract Discord ID from user metadata if available
                let discordId = '';
                let avatarUrl = '';
                
                if (userData.app_metadata?.provider === 'discord') {
                  discordId = userData.app_metadata?.provider_id || '';
                }
                
                if (userData.user_metadata?.avatar_url) {
                  avatarUrl = userData.user_metadata.avatar_url;
                }
                
                // Get existing profile data
                const { data: existingProfile } = await supabase
                  .from('profiles')
                  .select('discord_id, avatar_url')
                  .eq('id', userData.id)
                  .maybeSingle();
                  
                // Only update if we have data and it's different from what's stored
                const shouldUpdateDiscordId = discordId && (!existingProfile || !existingProfile.discord_id);
                const shouldUpdateAvatarUrl = avatarUrl && (!existingProfile || !existingProfile.avatar_url);
                
                if (shouldUpdateDiscordId || shouldUpdateAvatarUrl) {
                  const updates: any = {};
                  
                  if (shouldUpdateDiscordId) {
                    updates.discord_id = discordId;
                  }
                  
                  if (shouldUpdateAvatarUrl) {
                    updates.avatar_url = avatarUrl;
                  }
                  
                  await updateUserProfile(userData.id, updates);
                  console.log("Updated profile with Discord data:", updates);
                }
              } catch (err) {
                console.error("Error updating profile with Discord data:", err);
              }
            }, 0);
          }
          
          // Check for deletion request if user is logged in
          if (newSession?.user) {
            setTimeout(async () => {
              try {
                const { data, error } = await supabase
                  .from('account_deletion_requests')
                  .select('id')
                  .eq('user_id', newSession.user.id)
                  .eq('status', 'pending')
                  .maybeSingle();
                  
                if (isMounted) {
                  setHasDeletionRequest(!!data);
                }
                
                if (error) {
                  console.error("Error checking deletion requests:", error);
                }
              } catch (err) {
                console.error("Error checking deletion requests:", err);
              }
            }, 0);
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
