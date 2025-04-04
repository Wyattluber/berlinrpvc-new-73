
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if the current user has admin privileges by querying the admin_users table
 */
export async function checkIsAdmin() {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return false;
    
    const userId = session.user.id;
    
    // Query the admin_users table to check if the current user is an admin
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return !!adminUser; // Returns true if the user was found in the admin_users table
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Add a user as an admin
 */
export async function addAdmin(userId: string) {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .insert({ user_id: userId })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding admin:', error);
      return {
        success: false,
        message: error.message
      };
    }
    
    return {
      success: true,
      message: 'Admin privileges granted successfully',
      data
    };
  } catch (error: any) {
    console.error('Error adding admin:', error);
    return {
      success: false,
      message: error.message || 'An unknown error occurred'
    };
  }
}
