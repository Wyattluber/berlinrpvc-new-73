
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Type for admin operations results
type AdminResult = {
  success: boolean;
  message?: string;
  user?: User;
};

/**
 * Check if the current logged-in user is an admin
 */
export async function isUserAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    return Boolean(data);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Create a new admin account with email and password
 */
export async function createAdminAccount(email: string, password: string): Promise<AdminResult> {
  try {
    // First, create the user with the provided credentials
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) throw authError;
    
    if (!authData.user) throw new Error('User creation failed');
    
    // Then add the user to the admin_users table
    const { error } = await supabase
      .from('admin_users')
      .insert({
        user_id: authData.user.id,
        email: email
      });
    
    if (error) throw error;
    
    return { success: true, user: authData.user };
  } catch (error: any) {
    console.error('Error creating admin account:', error);
    throw error;
  }
}

/**
 * Check if an email exists in the admin_users table
 */
export async function checkAdminAccount(email: string): Promise<boolean> {
  try {
    // Check if the email exists in the admin_users table
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    return Boolean(data);
  } catch (error) {
    console.error('Error checking admin account:', error);
    throw error;
  }
}

/**
 * Make an existing user an admin
 */
export async function makeUserAdmin(userId: string, email: string): Promise<AdminResult> {
  try {
    const { error } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        email: email
      });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error making user admin:', error);
    throw error;
  }
}

/**
 * Force update admin status for an existing account
 */
export async function forceUpdateAdminStatus(email: string): Promise<AdminResult> {
  try {
    // First check if user exists
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) throw userError;
    
    // Add proper type checking and null coalescing
    const users = userData?.users || [];
    const existingUser = users.find(u => u.email === email);
    
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    // Check if already admin
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
      
    // If already an admin, just return success
    if (existingAdmin) {
      return { success: true, message: 'User already has admin privileges' };
    }
    
    // If not an admin, add admin privileges
    const { error } = await supabase
      .from('admin_users')
      .insert({
        user_id: existingUser.id,
        email: email
      });
    
    if (error) throw error;
    
    return { success: true, message: 'Admin privileges granted successfully' };
  } catch (error: any) {
    console.error('Error updating admin status:', error);
    throw error;
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
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    // If already an admin, just return success
    if (existingAdmin) {
      return { success: true, message: 'User already has admin privileges' };
    }
    
    // If not an admin, add admin privileges
    const { error } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        email: email
      });
    
    if (error) throw error;
    
    return { success: true, message: `Admin privileges granted successfully to user ${userId}` };
  } catch (error: any) {
    console.error('Error setting specific user as admin:', error);
    throw error;
  }
}
