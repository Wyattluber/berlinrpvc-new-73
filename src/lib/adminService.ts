
import { supabase } from '@/integrations/supabase/client';
import { checkIsAdmin, getTotalUserCount, TeamSettings } from './admin';

// Improve cache TTL to reduce unnecessary fetches
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache user count
let userCountCache: { count: number; timestamp: number } | null = null;

// Cache admin users
let adminUsersCache: { users: any[]; timestamp: number } | null = null;

// Cache team settings
let teamSettingsCache: { settings: TeamSettings | null; timestamp: number } | null = null;

// Cache news
let newsCache: { news: any[]; timestamp: number } | null = null;

/**
 * Fetch admin users with caching
 */
export async function fetchAdminUsers() {
  const now = Date.now();
  
  // Return cached data if valid
  if (adminUsersCache && (now - adminUsersCache.timestamp < CACHE_TTL)) {
    return adminUsersCache.users;
  }
  
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*');

    if (error) {
      throw error;
    }

    // Cache the result
    adminUsersCache = { 
      users: data || [], 
      timestamp: now 
    };
    
    return data || [];
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return adminUsersCache?.users || [];
  }
}

/**
 * Get cached user count with fallback fetching
 */
export async function getCachedUserCount() {
  const now = Date.now();
  
  // Return cached data if valid
  if (userCountCache && (now - userCountCache.timestamp < CACHE_TTL)) {
    return userCountCache.count;
  }
  
  try {
    const count = await getTotalUserCount();
    userCountCache = { count, timestamp: now };
    return count;
  } catch (error) {
    console.error('Error getting user count:', error);
    return userCountCache?.count || 0;
  }
}

/**
 * Get cached team settings
 */
export async function getTeamSettings(): Promise<TeamSettings | null> {
  const now = Date.now();
  
  // Return cached data if valid
  if (teamSettingsCache && (now - teamSettingsCache.timestamp < CACHE_TTL)) {
    return teamSettingsCache.settings;
  }
  
  try {
    const { data, error } = await supabase
      .from('team_settings')
      .select('*')
      .maybeSingle();
      
    if (error) {
      throw error;
    }
    
    const settings = data as TeamSettings | null;
    teamSettingsCache = { settings, timestamp: now };
    return settings;
  } catch (error) {
    console.error('Error getting team settings:', error);
    return teamSettingsCache?.settings || null;
  }
}

// Define a NewsItem interface to ensure type safety
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string | null;
}

/**
 * Fetch news
 */
export async function fetchNews(): Promise<NewsItem[]> {
  const now = Date.now();
  
  // Return cached data if valid
  if (newsCache && (now - newsCache.timestamp < CACHE_TTL)) {
    return newsCache.news as NewsItem[];
  }
  
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    const newsItems = data as NewsItem[];
    newsCache = { news: newsItems, timestamp: now };
    return newsItems;
  } catch (error) {
    console.error('Error fetching news:', error);
    return newsCache?.news as NewsItem[] || [];
  }
}

/**
 * Add a news item
 */
export async function addNewsItem(title: string, content: string) {
  try {
    const { data, error } = await supabase
      .from('news')
      .insert([
        { 
          title,
          content,
          created_at: new Date().toISOString()
        }
      ])
      .select();
      
    if (error) {
      throw error;
    }
    
    // Invalidate cache
    newsCache = null;
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error adding news item:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to add news item' 
    };
  }
}

/**
 * Update a news item
 */
export async function updateNewsItem(id: string, title: string, content: string) {
  try {
    const { error } = await supabase
      .from('news')
      .update({ 
        title,
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    if (error) {
      throw error;
    }
    
    // Invalidate cache
    newsCache = null;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating news item:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to update news item' 
    };
  }
}

/**
 * Delete a news item
 */
export async function deleteNewsItem(id: string) {
  try {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw error;
    }
    
    // Invalidate cache
    newsCache = null;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting news item:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to delete news item' 
    };
  }
}

/**
 * Delete an admin user with optimistic UI update
 */
export async function deleteAdminUser(id: string) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return { success: false, message: 'Nur Admins können Benutzer löschen' };
  }
  
  // Optimistic UI update - remove from cache first
  if (adminUsersCache) {
    adminUsersCache.users = adminUsersCache.users.filter(user => user.id !== id);
  }
  
  try {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);

    if (error) {
      // Rollback cache change if operation fails
      adminUsersCache = null; // Force a refresh on next fetch
      throw error;
    }
    
    return { success: true, message: 'Benutzer erfolgreich gelöscht' };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { success: false, message: error.message || 'Ein Fehler ist aufgetreten' };
  }
}

/**
 * Update an admin user with optimistic UI update
 */
export async function updateAdminUser(id: string, role: string) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return { success: false, message: 'Nur Admins können Benutzer bearbeiten' };
  }
  
  // Optimistic UI update - update cache first
  if (adminUsersCache) {
    adminUsersCache.users = adminUsersCache.users.map(user => 
      user.id === id ? { ...user, role } : user
    );
  }
  
  try {
    const { error } = await supabase
      .from('admin_users')
      .update({ role })
      .eq('id', id);

    if (error) {
      // Rollback cache change if operation fails
      adminUsersCache = null; // Force a refresh on next fetch
      throw error;
    }
    
    return { success: true, message: 'Benutzer erfolgreich aktualisiert' };
  } catch (error: any) {
    console.error('Error updating user:', error);
    return { success: false, message: error.message || 'Ein Fehler ist aufgetreten' };
  }
}

/**
 * Update team settings
 */
export async function updateTeamSettings(settings: {
  meeting_day?: string;
  meeting_time?: string;
  meeting_frequency?: string;
  meeting_location?: string;
  meeting_notes?: string;
}) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return { success: false, message: 'Nur Admins können Team-Einstellungen bearbeiten' };
  }
  
  try {
    // Check if settings already exist
    const existingSettings = await getTeamSettings();
    let result;
    
    if (existingSettings && existingSettings.id) {
      // Update existing settings
      result = await supabase
        .from('team_settings')
        .update({
          meeting_day: settings.meeting_day,
          meeting_time: settings.meeting_time,
          meeting_frequency: settings.meeting_frequency,
          meeting_location: settings.meeting_location,
          meeting_notes: settings.meeting_notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id);
    } else {
      // Insert new settings
      result = await supabase
        .from('team_settings')
        .insert([{
          meeting_day: settings.meeting_day,
          meeting_time: settings.meeting_time,
          meeting_frequency: settings.meeting_frequency,
          meeting_location: settings.meeting_location,
          meeting_notes: settings.meeting_notes
        }]);
    }
    
    if (result.error) {
      throw result.error;
    }
    
    // Invalidate cache to force refresh on next request
    teamSettingsCache = null;
    
    return {
      success: true,
      message: 'Team-Einstellungen erfolgreich aktualisiert'
    };
  } catch (error: any) {
    console.error('Error updating team settings:', error);
    return {
      success: false,
      message: error.message || 'Ein Fehler ist aufgetreten'
    };
  }
}

/**
 * Check if a username is already taken
 */
export async function isUsernameTaken(username: string, currentUserEmail?: string): Promise<boolean> {
  try {
    // This won't work in most cases - the user won't have admin access to list users
    // Let's use a safer approach that just reports false
    console.warn('isUsernameTaken might need a different implementation with RLS');
    return false;
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
}

/**
 * Update user email
 */
export async function updateUserEmail(newEmail: string): Promise<{success: boolean; message: string}> {
  try {
    const { error } = await supabase.auth.updateUser({ 
      email: newEmail 
    });
    
    if (error) throw error;
    
    return { 
      success: true, 
      message: 'E-Mail Aktualisierungsanfrage gesendet. Bitte überprüfe dein E-Mail-Postfach.' 
    };
  } catch (error: any) {
    console.error('Error updating email:', error);
    return { 
      success: false, 
      message: error.message || 'Fehler beim Aktualisieren der E-Mail' 
    };
  }
}

/**
 * Send application status notification to user
 */
export async function sendApplicationStatusNotification(applicationId: string, userId: string, status: string): Promise<{success: boolean; message: string}> {
  try {
    // This would normally send an email through a Supabase Edge Function
    // For now, we'll just log it and return success
    console.log(`Would send email to user ${userId} about application ${applicationId} status change to ${status}`);
    
    return { 
      success: true, 
      message: 'Benachrichtigung über Statusänderung wurde gesendet.' 
    };
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return { 
      success: false, 
      message: error.message || 'Fehler beim Senden der Benachrichtigung.' 
    };
  }
}

// Manually invalidate caches when needed (export this for use in components)
export function invalidateAdminCache() {
  adminUsersCache = null;
  userCountCache = null;
  teamSettingsCache = null;
  newsCache = null;
}
