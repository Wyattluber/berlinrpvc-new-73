import { supabase } from '@/integrations/supabase/client';

// Cache for user count to prevent too many requests
let userCountCache: { count: number; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute in milliseconds

/**
 * Fetch all admin users with profile information
 */
export async function fetchAdminUsers() {
  try {
    const { data: adminUsersData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (adminError) throw adminError;
    
    if (!adminUsersData || adminUsersData.length === 0) {
      return [];
    }
    
    // Get user IDs from admin_users
    const userIds = adminUsersData.map(admin => admin.user_id);
    
    // Get profiles for these users
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds);
    
    if (profilesError) throw profilesError;
    
    // Get auth users for these IDs (for email and other auth info)
    const { data: authUsersData, error: authError } = await supabase.functions.invoke('get_users_by_ids', {
      body: { user_ids: userIds }
    });
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      // Continue without auth data, just use the admin and profile data
    }
    
    // Combine all the data
    return adminUsersData.map(admin => {
      const profile = profilesData?.find(p => p.id === admin.user_id) || {};
      const authUser = authUsersData?.find((u: any) => u.id === admin.user_id) || {};
      
      return {
        id: admin.user_id,
        role: admin.role,
        created_at: admin.created_at,
        username: profile.username || 'Unknown User',
        avatar_url: profile.avatar_url,
        email: authUser.email || 'No email available'
      };
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
}

/**
 * Get cached user count
 */
export async function getCachedUserCount(): Promise<number> {
  const now = Date.now();
  
  // Return cached count if it's still valid
  if (userCountCache && (now - userCountCache.timestamp) < CACHE_TTL) {
    return userCountCache.count;
  }
  
  try {
    const count = await getTotalUserCount();
    userCountCache = { count, timestamp: now };
    return count;
  } catch (error) {
    console.error('Error getting cached user count:', error);
    return 0;
  }
}

/**
 * Get total user count (internal helper)
 */
async function getTotalUserCount(): Promise<number> {
  try {
    // Try to get count from RPC function if available
    try {
      // @ts-ignore
      const { data, error } = await supabase.rpc('get_auth_user_count');
      
      if (!error && typeof data === 'number') {
        return data;
      }
    } catch (e) {
      console.warn('RPC function not available, falling back to alternate method');
    }
    
    // Fallback: Count profiles as an approximation
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error('Error getting user count:', error);
    return 0;
  }
}

/**
 * Update admin user role
 */
export async function updateAdminUser(userId: string, role: string): Promise<{ success: boolean; message?: string }> {
  try {
    // Check if the current user is an admin
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return { success: false, message: 'Only admins can update user roles' };
    }
    
    // If removing admin role, check that user is not removing themselves
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.id === userId && role !== 'admin') {
      return { success: false, message: 'You cannot remove your own admin role' };
    }
    
    // Update the role
    const { error } = await supabase
      .from('admin_users')
      .update({ role })
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating admin user:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Delete admin user (remove all admin privileges)
 */
export async function deleteAdminUser(userId: string): Promise<{ success: boolean; message?: string }> {
  try {
    // Check if the current user is an admin
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return { success: false, message: 'Only admins can delete admin users' };
    }
    
    // Prevent deleting self
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.id === userId) {
      return { success: false, message: 'You cannot remove your own admin privileges' };
    }
    
    // Delete the admin user entry
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting admin user:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Find user by email or username
 */
export async function findUserByEmailOrUsername(query: string): Promise<{ success: boolean; data: any[]; message?: string }> {
  try {
    if (!query || query.trim().length < 3) {
      return { success: true, data: [] };
    }
    
    // Check if query looks like an email
    const isEmail = query.includes('@');
    
    if (isEmail) {
      // Search by email using edge function (admins only)
      const { data, error } = await supabase.functions.invoke('find_users_by_email', {
        body: { email_query: query }
      });
      
      if (error) {
        console.error('Error searching users by email:', error);
        return { success: false, data: [], message: error.message };
      }
      
      return { success: true, data: data || [] };
    } else {
      // Search by username in profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', `%${query}%`)
        .limit(10);
      
      if (error) {
        console.error('Error searching users by username:', error);
        return { success: false, data: [], message: error.message };
      }
      
      return { success: true, data: data || [] };
    }
  } catch (error: any) {
    console.error('Error finding user:', error);
    return { success: false, data: [], message: error.message };
  }
}

/**
 * Add admin user role to a user
 */
export async function addAdminUserRole(userId: string, role: 'admin' | 'moderator' = 'moderator'): Promise<{ success: boolean; message?: string }> {
  try {
    // Check if the current user is an admin
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return { success: false, message: 'Only admins can add admin users' };
    }
    
    // Check if user already has a role
    const { data: existing, error: existingError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existingError && existingError.code !== 'PGRST116') {
      throw existingError;
    }
    
    if (existing) {
      // User already has a role, update it if different
      if (existing.role !== role) {
        const { error } = await supabase
          .from('admin_users')
          .update({ role })
          .eq('user_id', userId);
        
        if (error) throw error;
      }
    } else {
      // User doesn't have a role yet, insert new
      const { error } = await supabase
        .from('admin_users')
        .insert([{ user_id: userId, role }]);
      
      if (error) throw error;
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error adding admin user role:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Get user information including applications history
 */
export async function getUserApplicationsHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user applications history:', error);
    return [];
  }
}

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
 * Check if the current user is an admin
 */
async function checkIsAdmin() {
  try {
    const { checkIsAdmin } = await import('@/lib/admin');
    return await checkIsAdmin();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Additional exported functions from this module
 */
export * from './users';
