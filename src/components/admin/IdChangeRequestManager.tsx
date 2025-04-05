
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Check, X, UserCog, Loader2 } from 'lucide-react';
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
  DialogTrigger,
} from "@/components/ui/dialog";

interface IdChangeRequest {
  id: string;
  user_id: string;
  field_name: string;
  new_value: string;
  status: string;
  created_at: string;
  username?: string;
  current_value?: string;
}

export const IdChangeRequestManager = () => {
  const [requests, setRequests] = useState<IdChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<IdChangeRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      
      // Get all pending ID change requests
      const { data, error } = await supabase
        .from('id_change_requests')
        .select(`
          id,
          user_id,
          field_name,
          new_value,
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
      
      // Get usernames for all users in the requests
      const userIds = [...new Set(data.map(request => request.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, discord_id, roblox_id')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Merge the data
      const enrichedRequests = data.map(request => {
        const userProfile = profiles?.find(profile => profile.id === request.user_id);
        const currentValue = userProfile ? 
          (request.field_name === 'discord_id' ? userProfile.discord_id : userProfile.roblox_id) : 
          null;
          
        return {
          ...request,
          username: userProfile?.username || 'Unbekannter Benutzer',
          current_value: currentValue || 'Nicht gesetzt'
        };
      });
      
      setRequests(enrichedRequests);
    } catch (error) {
      console.error('Error fetching ID change requests:', error);
      toast({
        title: 'Fehler',
        description: 'Die Änderungsanträge konnten nicht geladen werden.',
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
        .from('id_change_requests')
        .update({ 
          status: approved ? 'approved' : 'rejected',
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId);
      
      if (updateError) throw updateError;
      
      // If approved, update the user's profile
      if (approved) {
        setIsApproving(true);
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            [selectedRequest.field_name]: selectedRequest.new_value,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedRequest.user_id);
        
        if (profileError) throw profileError;
      }
      
      toast({
        title: approved ? 'Antrag genehmigt' : 'Antrag abgelehnt',
        description: `Der Änderungsantrag wurde erfolgreich ${approved ? 'genehmigt' : 'abgelehnt'}.`,
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
      setIsApproving(false);
    }
  };

  const getFieldNameDisplay = (fieldName: string) => {
    switch (fieldName) {
      case 'discord_id':
        return 'Discord ID';
      case 'roblox_id':
        return 'Roblox ID';
      default:
        return fieldName;
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserCog className="h-5 w-5 mr-2" />
          ID-Änderungsanträge
        </CardTitle>
        <CardDescription>
          Verwalte Anfragen zur Änderung von Discord- und Roblox-IDs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Keine offenen Änderungsanträge vorhanden.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Feld</TableHead>
                  <TableHead>Aktueller Wert</TableHead>
                  <TableHead>Neuer Wert</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.username}</TableCell>
                    <TableCell>{getFieldNameDisplay(request.field_name)}</TableCell>
                    <TableCell>{request.current_value}</TableCell>
                    <TableCell>{request.new_value}</TableCell>
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
                  <DialogTitle>
                    Änderungsantrag bearbeiten
                  </DialogTitle>
                  <DialogDescription>
                    {isApproving ? 
                      'Möchtest du diesen Änderungsantrag genehmigen?' : 
                      'Möchtest du diesen Änderungsantrag ablehnen?'}
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
                        <p className="text-sm font-medium">Feld</p>
                        <p className="text-sm">{getFieldNameDisplay(selectedRequest.field_name)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Aktueller Wert</p>
                        <p className="text-sm">{selectedRequest.current_value}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Neuer Wert</p>
                        <p className="text-sm">{selectedRequest.new_value}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {isApproving ? 
                        'Wenn du diesen Antrag genehmigst, wird der neue Wert für den Benutzer gespeichert.' : 
                        'Wenn du diesen Antrag ablehnst, wird keine Änderung vorgenommen.'}
                    </div>
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
                    variant={isApproving ? "default" : "destructive"}
                    onClick={() => handleRequestAction(selectedRequest?.id || '', isApproving)}
                    disabled={isProcessing}
                  >
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isApproving ? 'Genehmigen' : 'Ablehnen'}
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

export default IdChangeRequestManager;
