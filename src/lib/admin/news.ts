
import { supabase } from '@/integrations/supabase/client';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  is_server_wide: boolean;
}

/**
 * Fetch news items with pagination
 */
export async function fetchNews(page = 1, limit = 10) {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error, count } = await supabase
      .from('news')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    
    return {
      data: data || [],
      count: count || 0,
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    return { data: [], count: 0 };
  }
}

/**
 * Create a new news item - alias for createNews to maintain backward compatibility
 */
export async function addNewsItem(title: string, content: string, status: string = 'planned') {
  return createNews({
    title,
    content,
    status,
    is_server_wide: false // Default to false to disable email sending
  });
}

/**
 * Create a new news item
 */
export async function createNews(newsData: Partial<NewsItem>) {
  try {
    // Ensure is_server_wide is always false to disable email sending
    const safeNewsData = {
      ...newsData,
      is_server_wide: false
    };
    
    const { data, error } = await supabase
      .from('news')
      .insert([safeNewsData])
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating news:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Update an existing news item - alias for updateNews to maintain backward compatibility
 */
export async function updateNewsItem(id: string, title: string, content: string, status: string) {
  return updateNews(id, {
    title,
    content,
    status,
    is_server_wide: false // Always set to false to disable email sending
  });
}

/**
 * Update an existing news item
 */
export async function updateNews(id: string, newsData: Partial<NewsItem>) {
  try {
    // Ensure is_server_wide is always false to disable email sending
    const safeNewsData = {
      ...newsData,
      is_server_wide: false
    };
    
    const { data, error } = await supabase
      .from('news')
      .update(safeNewsData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating news:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Delete a news item - alias for deleteNews to maintain backward compatibility
 */
export async function deleteNewsItem(id: string) {
  return deleteNews(id);
}

/**
 * Delete a news item
 */
export async function deleteNews(id: string) {
  try {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting news:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Publish a news item
 */
export async function publishNews(id: string) {
  try {
    const { data, error } = await supabase
      .from('news')
      .update({ status: 'published' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error publishing news:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Archive a news item
 */
export async function archiveNews(id: string) {
  try {
    const { data, error } = await supabase
      .from('news')
      .update({ status: 'archived' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error archiving news:', error);
    return { success: false, message: error.message };
  }
}
