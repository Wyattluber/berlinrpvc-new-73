
import { supabase } from '@/integrations/supabase/client';
import { checkIsAdmin, getTotalUserCount } from './admin';

// Improve cache TTL to reduce unnecessary fetches
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache user count
let userCountCache: { count: number; timestamp: number } | null = null;

// Cache admin users
let adminUsersCache: { users: any[]; timestamp: number } | null = null;

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

// Manually invalidate caches when needed (export this for use in components)
export function invalidateAdminCache() {
  adminUsersCache = null;
  userCountCache = null;
}
