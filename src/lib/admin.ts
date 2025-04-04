
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if the current logged-in user is an admin
 */
export async function checkIsAdmin() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    return !!data;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Grant admin privileges to a specific user
 */
export async function grantAdminPrivileges(userId: string, email: string) {
  try {
    // Check if already an admin
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    // Return early if already an admin
    if (existingAdmin) {
      return {
        success: true,
        message: 'User already has admin privileges'
      };
    }
    
    // Add to admin_users table
    const { error } = await supabase
      .from('admin_users')
      .insert([{
        user_id: userId,
        email: email
      }]);
    
    if (error) throw error;
    
    return {
      success: true,
      message: `Admin privileges granted to user ${userId}`
    };
  } catch (error: any) {
    console.error('Error granting admin privileges:', error);
    return {
      success: false,
      message: error.message || 'Unknown error occurred'
    };
  }
}
