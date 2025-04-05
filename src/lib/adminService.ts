
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

// Definition for NewsItem with additional fields
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  is_server_wide: boolean;
}

export const fetchNews = async (): Promise<NewsItem[]> => {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

export const addNewsItem = async (
  title: string, 
  content: string, 
  status: string = 'planned',
  isServerWide: boolean = false
): Promise<{ success: boolean; message?: string; data?: any }> => {
  try {
    const { data, error } = await supabase
      .from('news')
      .insert([
        { 
          title, 
          content, 
          status,
          is_server_wide: isServerWide
        }
      ])
      .select();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error adding news item:', error);
    return { success: false, message: error.message };
  }
};

export const updateNewsItem = async (
  id: string, 
  title: string, 
  content: string,
  status?: string,
  isServerWide?: boolean
): Promise<{ success: boolean; message?: string }> => {
  try {
    const updateData: any = { title, content };
    
    if (status !== undefined) {
      updateData.status = status;
    }
    
    if (isServerWide !== undefined) {
      updateData.is_server_wide = isServerWide;
    }
    
    const { error } = await supabase
      .from('news')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating news item:', error);
    return { success: false, message: error.message };
  }
};

export const deleteNewsItem = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting news item:', error);
    return { success: false, message: error.message };
  }
};

export const getTeamSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'team_meeting')
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is for "no rows returned"
      throw error;
    }
    
    if (!data) return null;

    try {
      return JSON.parse(data.value);
    } catch (parseError) {
      console.error('Error parsing team settings JSON:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Error fetching team settings:', error);
    return null;
  }
};

export const updateTeamSettings = async (settings: any): Promise<{ success: boolean; message?: string }> => {
  try {
    const settingsString = JSON.stringify(settings);
    
    // Check if settings already exist
    const { data: existingData, error: existingError } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'team_meeting')
      .single();
    
    if (existingError && existingError.code !== 'PGRST116') {
      throw existingError;
    }
    
    if (existingData) {
      // Update existing settings
      const { error } = await supabase
        .from('site_settings')
        .update({ value: settingsString, updated_at: new Date().toISOString() })
        .eq('id', existingData.id);
      
      if (error) throw error;
    } else {
      // Insert new settings
      const { error } = await supabase
        .from('site_settings')
        .insert([{ key: 'team_meeting', value: settingsString }]);
      
      if (error) throw error;
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating team settings:', error);
    return { success: false, message: error.message };
  }
};

// Team Absence Management
export const fetchTeamAbsences = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('team_absences')
      .select(`
        id, 
        user_id, 
        start_date, 
        end_date, 
        reason, 
        status, 
        created_at
      `)
      .order('end_date', { ascending: false });
    
    if (error) throw error;
    
    // Get profiles for usernames
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(absence => absence.user_id))];
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);
        
      if (profilesError) {
        console.error("Error fetching profiles for absences:", profilesError);
        throw profilesError;
      }

      // Merge absences with usernames
      return data.map(absence => {
        const profile = profiles?.find(p => p.id === absence.user_id);
        return {
          ...absence,
          username: profile?.username || 'Unknown User'
        };
      });
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching team absences:', error);
    return [];
  }
};

export const createTeamAbsence = async (
  userId: string,
  endDate: string,
  reason: string
): Promise<{ success: boolean; message?: string; data?: any }> => {
  try {
    const { data, error } = await supabase
      .from('team_absences')
      .insert([{
        user_id: userId,
        end_date: endDate,
        reason
      }])
      .select();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating team absence:', error);
    return { success: false, message: error.message };
  }
};

// Functions for managing applications - needed for ApplicationsList component
export const fetchApplications = async (limit = 20, status = ''): Promise<any[]> => {
  try {
    let query = supabase
      .from('applications')
      .select(`
        id,
        user_id,
        discord_id,
        roblox_id,
        roblox_username,
        age,
        status,
        created_at,
        notes
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
};

export const updateApplicationStatus = async (
  id: string,
  status: string,
  notes?: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const updateData: any = { status };
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    
    const { error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating application status:', error);
    return { success: false, message: error.message };
  }
};

// Functions needed for ApplicationSeasonManager component
export const getApplicationSeasons = async () => {
  try {
    const { data, error } = await supabase
      .from('application_seasons')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching application seasons:', error);
    return [];
  }
};

export const createApplicationSeason = async (name: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const { error } = await supabase
      .from('application_seasons')
      .insert([{ name }]);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error creating application season:', error);
    return { success: false, message: error.message };
  }
};

// Functions for UserRoleManager
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
