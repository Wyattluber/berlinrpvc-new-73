
import { supabase } from '@/integrations/supabase/client';

// Get user applications history
export const getUserApplicationsHistory = async (userId: string): Promise<any[]> => {
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
};

// Fetch all admin users
export const fetchAdminUsers = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
};

// Get cached user count
export const getCachedUserCount = async (): Promise<number> => {
  try {
    // This could fetch from a cached value or directly from the database
    // For simplicity, we'll use the function from the admin.ts file
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return 0;
    
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error('Error getting cached user count:', error);
    return 0;
  }
};

// Update admin user
export const updateAdminUser = async (userId: string, role: string): Promise<{ success: boolean; message?: string }> => {
  try {
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
};

// Delete admin user
export const deleteAdminUser = async (userId: string): Promise<{ success: boolean; message?: string }> => {
  try {
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
};

// Find user by email or username
export const findUserByEmailOrUsername = async (query: string): Promise<{ success: boolean; message?: string; data?: any[] }> => {
  try {
    // This is a simplified implementation - in a real app, you'd have a more robust search
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,email.ilike.%${query}%`);
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error finding user:', error);
    return { success: false, message: error.message };
  }
};

// Add admin user role
export const addAdminUserRole = async (userId: string, role: 'admin' | 'moderator'): Promise<{ success: boolean; message?: string }> => {
  try {
    const { error } = await supabase
      .from('admin_users')
      .insert([{ user_id: userId, role }]);
    
    if (error) throw error;
    
    return { success: true, message: `User added as ${role} successfully` };
  } catch (error: any) {
    console.error('Error adding admin role:', error);
    return { success: false, message: error.message };
  }
};
