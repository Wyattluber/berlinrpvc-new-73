
import { supabase } from '@/integrations/supabase/client';

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
