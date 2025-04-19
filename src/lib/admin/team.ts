
import { supabase } from '@/integrations/supabase/client';

export const getTeamMembers = async () => {
  const { data, error } = await supabase
    .from('admin_users')
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching team members: ${error.message}`);
  }

  return data || [];
};

// Function to create the application_texts table if it doesn't exist
export const createApplicationTextsTable = async () => {
  // Use RPC to create the table using a database function
  const { error } = await supabase.rpc('create_application_texts_table');
  
  if (error) {
    console.error('Error creating application_texts table:', error);
    throw error;
  }
  
  return { success: true };
};

// Create a stored procedure in Supabase
export const setupApplicationTextsStoredProcedure = async () => {
  const { error } = await supabase.rpc('setup_application_texts_function');
  
  if (error) {
    console.error('Error setting up function:', error);
    throw error;
  }
  
  return { success: true };
};

// Add getTeamSettings function
export const getTeamSettings = async () => {
  const { data, error } = await supabase
    .from('team_settings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching team settings:', error);
    throw new Error(`Error fetching team settings: ${error.message}`);
  }

  return data;
};

// Add updateTeamSettings function
export const updateTeamSettings = async (settings: {
  meeting_day: string;
  meeting_time: string;
  meeting_notes: string;
  meeting_location?: string;
  meeting_frequency?: string;
}) => {
  try {
    // Check if settings already exist
    const { data: existingSettings, error: fetchError } = await supabase
      .from('team_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    let result;
    
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('team_settings')
        .update({
          meeting_day: settings.meeting_day,
          meeting_time: settings.meeting_time,
          meeting_notes: settings.meeting_notes,
          meeting_location: settings.meeting_location || 'Discord',
          meeting_frequency: settings.meeting_frequency || 'Wöchentlich',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id)
        .select();

      if (error) throw error;
      result = data;
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('team_settings')
        .insert({
          meeting_day: settings.meeting_day,
          meeting_time: settings.meeting_time,
          meeting_notes: settings.meeting_notes,
          meeting_location: settings.meeting_location || 'Discord',
          meeting_frequency: settings.meeting_frequency || 'Wöchentlich'
        })
        .select();

      if (error) throw error;
      result = data;
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error updating team settings:', error);
    return { success: false, message: error.message || 'Error updating team settings' };
  }
};

// Add submitTeamAbsence function
export const submitTeamAbsence = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  reason: string
) => {
  try {
    const { data, error } = await supabase
      .from('team_absences')
      .insert({
        user_id: userId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        reason,
        status: 'pending'
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error submitting team absence:', error);
    return { 
      success: false, 
      message: error.message || 'Fehler beim Einreichen der Abwesenheit' 
    };
  }
};

// Add fetchTeamAbsences function
export const fetchTeamAbsences = async () => {
  try {
    const { data, error } = await supabase
      .from('team_absences')
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching team absences:', error);
      throw new Error(`Error fetching team absences: ${error.message}`);
    }

    // Format the data to include the username directly
    const formattedAbsences = data?.map(absence => ({
      ...absence,
      username: absence.profiles?.username || 'Unbekannter Benutzer'
    }));

    return formattedAbsences || [];
  } catch (error) {
    console.error('Error in fetchTeamAbsences:', error);
    return [];
  }
};

// Get user's team absences
export const getUserTeamAbsences = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('team_absences')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching user team absences:', error);
      throw new Error(`Error fetching user team absences: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserTeamAbsences:', error);
    return [];
  }
};
