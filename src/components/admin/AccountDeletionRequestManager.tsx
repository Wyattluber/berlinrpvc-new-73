
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, Check, X, Loader2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AccountDeletionRequest {
  id: string;
  user_id: string;
  reason: string;
  status: string;
  created_at: string;
  username?: string;
  email?: string;
}

interface AuthUser {
  id: string;
  email: string;
}

export const AccountDeletionRequestManager = () => {
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

  useEffect(() => {
    fetchRequests();
  }, []);

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

  return (
    <Card className="border-red-100">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
          Kontolöschungsanträge
        </CardTitle>
        <CardDescription>
          Verwalte Anfragen zur Löschung von Benutzerkonten
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Keine offenen Kontolöschungsanträge vorhanden.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Grund</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.username}</TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>
                      {request.reason.length > 40 
                        ? `${request.reason.substring(0, 40)}...` 
                        : request.reason}
                    </TableCell>
                    <TableCell>{formatDate(request.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsApproving(true);
                            setDialogOpen(true);
                          }}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="sr-only">Genehmigen</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsApproving(false);
                            setDialogOpen(true);
                          }}
                        >
                          <X className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Ablehnen</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    {isApproving ? (
                      <>
                        <Shield className="h-5 w-5 mr-2 text-red-500" />
                        Kontolöschung bestätigen
                      </>
                    ) : (
                      'Kontolöschungsantrag ablehnen'
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    {isApproving ? (
                      'ACHTUNG: Dies ist eine irreversible Aktion, die Benutzerdaten werden unwiderruflich anonymisiert.'
                    ) : (
                      'Möchtest du diesen Kontolöschungsantrag ablehnen?'
                    )}
                  </DialogDescription>
                </DialogHeader>
                
                {selectedRequest && (
                  <div className="py-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">Benutzer</p>
                        <p className="text-sm">{selectedRequest.username}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">E-Mail</p>
                        <p className="text-sm">{selectedRequest.email}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Begründung</p>
                      <p className="text-sm mt-1 p-2 border rounded bg-gray-50">{selectedRequest.reason}</p>
                    </div>
                    
                    {isApproving && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                        <p className="font-semibold">Achtung:</p>
                        <p>
                          Bei Genehmigung werden die Benutzerdaten anonymisiert, der Benutzer wird als "[Gelöschter Benutzer]" 
                          markiert, und alle persönlichen Informationen werden entfernt. Diese Aktion kann nicht rückgängig 
                          gemacht werden.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    disabled={isProcessing}
                  >
                    Abbrechen
                  </Button>
                  <Button 
                    variant={isApproving ? "destructive" : "default"}
                    onClick={() => handleRequestAction(selectedRequest?.id || '', isApproving)}
                    disabled={isProcessing}
                  >
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isApproving ? 'Konto löschen' : 'Antrag ablehnen'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountDeletionRequestManager;
