
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
