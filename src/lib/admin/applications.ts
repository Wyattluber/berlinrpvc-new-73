
import { supabase } from '@/integrations/supabase/client';

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
