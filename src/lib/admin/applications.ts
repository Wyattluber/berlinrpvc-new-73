
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
