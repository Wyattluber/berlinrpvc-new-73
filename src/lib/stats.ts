
import { supabase } from '@/integrations/supabase/client';

export type ServerStats = {
  discordMembers: number;
  partnerServers: number;
  servers: number;
  lastUpdated?: string;
};

/**
 * Fetch the current server statistics from the database
 */
export async function fetchServerStats(): Promise<ServerStats> {
  try {
    // We need to use "from" method with the table name as string
    // rather than relying on TypeScript type inference
    const { data, error } = await supabase
      .from('server_stats')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) {
      console.error('Error fetching server stats:', error);
      return {
        discordMembers: 179,
        partnerServers: 2,
        servers: 1,
        lastUpdated: new Date().toISOString()
      };
    }
    
    return {
      discordMembers: data.discordMembers || 179,
      partnerServers: data.partnerServers || 2,
      servers: data.servers || 1,
      lastUpdated: data.lastUpdated || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching server stats:', error);
    return {
      discordMembers: 179,
      partnerServers: 2,
      servers: 1,
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Update the server statistics in the database
 */
export async function updateServerStats(stats: ServerStats): Promise<{ success: boolean; message: string }> {
  try {
    const updatedStats = {
      discordMembers: stats.discordMembers,
      partnerServers: stats.partnerServers,
      servers: stats.servers,
      lastUpdated: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('server_stats')
      .update(updatedStats)
      .eq('id', 1);
    
    if (error) {
      console.error('Error updating server stats:', error);
      return {
        success: false,
        message: error.message || 'Failed to update server statistics'
      };
    }
    
    return {
      success: true,
      message: 'Server statistics updated successfully'
    };
  } catch (error: any) {
    console.error('Error updating server stats:', error);
    return {
      success: false,
      message: error.message || 'An unknown error occurred'
    };
  }
}
