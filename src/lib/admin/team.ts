
import { supabase } from '@/integrations/supabase/client';

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
