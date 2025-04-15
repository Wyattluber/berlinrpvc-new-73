
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Loader2, CheckCircle, XCircle, ExternalLink, Edit, Trash, Calendar } from 'lucide-react';
import { format, addMonths, isPast } from 'date-fns';
import { de } from 'date-fns/locale';

const PartnershipRequestsManager = () => {
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [partnerServers, setPartnerServers] = useState([]);

  useEffect(() => {
    loadPartnershipRequests();
  }, []);

  const loadPartnershipRequests = async () => {
    setLoading(true);
    try {
      // Load all partnership requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('partner_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Process requests - check expiration dates
      const processedRequests = requestsData.map(request => {
        const createdDate = new Date(request.created_at);
        const expirationDate = addMonths(createdDate, 1);
        const isExpired = isPast(expirationDate);
        
        return {
          ...request,
          expirationDate,
          isExpired,
          // If it's expired, it's not active
          is_active: request.is_active && !isExpired
        };
      });

      // Group requests by status
      const pending = processedRequests.filter(req => req.status === 'pending');
      const approved = processedRequests.filter(req => req.status === 'approved');
      const rejected = processedRequests.filter(req => req.status === 'rejected');

      setPendingRequests(pending);
      setApprovedRequests(approved);
      setRejectedRequests(rejected);

      // Load partner servers data
      const { data: serversData, error: serversError } = await supabase
        .from('partner_servers')
        .select('*');

      if (serversError) throw serversError;
      setPartnerServers(serversData);

    } catch (error) {
      console.error('Error loading partnership requests:', error);
      toast({
        title: 'Fehler',
        description: 'Partnerschaftsanfragen konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (request) => {
    try {
      // Update the request status
      const { error: updateError } = await supabase
        .from('partner_applications')
        .update({ 
          status: 'approved',
          is_active: true 
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // Create a partner server entry if it doesn't exist
      const { data: existingServer, error: checkError } = await supabase
        .from('partner_servers')
        .select('id')
        .eq('partner_application_id', request.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (!existingServer) {
        // Extract a basic name from the discord invite
        const serverName = `Partner Server (${request.discord_invite})`;
        
        const { error: insertError } = await supabase
          .from('partner_servers')
          .insert([{
            name: serverName,
            description: request.reason.substring(0, 100) + (request.reason.length > 100 ? '...' : ''),
            website: `https://discord.gg/${request.discord_invite}`,
            type: 'partner',
            partner_application_id: request.id,
            is_active: true
          }]);

        if (insertError) throw insertError;
      }

      toast({
        title: 'Partnerschaft genehmigt',
        description: 'Die Partnerschaftsanfrage wurde erfolgreich genehmigt.',
      });

      // Refresh the requests
      loadPartnershipRequests();
    } catch (error) {
      console.error('Error approving partnership request:', error);
      toast({
        title: 'Fehler',
        description: 'Die Partnerschaftsanfrage konnte nicht genehmigt werden.',
        variant: 'destructive',
      });
    }
  };

  const handleRejectRequest = async (request) => {
    try {
      const { error } = await supabase
        .from('partner_applications')
        .update({ 
          status: 'rejected',
          is_active: false 
        })
        .eq('id', request.id);

      if (error) throw error;

      toast({
        title: 'Partnerschaft abgelehnt',
        description: 'Die Partnerschaftsanfrage wurde abgelehnt.',
      });

      // Refresh the requests
      loadPartnershipRequests();
    } catch (error) {
      console.error('Error rejecting partnership request:', error);
      toast({
        title: 'Fehler',
        description: 'Die Partnerschaftsanfrage konnte nicht abgelehnt werden.',
        variant: 'destructive',
      });
    }
  };

  const handleEndPartnership = async (request) => {
    try {
      // Update the partner application to inactive
      const { error: appError } = await supabase
        .from('partner_applications')
        .update({ is_active: false })
        .eq('id', request.id);

      if (appError) throw appError;

      // Update the partner server to inactive
      const { error: serverError } = await supabase
        .from('partner_servers')
        .update({ is_active: false })
        .eq('partner_application_id', request.id);

      if (serverError) throw serverError;

      toast({
        title: 'Partnerschaft beendet',
        description: 'Die Partnerschaft wurde erfolgreich beendet.',
      });

      // Refresh the requests
      loadPartnershipRequests();
    } catch (error) {
      console.error('Error ending partnership:', error);
      toast({
        title: 'Fehler',
        description: 'Die Partnerschaft konnte nicht beendet werden.',
        variant: 'destructive',
      });
    }
  };

  const renderRequestsList = (requests) => {
    if (requests.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">Keine Anfragen vorhanden</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {requests.map(request => {
          const partnerServer = partnerServers.find(
            server => server.partner_application_id === request.id
          );
          
          const createdDate = new Date(request.created_at);
          const expirationDate = addMonths(createdDate, 1);
          const isExpired = request.isExpired;
          const isActive = request.status === 'approved' && request.is_active && !isExpired;
          
          return (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Discord: {request.discord_id}
                    </CardTitle>
                    <CardDescription>
                      Eingereicht am {format(createdDate, 'PPP', { locale: de })}
                      {request.status === 'approved' && (
                        <span className="block mt-1">
                          Gültig bis: {format(expirationDate, 'PPP', { locale: de })}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    {request.status === 'approved' && (
                      <Badge className={isActive ? "bg-green-500" : "bg-gray-500"}>
                        {isActive ? 'Aktiv' : isExpired ? 'Abgelaufen' : 'Inaktiv'}
                      </Badge>
                    )}
                    <Badge className={
                      request.status === 'approved' ? "ml-2 bg-green-500" : 
                      request.status === 'rejected' ? "ml-2 bg-red-500" : 
                      "ml-2 bg-yellow-500"
                    }>
                      {request.status === 'approved' ? 'Genehmigt' : 
                       request.status === 'rejected' ? 'Abgelehnt' : 
                       'Ausstehend'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Discord Einladung</h4>
                    <div className="flex items-center">
                      <p className="text-sm text-blue-500">
                        <a 
                          href={`https://discord.gg/${request.discord_invite}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center"
                        >
                          discord.gg/{request.discord_invite}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </p>
                    </div>
                  </div>
                  {request.has_other_partners && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Andere Partnerschaften</h4>
                      <p className="text-sm">{request.other_partners || "Ja"}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                      Details anzeigen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    {selectedRequest && (
                      <>
                        <DialogHeader>
                          <DialogTitle>Partnerschaftsanfrage Details</DialogTitle>
                          <DialogDescription>
                            Eingereicht am {format(new Date(selectedRequest.created_at), 'PPP', { locale: de })}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label className="text-gray-500">Discord ID</Label>
                            <p className="mt-1">{selectedRequest.discord_id}</p>
                          </div>
                          <div>
                            <Label className="text-gray-500">Discord Einladung</Label>
                            <p className="mt-1">
                              <a 
                                href={`https://discord.gg/${selectedRequest.discord_invite}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline flex items-center"
                              >
                                discord.gg/{selectedRequest.discord_invite}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </p>
                          </div>
                        </div>
                        
                        {selectedRequest.status === 'approved' && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                            <div className="flex items-center">
                              <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                              <div>
                                <p className="font-medium text-blue-800">Gültigkeitszeitraum</p>
                                <p className="text-sm text-blue-600">
                                  {selectedRequest.isExpired ? 
                                    `Die Partnerschaft ist am ${format(selectedRequest.expirationDate, 'PPP', { locale: de })} abgelaufen.` :
                                    `Die Partnerschaft ist gültig bis: ${format(selectedRequest.expirationDate, 'PPP', { locale: de })}`
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4">
                          <Label className="text-gray-500">Grund für die Partnerschaft</Label>
                          <div className="p-3 bg-gray-50 rounded-md mt-1">
                            <p className="whitespace-pre-line">{selectedRequest.reason}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <Label className="text-gray-500">Anforderungen an die Partnerschaft</Label>
                          <div className="p-3 bg-gray-50 rounded-md mt-1">
                            <p className="whitespace-pre-line">{selectedRequest.requirements}</p>
                          </div>
                        </div>
                        
                        {selectedRequest.has_other_partners && selectedRequest.other_partners && (
                          <div className="mt-4">
                            <Label className="text-gray-500">Andere Partnerschaften</Label>
                            <div className="p-3 bg-gray-50 rounded-md mt-1">
                              <p className="whitespace-pre-line">{selectedRequest.other_partners}</p>
                            </div>
                          </div>
                        )}
                        
                        <DialogFooter className="mt-6">
                          {selectedRequest.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                onClick={() => handleRejectRequest(selectedRequest)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Ablehnen
                              </Button>
                              <Button 
                                onClick={() => handleApproveRequest(selectedRequest)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Genehmigen
                              </Button>
                            </>
                          )}
                          
                          {selectedRequest.status === 'approved' && !selectedRequest.isExpired && selectedRequest.is_active && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                  Partnerschaft beenden
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Partnerschaft beenden</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bist du sicher, dass du diese Partnerschaft beenden möchtest? 
                                    Diese Aktion kann nicht rückgängig gemacht werden.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleEndPartnership(selectedRequest)}
                                  >
                                    Beenden
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
                
                {request.status === 'pending' && (
                  <div className="space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRejectRequest(request)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Ablehnen
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleApproveRequest(request)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Genehmigen
                    </Button>
                  </div>
                )}
                
                {request.status === 'approved' && !isExpired && request.is_active && (
                  <div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleEndPartnership(request)}
                    >
                      Partnerschaft beenden
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Lade Partnerschaftsanfragen...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Partnerschaftsanfragen</h2>
        <Button onClick={loadPartnershipRequests} variant="outline" size="sm">
          Aktualisieren
        </Button>
      </div>
      
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Ausstehend
            {pendingRequests.length > 0 && (
              <Badge className="ml-2 bg-yellow-500">{pendingRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Genehmigt
            {approvedRequests.length > 0 && (
              <Badge className="ml-2 bg-green-500">{approvedRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Abgelehnt
            {rejectedRequests.length > 0 && (
              <Badge className="ml-2 bg-red-500">{rejectedRequests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-4">
          {renderRequestsList(pendingRequests)}
        </TabsContent>
        
        <TabsContent value="approved" className="mt-4">
          {renderRequestsList(approvedRequests)}
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-4">
          {renderRequestsList(rejectedRequests)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PartnershipRequestsManager;
