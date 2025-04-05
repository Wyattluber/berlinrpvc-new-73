
import { supabase } from '@/integrations/supabase/client';

// Define proper types for Announcement status
export type AnnouncementStatus = "planned" | "in-progress" | "completed" | "cancelled" | "announcement";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  status: AnnouncementStatus;
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

export const getAllAnnouncements = async (): Promise<Announcement[]> => {
  try {
    // We need to use 'from' with a plain string since the table might not be in the generated types yet
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Cast the data to ensure it has the correct type
    return (data || []) as Announcement[];
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
};

export const getAnnouncementById = async (id: string): Promise<Announcement | null> => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    // Cast the data to ensure it has the correct type
    return data as Announcement;
  } catch (error) {
    console.error(`Error fetching announcement with ID ${id}:`, error);
    return null;
  }
};

export const createAnnouncement = async (
  title: string,
  content: string,
  status: AnnouncementStatus,
  isServerWide: boolean
): Promise<Announcement | null> => {
  try {
    const publishedAt = status === 'announcement' ? new Date().toISOString() : null;
    
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        status,
        is_server_wide: isServerWide,
        published_at: publishedAt
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Announcement;
  } catch (error) {
    console.error('Error creating announcement:', error);
    return null;
  }
};

export const updateAnnouncement = async (
  id: string,
  updates: Partial<Announcement>
): Promise<Announcement | null> => {
  try {
    // If status is changed to 'announcement', set published_at if not already set
    if (updates.status === 'announcement') {
      const { data: existingData } = await supabase
        .from('announcements')
        .select('published_at')
        .eq('id', id)
        .single();

      if (!existingData?.published_at) {
        updates.published_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Announcement;
  } catch (error) {
    console.error(`Error updating announcement with ID ${id}:`, error);
    return null;
  }
};

export const deleteAnnouncement = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting announcement with ID ${id}:`, error);
    return false;
  }
};

export const getServerWideAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_server_wide', true)
      .eq('status', 'announcement')
      .not('published_at', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as Announcement[];
  } catch (error) {
    console.error('Error fetching server-wide announcements:', error);
    return [];
  }
};

export const getUnreadServerWideAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    // Step 1: Get all server-wide announcements
    const { data: announcements, error: announcementsError } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_server_wide', true)
      .eq('status', 'announcement')
      .not('published_at', 'is', null)
      .order('created_at', { ascending: false });

    if (announcementsError) {
      throw announcementsError;
    }

    if (!announcements || announcements.length === 0) {
      return [];
    }

    // Step 2: Get all announcements that the user has already read
    const { data: readAnnouncements, error: readError } = await supabase
      .from('announcement_reads')
      .select('announcement_id')
      .eq('user_id', user.id);

    if (readError) {
      throw readError;
    }

    // Step 3: Filter out the read announcements
    const readAnnouncementIds = new Set((readAnnouncements || []).map(row => row.announcement_id));
    const unreadAnnouncements = announcements.filter(announcement => !readAnnouncementIds.has(announcement.id));

    return unreadAnnouncements as Announcement[];
  } catch (error) {
    console.error('Error fetching unread server-wide announcements:', error);
    return [];
  }
};

export const markAnnouncementAsRead = async (announcementId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('announcement_reads')
      .insert({
        announcement_id: announcementId,
        user_id: user.id
      });

    if (error) {
      // If the error is because of a unique constraint (already read), that's okay
      if (error.code !== '23505') { // PostgreSQL unique violation code
        throw error;
      }
    }

    return true;
  } catch (error) {
    console.error(`Error marking announcement ${announcementId} as read:`, error);
    return false;
  }
};

export const getAnnouncementComments = async (announcementId: string): Promise<AnnouncementComment[]> => {
  try {
    const { data, error } = await supabase
      .from('announcement_comments')
      .select('*')
      .eq('announcement_id', announcementId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data as AnnouncementComment[];
  } catch (error) {
    console.error(`Error fetching comments for announcement ${announcementId}:`, error);
    return [];
  }
};

export const addAnnouncementComment = async (
  announcementId: string,
  content: string
): Promise<AnnouncementComment | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('announcement_comments')
      .insert({
        announcement_id: announcementId,
        user_id: user.id,
        content
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as AnnouncementComment;
  } catch (error) {
    console.error(`Error adding comment to announcement ${announcementId}:`, error);
    return null;
  }
};
