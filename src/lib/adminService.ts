import { supabase } from '@/integrations/supabase/client';

export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return false;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      return false;
    }

    return data?.role === 'admin';
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

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      return false;
    }

    return data?.role === 'admin' || data?.role === 'moderator';
  } catch (error) {
    console.error("Error checking moderator status:", error);
    return false;
  }
};

export const fetchAdminUsers = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, role')
      .in('role', ['admin', 'moderator']);

    if (error) {
      console.error("Error fetching admin users:", error);
      throw error;
    }

    return data || [];
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
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error("Error updating user role:", error);
      return { success: false, message: error.message };
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
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error("Error deleting user:", error);
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
  status?: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  is_server_wide?: boolean;
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
