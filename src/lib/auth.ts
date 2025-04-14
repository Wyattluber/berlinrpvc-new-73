
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
    (event, session) => {
      if (event === 'SIGNED_IN') {
        // Log sign in events
        if (session?.user) {
          logAuthEvent('SIGNED_IN', session.user.id, {
            ip: 'client-side',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          });
          
          // Ensure profile data is up to date
          ensureProfileData(session.user);
          
          // Ensure we have an avatars bucket for profile images
          ensureAvatarsBucketExists();
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
 * Ensure the avatars storage bucket exists
 */
async function ensureAvatarsBucketExists() {
  try {
    // Check if the avatars bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      return;
    }
    
    // If the avatars bucket doesn't exist, create it
    if (!buckets.find(bucket => bucket.name === 'avatars')) {
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
      });
      
      if (createError) {
        console.error('Error creating avatars bucket:', createError);
      } else {
        console.log('Created avatars bucket successfully');
      }
    }
  } catch (error) {
    console.error('Error ensuring avatars bucket exists:', error);
  }
}

/**
 * Ensure user profile data is complete
 */
async function ensureProfileData(user: any) {
  try {
    if (!user) return;
    
    // Extract Discord ID and avatar URL from user metadata
    let discordId = '';
    let avatarUrl = '';
    
    if (user.app_metadata?.provider === 'discord') {
      discordId = user.app_metadata?.provider_id || '';
    }
    
    if (user.user_metadata?.avatar_url) {
      avatarUrl = user.user_metadata.avatar_url;
    }
    
    // Check if profile exists
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking user profile:', error);
      return;
    }
    
    // Create profile if it doesn't exist
    if (!profile) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          discord_id: discordId,
          avatar_url: avatarUrl,
          username: user.user_metadata?.full_name || user.email
        }]);
        
      if (insertError) {
        console.error('Error creating user profile:', insertError);
      } else {
        console.log('Created new profile for user');
      }
      
      return;
    }
    
    // Update profile if missing data
    const updates: any = {};
    let needsUpdate = false;
    
    if (discordId && !profile.discord_id) {
      updates.discord_id = discordId;
      needsUpdate = true;
    }
    
    if (avatarUrl && !profile.avatar_url) {
      updates.avatar_url = avatarUrl;
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (updateError) {
        console.error('Error updating user profile:', updateError);
      } else {
        console.log('Updated user profile with missing data:', updates);
      }
    }
  } catch (error) {
    console.error('Error ensuring profile data:', error);
  }
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
      
      // Only prevent updates if the values are non-empty
      if (existingProfile.discord_id && existingProfile.discord_id.trim() !== '' && profileData.discord_id) {
        delete updatedData.discord_id;
      }
      
      if (existingProfile.roblox_id && existingProfile.roblox_id.trim() !== '' && profileData.roblox_id) {
        delete updatedData.roblox_id;
      }
      
      // Update existing profile
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

/**
 * Update existing profiles with Discord data from auth metadata
 */
export async function updateExistingProfilesWithDiscordData() {
  try {
    // Get all profiles that need updating (missing discord_id or avatar_url)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .or('discord_id.is.null,avatar_url.is.null');
      
    if (profilesError) throw profilesError;
    
    if (!profiles || profiles.length === 0) {
      console.log('No profiles need Discord data updates');
      return { success: true, updated: 0 };
    }
    
    let updatedCount = 0;
    
    // Process each profile
    for (const profile of profiles) {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.id);
      
      if (authError) {
        console.error(`Error getting auth data for user ${profile.id}:`, authError);
        continue;
      }
      
      if (!authUser) continue;
      
      const userData = authUser.user;
      const updates: any = {};
      
      // Extract Discord ID if available and missing in profile
      if (userData.app_metadata?.provider === 'discord' && userData.app_metadata?.provider_id) {
        updates.discord_id = userData.app_metadata.provider_id;
      }
      
      // Extract avatar URL if available and missing in profile
      if (userData.user_metadata?.avatar_url) {
        updates.avatar_url = userData.user_metadata.avatar_url;
      }
      
      // Only update if we have data to update
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', profile.id);
          
        if (updateError) {
          console.error(`Error updating profile ${profile.id}:`, updateError);
        } else {
          updatedCount++;
        }
      }
    }
    
    return { success: true, updated: updatedCount };
  } catch (error: any) {
    console.error('Error updating profiles with Discord data:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to update profiles with Discord data' 
    };
  }
}

// Setup auth event listeners on module load
setupAuthEventListeners();

// Update existing profiles with Discord data
// This will update profiles for users who have already logged in
setTimeout(() => {
  // Don't block initial load with this operation
  updateExistingProfilesWithDiscordData().then(result => {
    console.log('Updated existing profiles with Discord data:', result);
  });
}, 5000);
