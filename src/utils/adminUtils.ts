
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const createAdminAccount = async (email: string, password: string) => {
  try {
    // Step 1: Check if a user with this email already exists
    const { data: existingUsers, error: userCheckError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email);

    if (userCheckError) throw userCheckError;

    if (existingUsers && existingUsers.length > 0) {
      throw new Error("Ein Admin-Konto mit dieser E-Mail existiert bereits");
    }
    
    // Step 2: Register the user with email/password
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`
      }
    });

    if (authError) throw authError;
    
    if (!authData.user) {
      throw new Error("Benutzerregistrierung fehlgeschlagen");
    }
    
    // Step 3: Add the user to the admin_users table
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({ 
        user_id: authData.user.id,
        email: email 
      });

    if (adminError) throw adminError;

    return { success: true, user: authData.user };
  } catch (error: any) {
    console.error("Error creating admin account:", error);
    throw error;
  }
};

export const checkAdminAccount = async (email: string) => {
  try {
    // Get current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { exists: false, error: "Nicht eingeloggt" };
    }
    
    // Check if the user exists in admin_users table
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    return { exists: !!data && !error, data };
  } catch (error) {
    console.error("Error checking admin account:", error);
    return { exists: false, error };
  }
};

export const isUserAdmin = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }
    
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    return !!data && !error;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};
