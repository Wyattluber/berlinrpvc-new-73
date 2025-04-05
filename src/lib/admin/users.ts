
/**
 * Get user profile information
 */
export async function getUserProfile(userId: string) {
  interface ProfileData {
    id: string;
    username: string;
    avatar_url: string;
    discord_id: string;
    roblox_id: string;
  }
  
  // Create a default profile object to ensure consistent return type
  const defaultProfile: ProfileData = { 
    id: userId, 
    username: '', 
    avatar_url: '', 
    discord_id: '', 
    roblox_id: '' 
  };
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    // If we have data, cast it as ProfileData and return it
    if (data) {
      return data as ProfileData;
    }
    
    // If no data is found, return the default profile
    return defaultProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Return the default profile on error
    return defaultProfile;
  }
}
