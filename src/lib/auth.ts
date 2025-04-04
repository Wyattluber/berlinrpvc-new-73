
import { supabase } from '@/integrations/supabase/client';

/**
 * Log auth event for security monitoring
 */
export async function logAuthEvent(eventType: string, userId: string, metadata: any = {}) {
  try {
    // In a complete implementation, this would send the auth event to a logging system
    // or store it in a database table for audit purposes
    console.log('Auth event logged:', { eventType, userId, metadata, timestamp: new Date() });
    
    // Example implementation (uncomment when you have an auth_logs table)
    /*
    const { error } = await supabase
      .from('auth_logs')
      .insert([{
        user_id: userId,
        event_type: eventType,
        metadata: metadata,
        ip_address: metadata.ip || null,
        user_agent: metadata.userAgent || null,
        created_at: new Date().toISOString()
      }]);
      
    if (error) throw error;
    */
    
    return { success: true };
  } catch (error: any) {
    console.error('Error logging auth event:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to log auth event' 
    };
  }
}

/**
 * Setup auth event listeners to track logins and other auth events
 */
export function setupAuthEventListeners() {
  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_IN') {
        // Log sign in events
        if (session?.user) {
          logAuthEvent('SIGNED_IN', session.user.id, {
            ip: 'client-side',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          });
        }
      } else if (event === 'SIGNED_OUT') {
        // Log sign out events
        if (session?.user) {
          logAuthEvent('SIGNED_OUT', session.user.id, {
            ip: 'client-side',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  );
  
  // Return the unsubscribe function for cleanup
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Get recent auth logs for the user
 */
export async function getRecentAuthLogs(userId: string, limit = 10) {
  try {
    // Example implementation (uncomment when you have an auth_logs table)
    /*
    const { data, error } = await supabase
      .from('auth_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return data;
    */
    
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('Error fetching auth logs:', error);
    return [];
  }
}

// Setup auth event listeners on module load
setupAuthEventListeners();
