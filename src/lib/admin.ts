
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
    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return !!data; // Returns true if the user was found in the admin_users table as an admin
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
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, role')
      .eq('user_id', userId)
      .in('role', ['moderator', 'admin'])
      .maybeSingle();
    
    if (error) {
      console.error('Error checking moderator status:', error);
      return false;
    }
    
    return !!data;
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
    
    const { data, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error || !data) {
      return null;
    }
    
    return data.role as UserRole;
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

// Define the TeamSettings interface
export interface TeamSettings {
  id?: string;
  meeting_day: string;
  meeting_time: string;
  meeting_frequency: string;
  meeting_location: string;
  meeting_notes: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get team settings
 */
export async function getTeamSettings(): Promise<TeamSettings | null> {
  try {
    // Using a different approach to handle the type issues
    const { data, error } = await supabase
      .from('team_settings')
      .select('*')
      .maybeSingle();
      
    if (error) {
      console.error('Error getting team settings:', error);
      return null;
    }
    
    // If no data is returned, return null
    if (!data) return null;
    
    // Create a proper TeamSettings object from the returned data
    const teamSettings: TeamSettings = {
      id: data.id,
      meeting_day: data.meeting_day || '',
      meeting_time: data.meeting_time || '',
      meeting_frequency: data.meeting_frequency || '',
      meeting_location: data.meeting_location || '',
      meeting_notes: data.meeting_notes || '',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    return teamSettings;
  } catch (error) {
    console.error('Error getting team settings:', error);
    return null;
  }
}

/**
 * Update team settings
 */
export async function updateTeamSettings(settings: {
  meeting_day?: string;
  meeting_time?: string;
  meeting_frequency?: string;
  meeting_location?: string;
  meeting_notes?: string;
}) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return {
        success: false,
        message: 'Only admins can update team settings'
      };
    }

    // Check if settings already exist
    const existingSettings = await getTeamSettings();
    let result;
    
    if (existingSettings && existingSettings.id) {
      // Update existing settings
      result = await supabase
        .from('team_settings' as any)
        .update({
          meeting_day: settings.meeting_day,
          meeting_time: settings.meeting_time,
          meeting_frequency: settings.meeting_frequency,
          meeting_location: settings.meeting_location,
          meeting_notes: settings.meeting_notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id);
    } else {
      // Insert new settings
      result = await supabase
        .from('team_settings' as any)
        .insert({
          meeting_day: settings.meeting_day,
          meeting_time: settings.meeting_time,
          meeting_frequency: settings.meeting_frequency,
          meeting_location: settings.meeting_location,
          meeting_notes: settings.meeting_notes
        });
    }
    
    if (result.error) {
      throw result.error;
    }
    
    return {
      success: true,
      message: 'Team settings updated successfully'
    };
  } catch (error: any) {
    console.error('Error updating team settings:', error);
    return {
      success: false,
      message: error.message || 'An unknown error occurred'
    };
  }
}

/**
 * Has user submitted an application
 */
export async function hasSubmittedApplication(userId: string) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking application status:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking application status:', error);
    return false;
  }
}

/**
 * Get count of all users in the Supabase auth system
 */
export async function getTotalUserCount(): Promise<number> {
  try {
    // First try to get the count from the RPC function
    // Check if the RPC function exists by doing a safe call
    try {
      const { data, error } = await supabase.rpc('get_auth_user_count');
      
      if (!error && data !== null && typeof data === 'number') {
        return data;
      }
    } catch (rpcError) {
      console.warn('RPC get_auth_user_count not available:', rpcError);
      // Continue to fallback method
    }
    
    // Fallback: Use the admin_users table as a proxy
    console.warn('Falling back to admin_users count');
    const { count: fallbackCount, error: fallbackError } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true });
    
    if (fallbackError) {
      console.error('Error getting admin_users count:', fallbackError);
      return 0;
    }
    
    return fallbackCount || 0;
  } catch (error) {
    console.error('Error getting user count:', error);
    return 0;
  }
}
