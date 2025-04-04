
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Simple result type for admin operations
export interface AdminResult {
  success: boolean;
  message?: string;
  user?: User;
}

/**
 * Check if the current logged-in user is an admin
 */
export async function isUserAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    const { data } = await supabase
      .from('admin_users')
      .select()
      .eq('user_id', user.id)
      .maybeSingle();
    
    return !!data;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Check if an email exists in the admin_users table
 */
export async function checkAdminAccount(email: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('admin_users')
      .select()
      .eq('email', email)
      .maybeSingle();
    
    return !!data;
  } catch (error) {
    console.error('Error checking admin account:', error);
    return false;
  }
}

/**
 * Create a new admin account with email and password
 */
export async function createAdminAccount(email: string, password: string): Promise<AdminResult> {
  try {
    // First, create the user with the provided credentials
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) throw authError;
    if (!data.user) throw new Error('User creation failed');
    
    // Then add the user to the admin_users table
    const { error } = await supabase
      .from('admin_users')
      .insert([{
        user_id: data.user.id,
        email: email
      }]);
    
    if (error) throw error;
    
    return { success: true, user: data.user };
  } catch (error: any) {
    console.error('Error creating admin account:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Set specific user as admin by their user ID
 */
export async function setSpecificUserAsAdmin(userId: string, email: string): Promise<AdminResult> {
  try {
    // First check if user already has admin privileges
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select()
      .eq('user_id', userId)
      .maybeSingle();
      
    // If already an admin, just return success
    if (existingAdmin) {
      return { success: true, message: 'User already has admin privileges' };
    }
    
    // If not an admin, add admin privileges using array syntax for insert
    const { error } = await supabase
      .from('admin_users')
      .insert([{
        user_id: userId,
        email: email
      }]);
    
    if (error) throw error;
    
    return { success: true, message: `Admin privileges granted successfully to user ${userId}` };
  } catch (error: any) {
    console.error('Error setting specific user as admin:', error);
    return { success: false, message: error.message };
  }
}
