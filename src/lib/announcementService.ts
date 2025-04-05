
import { supabase } from '@/integrations/supabase/client';
import { checkIsAdmin, checkIsModerator } from '@/lib/admin';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled' | 'announcement';
  is_server_wide: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface AnnouncementComment {
  id: string;
  announcement_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all announcements
 */
export async function fetchAnnouncements(): Promise<Announcement[]> {
  try {
    // @ts-ignore - The Supabase TypeScript types don't automatically include tables added via SQL migrations
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
}

/**
 * Fetch a single announcement by ID
 */
export async function fetchAnnouncementById(id: string): Promise<Announcement | null> {
  try {
    // @ts-ignore - The Supabase TypeScript types don't automatically include tables added via SQL migrations
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching announcement:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching announcement:', error);
    throw error;
  }
}

/**
 * Add an announcement
 */
export async function addAnnouncement(
  title: string, 
  content: string, 
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled' | 'announcement' = 'planned',
  isServerWide: boolean = false
) {
  const isModOrAdmin = await checkIsModerator();
  if (!isModOrAdmin) {
    throw new Error('Keine Berechtigung');
  }

  try {
    const now = new Date().toISOString();
    // @ts-ignore - The Supabase TypeScript types don't automatically include tables added via SQL migrations
    const { data, error } = await supabase
      .from('announcements')
      .insert([{
        title,
        content,
        status,
        is_server_wide: isServerWide,
        created_at: now,
        updated_at: now,
        published_at: isServerWide ? now : null
      }])
      .select();

    if (error) throw error;
    
    return { success: true, message: 'Ankündigung erfolgreich hinzugefügt', data };
  } catch (error: any) {
    console.error('Error adding announcement:', error);
    return { success: false, message: error.message || 'Fehler beim Hinzufügen der Ankündigung' };
  }
}

/**
 * Update an announcement
 */
export async function updateAnnouncement(
  id: string, 
  title: string, 
  content: string, 
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled' | 'announcement',
  isServerWide: boolean = false
) {
  const isModOrAdmin = await checkIsModerator();
  if (!isModOrAdmin) {
    throw new Error('Keine Berechtigung');
  }

  try {
    const updateData: any = {
      title,
      content,
      status,
      is_server_wide: isServerWide,
    };
    
    // If we're making it server-wide for the first time, set published_at
    if (isServerWide) {
      // @ts-ignore - The Supabase TypeScript types don't automatically include tables added via SQL migrations
      const { data: existingAnnouncement } = await supabase
        .from('announcements')
        .select('is_server_wide, published_at')
        .eq('id', id)
        .maybeSingle();
        
      if (existingAnnouncement && !existingAnnouncement.is_server_wide) {
        updateData.published_at = new Date().toISOString();
      } else if (existingAnnouncement && !existingAnnouncement.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }

    // @ts-ignore - The Supabase TypeScript types don't automatically include tables added via SQL migrations
    const { error } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    
    return { success: true, message: 'Ankündigung erfolgreich aktualisiert' };
  } catch (error: any) {
    console.error('Error updating announcement:', error);
    return { success: false, message: error.message || 'Fehler beim Aktualisieren der Ankündigung' };
  }
}

/**
 * Delete an announcement
 */
export async function deleteAnnouncement(id: string) {
  const isModOrAdmin = await checkIsModerator();
  if (!isModOrAdmin) {
    throw new Error('Keine Berechtigung');
  }

  try {
    // @ts-ignore - The Supabase TypeScript types don't automatically include tables added via SQL migrations
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return { success: true, message: 'Ankündigung erfolgreich gelöscht' };
  } catch (error: any) {
    console.error('Error deleting announcement:', error);
    return { success: false, message: error.message || 'Fehler beim Löschen der Ankündigung' };
  }
}

/**
 * Mark an announcement as read by the current user
 */
export async function markAnnouncementAsRead(announcementId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if the read entry already exists
    // @ts-ignore - The Supabase TypeScript types don't automatically include tables added via SQL migrations
    const { data: existingEntry } = await supabase
      .from('announcement_reads')
      .select('id')
      .eq('announcement_id', announcementId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingEntry) {
      // Already marked as read
      return { success: true };
    }

    // Create a new read entry
    // @ts-ignore - The Supabase TypeScript types don't automatically include tables added via SQL migrations
    const { error } = await supabase
      .from('announcement_reads')
      .insert({
        announcement_id: announcementId,
        user_id: user.id
      });

    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error marking announcement as read:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Check if an announcement has been read by the current user
 */
export async function checkAnnouncementRead(announcementId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return false;
    }

    // @ts-ignore - The Supabase TypeScript types don't automatically include tables added via SQL migrations
    const { data, error } = await supabase
      .from('announcement_reads')
      .select('id')
      .eq('announcement_id', announcementId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error checking announcement read status:', error);
    return false;
  }
}

/**
 * Get unread server-wide announcements for the current user
 */
export async function getUnreadServerWideAnnouncements(): Promise<Announcement[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    // First, get all server-wide announcements
    // @ts-ignore - The Supabase TypeScript types don't automatically include tables added via SQL migrations
    const { data: announcements, error: announcementsError } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_server_wide', true)
      .order('created_at', { ascending: false });

    if (announcementsError) throw announcementsError;
    
    if (!announcements || announcements.length === 0) {
      return [];
    }

    // Then, get all read announcements for the user
    // @ts-ignore - The Supabase TypeScript types don't automatically include tables added via SQL migrations
    const { data: reads, error: readsError } = await supabase
      .from('announcement_reads')
      .select('announcement_id')
      .eq('user_id', user.id)
      .in('announcement_id', announcements.map(a => a.id));

    if (readsError) throw readsError;
    
    const readIds = new Set((reads || []).map(r => r.announcement_id));
    
    // Filter out read announcements
    return announcements.filter(a => !readIds.has(a.id));
  } catch (error) {
    console.error('Error getting unread server-wide announcements:', error);
    return [];
  }
}

/**
 * Add a comment to an announcement
 */
export async function addComment(announcementId: string, content: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // @ts-ignore - The Supabase TypeScript types don't automatically include tables added via SQL migrations
    const { data, error } = await supabase
      .from('announcement_comments')
      .insert({
        announcement_id: announcementId,
        user_id: user.id,
        content
      })
      .select();

    if (error) throw error;
    
    return { success: true, data: data[0] };
  } catch (error: any) {
    console.error('Error adding comment:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Get comments for an announcement
 */
export async function getComments(announcementId: string): Promise<AnnouncementComment[]> {
  try {
    // @ts-ignore - The Supabase TypeScript types don't automatically include tables added via SQL migrations
    const { data, error } = await supabase
      .from('announcement_comments')
      .select('*')
      .eq('announcement_id', announcementId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
}

/**
 * Manually trigger the email sending function
 */
export async function triggerAnnouncementEmails() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    throw new Error('Keine Berechtigung');
  }

  try {
    const { data, error } = await supabase.functions.invoke('send-announcement-emails');
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error triggering announcement emails:', error);
    return { success: false, message: error.message || 'Fehler beim Senden der E-Mails' };
  }
}
