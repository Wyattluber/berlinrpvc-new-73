
import { supabase } from '@/integrations/supabase/client';

export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return false;
    }

    // Check admin_users table instead of the role column in profiles
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .single();

    if (error) {
      console.error("Error fetching admin status:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

export const checkIsModerator = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return false;
    }

    // First check if user is an admin (admins have moderator privileges)
    const isAdmin = await checkIsAdmin();
    if (isAdmin) return true;

    // Then check for moderator role
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('role', 'moderator')
      .single();

    if (error) {
      console.error("Error fetching moderator status:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking moderator status:", error);
    return false;
  }
};
