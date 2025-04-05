import { supabase } from '@/integrations/supabase/client';

/**
 * Check if the current user is an admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
      .maybeSingle();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Fetch all applications
 */
export async function fetchApplications() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    throw new Error('Keine Berechtigung');
  }

  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  applicationId: string, 
  status: 'approved' | 'rejected' | 'waitlist' | 'deleted', 
  notes: string | null = null
) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    throw new Error('Keine Berechtigung');
  }

  try {
    // Update the application status
    const { error: updateError } = await supabase
      .from('applications')
      .update({ 
        status, 
        notes,
        updated_at: new Date().toISOString() 
      })
      .eq('id', applicationId);
    
    if (updateError) throw updateError;

    // If approved, give the user a moderator role
    if (status === 'approved') {
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select('user_id')
        .eq('id', applicationId)
        .single();
      
      if (appError) throw appError;
      
      if (appData && appData.user_id) {
        // Check if the user already has an admin role
        const { data: existingRole } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', appData.user_id)
          .maybeSingle();
        
        // If not, add them as a moderator
        if (!existingRole) {
          const { error: roleError } = await supabase
            .from('admin_users')
            .insert([{
              user_id: appData.user_id,
              role: 'moderator'
            }]);
          
          if (roleError) throw roleError;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
}

/**
 * Fetch all account deletion requests
 */
export async function fetchAccountDeletionRequests() {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
        throw new Error('Keine Berechtigung');
    }

    try {
        const { data, error } = await supabase
            .from('account_deletion_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching account deletion requests:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching account deletion requests:', error);
        throw error;
    }
}

/**
 * Update account deletion request status
 */
export async function updateAccountDeletionRequestStatus(
    requestId: string,
    status: 'pending' | 'approved' | 'rejected',
    notes: string | null = null
) {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
        throw new Error('Keine Berechtigung');
    }

    try {
        // Update the account deletion request status
        const { error: updateError } = await supabase
            .from('account_deletion_requests')
            .update({
                status,
                processed_at: new Date().toISOString()
            })
            .eq('id', requestId);

        if (updateError) throw updateError;

        return true;
    } catch (error) {
        console.error('Error updating account deletion request status:', error);
        throw error;
    }
}
