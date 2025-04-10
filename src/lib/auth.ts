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
      // Extract username from user metadata
      const discordUsername = user.user_metadata?.full_name || 
                             user.user_metadata?.name ||
                             user.user_metadata?.preferred_username ||
                             user.email?.split('@')[0] || 
                             'User';
                             
      // Clean the Discord username (remove any #0000 format)
      const cleanUsername = cleanDiscordUsername(discordUsername);
      
      // Discord ID from user metadata if available
      const discordId = user.user_metadata?.provider_id || null;
      
      // Create profile
      const { error } = await supabase.from('profiles').insert({
        id: user.id,
        username: cleanUsername,
        discord_id: discordId,
        avatar_url: user.user_metadata?.avatar_url || null
      });
      
      if (error) {
        console.error('Error creating user profile:', error);
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
          session_id: session.session?.access_token,
        });

      if (error) {
        console.error('Error creating auth log:', error);
      }
    } catch (error) {
      console.error('Error creating auth log:', error);
    }
  }
});
