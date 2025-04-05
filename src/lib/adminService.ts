
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

/**
 * Get the team settings
 */
export async function getTeamSettings() {
  try {
    const { data, error } = await supabase
      .from('team_settings')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error fetching team settings:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching team settings:', error);
    throw error;
  }
}

/**
 * Update team settings
 */
export async function updateTeamSettings(settings: any) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    throw new Error('Keine Berechtigung');
  }

  try {
    // Check if we have existing settings
    const existingSettings = await getTeamSettings();
    
    if (existingSettings) {
      // Update existing settings
      const { error } = await supabase
        .from('team_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id);
      
      if (error) throw error;
    } else {
      // Create new settings
      const { error } = await supabase
        .from('team_settings')
        .insert([{
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
    }
    
    return { success: true, message: 'Einstellungen erfolgreich aktualisiert' };
  } catch (error: any) {
    console.error('Error updating team settings:', error);
    return { success: false, message: error.message || 'Fehler beim Aktualisieren der Einstellungen' };
  }
}

/**
 * Fetch all admin users
 */
export async function fetchAdminUsers() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    throw new Error('Keine Berechtigung');
  }

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
}

/**
 * Get cached user count
 */
export async function getCachedUserCount() {
  try {
    // This is a placeholder. In the actual implementation, you would fetch the count from a cache or database
    return 100; // Return a placeholder value for now
  } catch (error) {
    console.error('Error getting cached user count:', error);
    return 0;
  }
}

/**
 * Update admin user
 */
export async function updateAdminUser(userId: string, role: string) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    throw new Error('Keine Berechtigung');
  }

  try {
    const { error } = await supabase
      .from('admin_users')
      .update({ role })
      .eq('user_id', userId);

    if (error) throw error;
    
    return { success: true, message: 'Benutzer erfolgreich aktualisiert' };
  } catch (error: any) {
    console.error('Error updating admin user:', error);
    return { success: false, message: error.message || 'Fehler beim Aktualisieren des Benutzers' };
  }
}

/**
 * Delete admin user
 */
export async function deleteAdminUser(userId: string) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    throw new Error('Keine Berechtigung');
  }

  try {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    
    return { success: true, message: 'Benutzer erfolgreich gelöscht' };
  } catch (error: any) {
    console.error('Error deleting admin user:', error);
    return { success: false, message: error.message || 'Fehler beim Löschen des Benutzers' };
  }
}

/**
 * News Item Interface
 */
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * Fetch all news
 */
export async function fetchNews(): Promise<NewsItem[]> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching news:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}

/**
 * Add news item
 */
export async function addNewsItem(title: string, content: string) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    throw new Error('Keine Berechtigung');
  }

  try {
    const { data, error } = await supabase
      .from('news')
      .insert([{
        title,
        content,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    
    return { success: true, message: 'Neuigkeit erfolgreich hinzugefügt', data };
  } catch (error: any) {
    console.error('Error adding news item:', error);
    return { success: false, message: error.message || 'Fehler beim Hinzufügen der Neuigkeit' };
  }
}

/**
 * Update news item
 */
export async function updateNewsItem(id: string, title: string, content: string) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    throw new Error('Keine Berechtigung');
  }

  try {
    const { error } = await supabase
      .from('news')
      .update({
        title,
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    
    return { success: true, message: 'Neuigkeit erfolgreich aktualisiert' };
  } catch (error: any) {
    console.error('Error updating news item:', error);
    return { success: false, message: error.message || 'Fehler beim Aktualisieren der Neuigkeit' };
  }
}

/**
 * Delete news item
 */
export async function deleteNewsItem(id: string) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    throw new Error('Keine Berechtigung');
  }

  try {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return { success: true, message: 'Neuigkeit erfolgreich gelöscht' };
  } catch (error: any) {
    console.error('Error deleting news item:', error);
    return { success: false, message: error.message || 'Fehler beim Löschen der Neuigkeit' };
  }
}

/**
 * Create application season
 */
export async function createApplicationSeason(name: string) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    throw new Error('Keine Berechtigung');
  }

  try {
    // First, set all existing seasons to inactive
    const { error: updateError } = await supabase
      .from('application_seasons')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all rows
    
    if (updateError) throw updateError;
    
    // Then, create the new active season
    const { error: insertError } = await supabase
      .from('application_seasons')
      .insert([{
        name,
        is_active: true,
        created_at: new Date().toISOString()
      }]);
    
    if (insertError) throw insertError;
    
    return { success: true, message: 'Bewerbungssaison erfolgreich erstellt' };
  } catch (error: any) {
    console.error('Error creating application season:', error);
    return { success: false, message: error.message || 'Fehler beim Erstellen der Bewerbungssaison' };
  }
}

/**
 * Get application seasons
 */
export async function getApplicationSeasons() {
  try {
    const { data, error } = await supabase
      .from('application_seasons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching application seasons:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching application seasons:', error);
    return [];
  }
}
