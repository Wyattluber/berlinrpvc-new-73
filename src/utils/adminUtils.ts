
import { supabase } from '@/integrations/supabase/client';

export async function isUserAdmin() {
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

export async function createAdminAccount(email: string, password: string) {
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
      .insert([{ 
        user_id: authData.user.id,
        email: email
      }]);
    
    if (error) throw error;
    
    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Error creating admin account:', error);
    throw error;
  }
}

export async function checkAdminAccount(email: string) {
  try {
    // Check if the email exists in the admin_users table
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error checking admin account:', error);
    throw error;
  }
}

// Function to make an existing user an admin
export async function makeUserAdmin(userId: string, email: string) {
  try {
    const { error } = await supabase
      .from('admin_users')
      .insert([{ 
        user_id: userId,
        email: email
      }]);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error making user admin:', error);
    throw error;
  }
}

// New function to force update admin status for an existing account
export async function forceUpdateAdminStatus(email: string) {
  try {
    // First check if user exists
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) throw userError;
    
    const existingUser = userData.users.find(u => u.email === email);
    
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
      .insert([{
        user_id: existingUser.id,
        email: email
      }]);
    
    if (error) throw error;
    
    return { success: true, message: 'Admin privileges granted successfully' };
  } catch (error) {
    console.error('Error updating admin status:', error);
    throw error;
  }
}
