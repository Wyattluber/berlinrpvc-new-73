
import { supabase } from '@/integrations/supabase/client';

/**
 * Get user profile information
 */
export async function getUserProfile(userId: string) {
  interface ProfileData {
    id: string;
    username: string;
    avatar_url: string;
    discord_id: string;
    roblox_id: string;
  }
  
  // Create a default profile object to ensure consistent return type
  const defaultProfile: ProfileData = { 
    id: userId, 
    username: '', 
    avatar_url: '', 
    discord_id: '', 
    roblox_id: '' 
  };
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    // If we have data, cast it as ProfileData and return it
    if (data) {
      return data as ProfileData;
    }
    
    // If no data is found, return the default profile
    return defaultProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Return the default profile on error
    return defaultProfile;
  }
}

/**
 * Find user by email or username
 */
export async function findUserByEmailOrUsername(query: string) {
  try {
    // First try to find by exact email match
    const { data: emailMatch, error: emailError } = await supabase
      .from('profiles')
      .select('id, username, email')
      .eq('email', query)
      .limit(5);
    
    if (emailError) throw emailError;
    
    // Then try to find by username containing the query
    const { data: usernameMatch, error: usernameError } = await supabase
      .from('profiles')
      .select('id, username, email')
      .ilike('username', `%${query}%`)
      .limit(5);
    
    if (usernameError) throw usernameError;
    
    // Combine results and remove duplicates
    const combined = [...(emailMatch || []), ...(usernameMatch || [])];
    const uniqueIds = new Set();
    const uniqueResults = combined.filter(user => {
      if (uniqueIds.has(user.id)) return false;
      uniqueIds.add(user.id);
      return true;
    });
    
    return {
      success: true,
      data: uniqueResults,
      message: `Found ${uniqueResults.length} users`
    };
  } catch (error: any) {
    console.error('Error finding user:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Error finding user'
    };
  }
}

/**
 * Add admin user role
 */
export async function addAdminUserRole(userId: string, role: 'admin' | 'moderator') {
  try {
    // Check if user already has a role
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('admin_users')
      .select('id, role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (roleCheckError) throw roleCheckError;
    
    let result;
    
    if (existingRole) {
      // Update existing role
      result = await supabase
        .from('admin_users')
        .update({ role })
        .eq('id', existingRole.id)
        .select()
        .single();
    } else {
      // Insert new role
      result = await supabase
        .from('admin_users')
        .insert([{ user_id: userId, role }])
        .select()
        .single();
    }
    
    if (result.error) throw result.error;
    
    return {
      success: true,
      data: result.data,
      message: existingRole ? 'User role updated successfully' : 'User role added successfully'
    };
  } catch (error: any) {
    console.error('Error adding user role:', error);
    return {
      success: false,
      message: error.message || 'Error adding user role'
    };
  }
}

/**
 * Fetch all admin users
 */
export async function fetchAdminUsers() {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select(`
        id,
        user_id,
        role,
        created_at,
        profiles:user_id (
          username, 
          email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Format the data to flatten the profiles object
    const formattedData = data ? data.map(user => ({
      id: user.user_id,
      role: user.role,
      username: user.profiles?.username || 'Unknown User',
      email: user.profiles?.email || 'No Email',
      created_at: user.created_at
    })) : [];
    
    return formattedData;
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
}

/**
 * Get cached user count
 */
// Cache for storing user count
let userCountCache: { count: number; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function getCachedUserCount(): Promise<number> {
  try {
    // Check if we have a valid cache
    const now = Date.now();
    if (userCountCache && (now - userCountCache.timestamp) < CACHE_TTL) {
      return userCountCache.count;
    }
    
    // If no valid cache, fetch from Supabase
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    
    // Update cache and return count
    userCountCache = { count: count || 0, timestamp: now };
    return count || 0;
  } catch (error) {
    console.error('Error getting user count:', error);
    return userCountCache?.count || 0; // Return cached count if available
  }
}

/**
 * Update admin user
 */
export async function updateAdminUser(userId: string, role: string) {
  try {
    // If role is 'member', remove the admin user entry
    if (role === 'member') {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return {
        success: true,
        message: 'User removed from admin users'
      };
    }
    
    // Otherwise update or insert the admin user entry
    const { data: existingUser, error: checkError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    let result;
    
    if (existingUser) {
      // Update existing user
      result = await supabase
        .from('admin_users')
        .update({ role })
        .eq('id', existingUser.id);
    } else {
      // Insert new user
      result = await supabase
        .from('admin_users')
        .insert([{ user_id: userId, role }]);
    }
    
    if (result.error) throw result.error;
    
    return {
      success: true,
      message: 'User role updated successfully'
    };
  } catch (error: any) {
    console.error('Error updating admin user:', error);
    return {
      success: false,
      message: error.message || 'Error updating user role'
    };
  }
}

/**
 * Delete admin user
 */
export async function deleteAdminUser(userId: string) {
  try {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return {
      success: true,
      message: 'Admin user deleted successfully'
    };
  } catch (error: any) {
    console.error('Error deleting admin user:', error);
    return {
      success: false,
      message: error.message || 'Error deleting admin user'
    };
  }
}

/**
 * Get user applications history
 */
export async function getUserApplicationsHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('id, status, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting user applications history:', error);
    return [];
  }
}

/**
 * Request ID change for user
 */
export async function requestIdChange(userId: string, fieldName: 'discord_id' | 'roblox_id', newValue: string) {
  try {
    const { data, error } = await supabase
      .from('id_change_requests')
      .insert([{
        user_id: userId,
        field_name: fieldName,
        new_value: newValue,
        status: 'pending'
      }])
      .select();
    
    if (error) throw error;
    
    return {
      success: true,
      data,
      message: 'ID change request submitted successfully'
    };
  } catch (error: any) {
    console.error('Error submitting ID change request:', error);
    return {
      success: false,
      message: error.message || 'Error submitting ID change request'
    };
  }
}

/**
 * Request account deletion for user
 */
export async function requestAccountDeletion(userId: string, reason: string) {
  try {
    const { data, error } = await supabase
      .from('account_deletion_requests')
      .insert([{
        user_id: userId,
        reason,
        status: 'pending'
      }])
      .select();
    
    if (error) throw error;
    
    return {
      success: true,
      data,
      message: 'Account deletion request submitted successfully'
    };
  } catch (error: any) {
    console.error('Error submitting account deletion request:', error);
    return {
      success: false,
      message: error.message || 'Error submitting account deletion request'
    };
  }
}
