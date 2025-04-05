
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AccountDeletionRequest, AuthUser } from './types';

export const useAccountDeletionRequests = () => {
  const [requests, setRequests] = useState<AccountDeletionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AccountDeletionRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      
      // Get all pending account deletion requests
      const { data, error } = await supabase
        .from('account_deletion_requests')
        .select(`
          id,
          user_id,
          reason,
          status,
          created_at
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        setRequests([]);
        return;
      }
      
      // Get usernames and emails for all users in the requests
      const userIds = [...new Set(data.map(request => request.user_id))];
      
      // Get profiles for usernames
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Get auth users for emails (admin only function)
      const { data: authUsersData, error: authError } = await supabase.functions.invoke<AuthUser[]>('get_users_by_ids', {
        body: { user_ids: userIds }
      });
      
      let authUsers: AuthUser[] = [];
      
      if (authError) {
        console.error('Error fetching user auth data:', authError);
        // Continue without email data
      } else {
        authUsers = authUsersData || [];
      }
      
      // Merge the data
      const enrichedRequests = data.map(request => {
        const userProfile = profiles?.find(profile => profile.id === request.user_id);
        const authUser = authUsers.find(user => user.id === request.user_id);
        
        return {
          ...request,
          username: userProfile?.username || 'Unbekannter Benutzer',
          email: authUser?.email || 'Keine E-Mail verfügbar'
        };
      });
      
      setRequests(enrichedRequests);
    } catch (error) {
      console.error('Error fetching account deletion requests:', error);
      toast({
        title: 'Fehler',
        description: 'Die Kontolöschungsanträge konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, approved: boolean) => {
    setIsProcessing(true);
    
    try {
      if (!selectedRequest) return;
      
      // Update the request status
      const { error: updateError } = await supabase
        .from('account_deletion_requests')
        .update({ 
          status: approved ? 'approved' : 'rejected',
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId);
      
      if (updateError) throw updateError;
      
      // If approved, delete or anonymize the user data
      if (approved) {
        // This requires admin-level functions to fully delete a user
        // For this example, we'll just mark their profile as deleted
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            deleted_at: new Date().toISOString(),
            username: '[Gelöschter Benutzer]',
            discord_id: null,
            roblox_id: null,
            avatar_url: null
          })
          .eq('id', selectedRequest.user_id);
        
        if (profileError) throw profileError;
        
        // In a real implementation, you would use admin APIs to fully delete the user
        // Or trigger a serverless function to handle this securely
      }
      
      toast({
        title: approved ? 'Antrag genehmigt' : 'Antrag abgelehnt',
        description: `Der Kontolöschungsantrag wurde erfolgreich ${approved ? 'genehmigt' : 'abgelehnt'}.`,
      });
      
      // Refresh the requests list
      await fetchRequests();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: 'Fehler',
        description: 'Der Antrag konnte nicht bearbeitet werden.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return {
    requests,
    isLoading,
    isProcessing,
    selectedRequest,
    setSelectedRequest,
    dialogOpen,
    setDialogOpen,
    isApproving,
    setIsApproving,
    handleRequestAction,
    formatDate,
    fetchRequests
  };
};
