
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
    
    // Then add the user to the admin_users table - fixing type instantiation error
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

// New function to make an existing user an admin
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
