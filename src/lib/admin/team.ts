
import { supabase } from '@/integrations/supabase/client';

export const getUserTeamAbsences = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('team_absences')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user team absences:', error);
    return [];
  }
};

export const fetchTeamAbsences = async () => {
  try {
    // Join with profiles table to get usernames
    const { data: absencesWithProfiles, error } = await supabase
      .from('team_absences')
      .select(`
        *,
        profiles:user_id (username)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Format the data to include username directly in the absence object
    const formattedAbsences = absencesWithProfiles.map(absence => ({
      ...absence,
      username: absence.profiles?.username || 'Unknown User'
    }));
    
    return formattedAbsences;
  } catch (error) {
    console.error('Error fetching team absences:', error);
    throw error;
  }
};

export const getTeamSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('team_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching team settings:', error);
    return null;
  }
};

export const submitTeamAbsence = async (
  userId: string,
  startDate: string,
  endDate: string,
  reason: string
) => {
  try {
    const { data, error } = await supabase
      .from('team_absences')
      .insert({
        user_id: userId,
        start_date: startDate,
        end_date: endDate,
        reason,
        status: 'pending'
      })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error submitting team absence:', error);
    throw error;
  }
};

export const updateTeamAbsence = async (id: string, status: string) => {
  try {
    const { error } = await supabase
      .from('team_absences')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating team absence:', error);
    throw error;
  }
};

export const updateTeamSettings = async (settings: any) => {
  try {
    const { data: existingData, error: fetchError } = await supabase
      .from('team_settings')
      .select('id')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    let result;
    if (existingData) {
      // Update existing settings
      const { data, error } = await supabase
        .from('team_settings')
        .update(settings)
        .eq('id', existingData.id)
        .select();
      
      if (error) throw error;
      result = data;
    } else {
      // Insert new settings
      const { data, error } = await supabase
        .from('team_settings')
        .insert(settings)
        .select();
      
      if (error) throw error;
      result = data;
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('Error updating team settings:', error);
    throw error;
  }
};
