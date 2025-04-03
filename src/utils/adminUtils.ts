
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const createAdminAccount = async (email: string, password: string) => {
  try {
    // Step 1: Register the user with email/password
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`
      }
    });

    if (authError) throw authError;
    
    if (!authData.user) {
      throw new Error("User registration failed");
    }
    
    // Step 2: Add the user to the admin_users table
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({ user_id: authData.user.id });

    if (adminError) throw adminError;

    return { success: true, user: authData.user };
  } catch (error: any) {
    console.error("Error creating admin account:", error);
    throw error;
  }
};

export const checkAdminAccount = async (email: string) => {
  try {
    // Check if the user exists in auth
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
      .single();
      
    return { exists: !!data && !error, data };
  } catch (error) {
    console.error("Error checking admin account:", error);
    return { exists: false, error };
  }
};
