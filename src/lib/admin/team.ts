
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
