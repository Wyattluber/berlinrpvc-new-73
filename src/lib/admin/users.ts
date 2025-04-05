
import { supabase } from '@/integrations/supabase/client';

export const fetchAdminUsers = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id, role, id');

    if (error) {
      console.error("Error fetching admin users:", error);
      throw error;
    }

    // Get profiles for additional user information
    if (data && data.length > 0) {
      const userIds = data.map(user => user.user_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Merge admin_users with profiles
      return data.map(adminUser => {
        const profile = profiles?.find(p => p.id === adminUser.user_id);
        return {
          id: adminUser.user_id,
          username: profile?.username || 'Unknown User',
          role: adminUser.role
        };
      });
    }

    return [];
  } catch (error) {
    console.error("Error in fetchAdminUsers:", error);
    return [];
  }
};

export const getCachedUserCount = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' });

    if (error) {
      console.error("Error fetching user count:", error);
      throw error;
    }

    return data?.length || 0;
  } catch (error) {
    console.error("Error in getCachedUserCount:", error);
    return 0;
  }
};

export const updateAdminUser = async (userId: string, role: string): Promise<{ success: boolean; message?: string }> => {
  try {
    // First check if user already exists in admin_users
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingUser) {
      // Update existing admin user role
      const { error } = await supabase
        .from('admin_users')
        .update({ role })
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      // Insert new admin user
      const { error } = await supabase
        .from('admin_users')
        .insert({ user_id: userId, role });

      if (error) throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateAdminUser:", error);
    return { success: false, message: error.message };
  }
};

export const deleteAdminUser = async (userId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error("Error deleting admin user:", error);
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteAdminUser:", error);
    return { success: false, message: error.message };
  }
};

export const findUserByEmailOrUsername = async (query: string): Promise<any> => {
  try {
    // First try to find by username in profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, username')
      .or(`username.ilike.%${query}%`);
    
    if (profileError) throw profileError;
    
    if (profileData && profileData.length > 0) {
      return profileData;
    }

    // If no results from profiles, we need to check auth.users table via edge function
    // This requires an admin function call
    const { data: authUsersData, error: authError } = await supabase.functions.invoke('find_users_by_email', {
      body: { email_query: query }
    });
    
    if (authError) throw authError;
    
    return authUsersData || [];
  } catch (error) {
    console.error('Error finding users:', error);
    return [];
  }
};

export const addAdminUserRole = async (userId: string, role: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const { error } = await supabase
      .from('admin_users')
      .insert([{ user_id: userId, role }]);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error adding admin user role:', error);
    return { success: false, message: error.message };
  }
};
