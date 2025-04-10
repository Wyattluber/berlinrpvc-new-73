
import { supabase } from '@/integrations/supabase/client';
import { cleanDiscordUsername } from './usernameValidation';

// Add this function to create a profile for a new user
export const ensureUserProfile = async (user: any) => {
  if (!user) return;
  
  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

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
      }
    }
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
  }
};

// Call this function from the auth state listener
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log(`Auth state changed: ${event}`, session);
  
  // Create an auth log entry
  if (session) {
    try {
      // Create profile for new users
      if (event === 'SIGNED_IN') {
        await ensureUserProfile(session.user);
      }
      
      const { data, error } = await supabase
        .from('auth_logs')
        .insert({
          user_id: session.user.id,
          event: event,
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
