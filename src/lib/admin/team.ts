
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
        created_at,
        profiles:user_id (username)
      `)
      .order('end_date', { ascending: false });
    
    if (error) throw error;
    
    // Fix: Transform data to include username from the joined profiles table
    const transformedData = data ? data.map(absence => {
      // Handle the profiles object correctly - each absence has its own profiles object
      let username = 'Unknown User';
      if (absence.profiles && typeof absence.profiles === 'object') {
        // Fix: Access the username property properly
        username = (absence.profiles as any).username || 'Unknown User';
      }
      return {
        ...absence,
        username
      };
    }) : [];
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching team absences:', error);
    return [];
  }
};

export const submitTeamAbsence = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  reason: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    // Format dates correctly for the database
    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();
    
    const { data, error } = await supabase
      .from('team_absences')
      .insert([{
        user_id: userId,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
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

export const createTeamAbsence = async (
  userId: string,
  startDate: string,
  endDate: string,
  reason: string
): Promise<{ success: boolean; message?: string; data?: any }> => {
  try {
    const { data, error } = await supabase
      .from('team_absences')
      .insert([{
        user_id: userId,
        start_date: startDate,
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
