
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'moderator';

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
      .eq('role', 'admin')
      .single();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return !!adminUser; // Returns true if the user was found in the admin_users table as an admin
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Check if the current user has moderator privileges
 */
export async function checkIsModerator() {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return false;
    
    const userId = session.user.id;
    
    // Query the admin_users table to check if the current user is a moderator or admin
    // Admins implicitly have moderator privileges
    const { data: roleUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .in('role', ['moderator', 'admin'])
      .single();
    
    if (error) {
      console.error('Error checking moderator status:', error);
      return false;
    }
    
    return !!roleUser;
  } catch (error) {
    console.error('Error checking moderator status:', error);
    return false;
  }
}

/**
 * Get the current user's role if they have any special privileges
 */
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return null;
    
    const userId = session.user.id;
    
    const { data: roleUser, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (error || !roleUser) {
      return null;
    }
    
    return roleUser.role as UserRole;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Add a user with a specific role
 */
export async function addUserWithRole(userId: string, role: UserRole = 'moderator') {
  try {
    // Check if we're adding an admin - this operation requires admin privileges
    if (role === 'admin') {
      const isAdmin = await checkIsAdmin();
      if (!isAdmin) {
        return {
          success: false,
          message: 'Only existing admins can add new admins'
        };
      }
    }
    
    const { data, error } = await supabase
      .from('admin_users')
      .insert({ user_id: userId, role })
      .select()
      .single();
    
    if (error) {
      console.error(`Error adding ${role}:`, error);
      return {
        success: false,
        message: error.message
      };
    }
    
    return {
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} privileges granted successfully`,
      data
    };
  } catch (error: any) {
    console.error(`Error adding ${role}:`, error);
    return {
      success: false,
      message: error.message || 'An unknown error occurred'
    };
  }
}

/**
 * Add a user as an admin
 */
export async function addAdmin(userId: string) {
  return addUserWithRole(userId, 'admin');
}

/**
 * Add a user as a moderator
 */
export async function addModerator(userId: string) {
  return addUserWithRole(userId, 'moderator');
}

/**
 * Remove user role
 */
export async function removeUserRole(userId: string) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return {
        success: false,
        message: 'Only admins can remove user roles'
      };
    }
    
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error removing role:', error);
      return {
        success: false,
        message: error.message
      };
    }
    
    return {
      success: true,
      message: 'Role removed successfully'
    };
  } catch (error: any) {
    console.error('Error removing role:', error);
    return {
      success: false,
      message: error.message || 'An unknown error occurred'
    };
  }
}
