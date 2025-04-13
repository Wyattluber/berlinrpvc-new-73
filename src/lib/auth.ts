
import { supabase } from '@/integrations/supabase/client';

/**
 * Log auth event for security monitoring
 */
export async function logAuthEvent(eventType: string, userId: string, metadata: any = {}) {
  try {
    // In a complete implementation, this would send the auth event to a logging system
    // or store it in a database table for audit purposes
    console.log('Auth event logged:', { eventType, userId, metadata, timestamp: new Date() });
    
    // Implement auth logging with Supabase
    // Cast to any to bypass TypeScript checks until types are updated
    const { error } = await (supabase as any)
      .from('auth_logs')
      .insert([{
        user_id: userId,
        event_type: eventType,
        metadata: metadata,
        ip_address: metadata.ip || null,
        user_agent: metadata.userAgent || null,
        created_at: new Date().toISOString()
      }]);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error logging auth event:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to log auth event' 
    };
  }
}

/**
 * Setup auth event listeners to track logins and other auth events
 */
export function setupAuthEventListeners() {
  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN') {
        // Log sign in events
        if (session?.user) {
          logAuthEvent('SIGNED_IN', session.user.id, {
            ip: 'client-side',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          });
          
          // Ensure Discord ID and avatar URL are in profile
          try {
            // Get Discord info from user metadata
            const discordId = session.user?.user_metadata?.provider_id || 
                              session.user?.identities?.[0]?.identity_data?.provider_id ||
                              null;
            
            const avatarUrl = session.user?.user_metadata?.avatar_url || 
                              session.user?.identities?.[0]?.identity_data?.avatar_url ||
                              null;
            
            const username = session.user?.user_metadata?.full_name || 
                             session.user?.identities?.[0]?.identity_data?.full_name ||
                             session.user.email;
            
            console.log("Auth event - Updating profile with Discord info:", { discordId, avatarUrl, username });
            
            // Check if profile exists
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('discord_id, avatar_url')
              .eq('id', session.user.id)
              .maybeSingle();
              
            // Only update if profile is missing Discord data
            if (profileError || !profileData || !profileData.discord_id || !profileData.avatar_url) {
              // Update profile with Discord data
              await supabase
                .from('profiles')
                .upsert({
                  id: session.user.id,
                  username: username,
                  discord_id: discordId,
                  avatar_url: avatarUrl,
                  updated_at: new Date().toISOString()
                });
            }
          } catch (error) {
            console.error("Error updating profile with Discord data:", error);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        // Log sign out events
        if (session?.user) {
          logAuthEvent('SIGNED_OUT', session.user.id, {
            ip: 'client-side',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          });
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // Log token refresh events
        console.log('Token refreshed successfully at', new Date().toISOString());
      }
    }
  );
  
  // Return the unsubscribe function for cleanup
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Get recent auth logs for the user
 */
export async function getRecentAuthLogs(userId: string, limit = 10) {
  try {
    // Use direct raw query to bypass TypeScript issues with RPC function
    const { data, error } = await supabase
      .from('auth_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
      .then(result => {
        return result;
      });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching auth logs:', error);
    return [];
  }
}

/**
 * Check if profile IDs are already set and cannot be changed
 */
export async function checkProfileIdsLocked(userId: string): Promise<{discord_locked: boolean, roblox_locked: boolean}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('discord_id, roblox_id')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    
    return {
      discord_locked: !!data?.discord_id,
      roblox_locked: !!data?.roblox_id
    };
  } catch (error) {
    console.error('Error checking profile IDs status:', error);
    return { discord_locked: false, roblox_locked: false };
  }
}

/**
 * Update user profile data in Supabase
 */
export async function updateUserProfile(userId: string, profileData: any) {
  try {
    // First check if the profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, discord_id, roblox_id')
      .eq('id', userId)
      .maybeSingle();
      
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    // Don't allow updating discord_id or roblox_id if they're already set
    if (existingProfile) {
      const updatedData = { ...profileData };
      
      if (existingProfile.discord_id && profileData.discord_id) {
        delete updatedData.discord_id;
      }
      
      if (existingProfile.roblox_id && profileData.roblox_id) {
        delete updatedData.roblox_id;
      }
      
      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (updateError) throw updateError;
    } else {
      // If profile doesn't exist, create it
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
        
      if (insertError) throw insertError;
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to update user profile' 
    };
  }
}

// Create a function to create a storage bucket for avatars if it doesn't exist
export async function ensureAvatarsBucketExists() {
  try {
    // Check if the avatars bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) throw listError;
    
    const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
    
    if (!avatarsBucketExists) {
      console.log('Creating avatars bucket...');
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true
      });
      
      if (createError) throw createError;
      
      console.log('Avatars bucket created successfully');
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error ensuring avatars bucket exists:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to ensure avatars bucket exists' 
    };
  }
}

// Setup auth event listeners on module load
setupAuthEventListeners();
// Ensure avatars bucket exists on module load
ensureAvatarsBucketExists();
