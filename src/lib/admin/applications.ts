
import { supabase } from '@/integrations/supabase/client';

export const getApplicationById = async (id: string) => {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error fetching application: ${error.message}`);
  }

  return data;
};

export const updateApplicationStatus = async (id: string, status: string, feedback?: string) => {
  const { data, error } = await supabase
    .from('applications')
    .update({ 
      status,
      feedback: feedback || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Error updating application status: ${error.message}`);
  }

  return { success: true, data };
};

export const deleteApplication = async (id: string) => {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting application: ${error.message}`);
  }

  return { success: true };
};

export const getApplications = async (filter?: string) => {
  let query = supabase
    .from('applications')
    .select('*, profiles(*)');
  
  if (filter && filter !== 'all') {
    query = query.eq('status', filter);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching applications: ${error.message}`);
  }

  return data || [];
};

// Alias for getApplications to make it consistent with component naming
export const fetchApplications = getApplications;

// Add createApplicationSeason function
export const createApplicationSeason = async (name: string) => {
  try {
    // First, set all existing seasons to inactive
    await supabase
      .from('application_seasons')
      .update({ is_active: false })
      .eq('is_active', true);

    // Create the new season
    const { data, error } = await supabase
      .from('application_seasons')
      .insert({
        name,
        is_active: true
      })
      .select();

    if (error) throw error;

    return { 
      success: true, 
      data,
      message: `Bewerbungssaison "${name}" wurde erfolgreich erstellt.`
    };
  } catch (error: any) {
    console.error('Error creating application season:', error);
    return { 
      success: false, 
      message: error.message || 'Fehler beim Erstellen der Bewerbungssaison.'
    };
  }
};

// Add getApplicationSeasons function
export const getApplicationSeasons = async () => {
  const { data, error } = await supabase
    .from('application_seasons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching application seasons:', error);
    throw new Error(`Error fetching application seasons: ${error.message}`);
  }

  return data || [];
};
