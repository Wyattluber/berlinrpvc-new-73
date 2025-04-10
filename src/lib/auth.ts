
import { supabase } from '@/integrations/supabase/client';

// Function to remove Discord discriminator (#0000 format) from usernames
export const cleanDiscordUsername = (username: string): string => {
  // Remove the Discord discriminator (#1234) if present
  return username.replace(/#\d{4}$/, '').replace(/#0$/, '');
};

// Add this function to create a profile for a new user
export const ensureUserProfile = async (user: any) => {
  if (!user) return;
  
  try {
    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error checking profile:", profileError);
      return;
    }

    if (!existingProfile) {
      console.log("Creating new user profile for:", user.id);
      console.log("User metadata:", user.user_metadata);
      
      // Extract username from user metadata
      const discordUsername = user.user_metadata?.full_name || 
                             user.user_metadata?.name ||
                             user.user_metadata?.preferred_username ||
                             user.email?.split('@')[0] || 
                             'User';
                             
      // Clean the Discord username (remove any #0000 format)
      const cleanUsername = cleanDiscordUsername(discordUsername);
      
      // Discord ID from user metadata
      const discordId = user.user_metadata?.provider_id || null;
      
      // Avatar URL from user metadata
      const avatarUrl = user.user_metadata?.avatar_url || null;
      
      console.log("Creating profile with username:", cleanUsername);
      console.log("Discord ID:", discordId);
      console.log("Avatar URL:", avatarUrl);
      
      // Create profile
      const { error } = await supabase.from('profiles').insert({
        id: user.id,
        username: cleanUsername,
        discord_id: discordId,
        avatar_url: avatarUrl
      });
      
      if (error) {
        console.error('Error creating user profile:', error);
      } else {
        console.log('User profile created successfully');
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    return false;
  }
};

// Modified auth state listener to handle profile creation separately
// to avoid blocking the auth flow
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log(`Auth state changed: ${event}`, session);
  
  // Create an auth log entry
  if (session) {
    try {
      const { error } = await supabase
        .from('auth_logs')
        .insert({
          user_id: session.user.id,
          event_type: event,
          session_id: session.access_token,
          user_agent: navigator.userAgent,
          ip_address: null, // IP will be captured by RLS policy on server
        });

      if (error) {
        console.error('Error creating auth log:', error);
      }
    } catch (error) {
      console.error('Error creating auth log:', error);
    }
  }
});
