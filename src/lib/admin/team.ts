import { supabase } from '@/integrations/supabase/client';

export const getTeamSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'team_meeting')
      .single();
    
    if (error && error.code !== 'PGRST116') {
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
    
    const { data: existingData, error: existingError } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'team_meeting')
      .single();
    
    if (existingError && existingError.code !== 'PGRST116') {
      throw existingError;
    }
    
    if (existingData) {
      const { error } = await supabase
        .from('site_settings')
        .update({ value: settingsString, updated_at: new Date().toISOString() })
        .eq('id', existingData.id);
      
      if (error) throw error;
    } else {
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

export const submitTeamAbsence = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  reason: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const { data, error } = await supabase
      .from('team_absences')
      .insert([{
        user_id: userId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        reason
      }])
      .select();
    
    if (error) throw error;
    
    return { success: true, message: "Abwesenheit erfolgreich eingereicht" };
  } catch (error: any) {
    console.error('Error submitting team absence:', error);
    return { success: false, message: error.message };
  }
};
