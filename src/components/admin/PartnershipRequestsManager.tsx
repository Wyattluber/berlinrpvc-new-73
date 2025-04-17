
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake, Check, X, Link as LinkIcon, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
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

interface PartnerApplication {
  id: string;
  created_at: string;
  user_id: string;
  discord_id: string;
  discord_invite: string;
  status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  is_renewal: boolean;
  reason: string;
  expectations: string;
  advertisement: string;
  member_count: number;
  logo_url?: string;
  requirements: string;
}

const PartnershipRequestsManager = () => {
  const [loading, setLoading] = useState(true);
  const [partnershipRequests, setPartnershipRequests] = useState<PartnerApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<PartnerApplication | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  useEffect(() => {
    fetchPartnershipRequests();
  }, []);
  
  const fetchPartnershipRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('partner_applications')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setPartnershipRequests(data || []);
    } catch (error) {
      console.error('Error fetching partnership requests:', error);
      toast({
        title: 'Fehler',
        description: 'Partnerschaftsanfragen konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async (application: PartnerApplication) => {
    try {
      // Update partner_applications status
      const { error: updateError } = await supabase
        .from('partner_applications')
        .update({
          status: 'approved',
          is_active: true,
          expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', application.id);
      
      if (updateError) throw updateError;
      
      // Create or update entry in partner_servers
      const { data: existingServer, error: queryError } = await supabase
        .from('partner_servers')
        .select('*')
        .eq('partner_application_id', application.id)
        .maybeSingle();
      
      if (queryError) throw queryError;
      
      const serverData = {
        partner_application_id: application.id,
        owner: application.discord_id,
        name: `Discord Server ${application.discord_id}`,
        is_active: true,
        members: application.member_count,
        description: application.advertisement,
        website: `https://discord.gg/${application.discord_invite}`,
        logo_url: application.logo_url || '/placeholder.svg'
      };
      
      let serverUpdateError;
      
      if (existingServer) {
        // Update existing server
        const { error } = await supabase
          .from('partner_servers')
          .update(serverData)
          .eq('id', existingServer.id);
        
        serverUpdateError = error;
      } else {
        // Create new server
        const { error } = await supabase
          .from('partner_servers')
          .insert([serverData]);
        
        serverUpdateError = error;
      }
      
      if (serverUpdateError) throw serverUpdateError;
      
      toast({
        title: 'Anfrage genehmigt',
        description: 'Die Partnerschaftsanfrage wurde erfolgreich genehmigt.'
      });
      
      fetchPartnershipRequests();
    } catch (error) {
      console.error('Error approving partnership request:', error);
      toast({
        title: 'Fehler',
        description: 'Die Partnerschaftsanfrage konnte nicht genehmigt werden.',
        variant: 'destructive',
      });
    }
  };
  
  const handleReject = async (application: PartnerApplication) => {
    try {
      const { error } = await supabase
        .from('partner_applications')
        .update({
          status: 'rejected',
          is_active: false
        })
        .eq('id', application.id);
      
      if (error) throw error;
      
      toast({
        title: 'Anfrage abgelehnt',
        description: 'Die Partnerschaftsanfrage wurde abgelehnt.'
      });
      
      fetchPartnershipRequests();
    } catch (error) {
      console.error('Error rejecting partnership request:', error);
      toast({
        title: 'Fehler',
        description: 'Die Partnerschaftsanfrage konnte nicht abgelehnt werden.',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeactivate = async (application: PartnerApplication) => {
    try {
      // Update partner_applications status
      const { error: updateError } = await supabase
        .from('partner_applications')
        .update({
          is_active: false
        })
        .eq('id', application.id);
      
      if (updateError) throw updateError;
      
      // Deactivate entry in partner_servers
      const { error: serverError } = await supabase
        .from('partner_servers')
        .update({
          is_active: false
        })
        .eq('partner_application_id', application.id);
      
      if (serverError) throw serverError;
      
      toast({
        title: 'Partnerschaft deaktiviert',
        description: 'Die Partnerschaft wurde erfolgreich deaktiviert.'
      });
      
      fetchPartnershipRequests();
    } catch (error) {
      console.error('Error deactivating partnership:', error);
      toast({
        title: 'Fehler',
        description: 'Die Partnerschaft konnte nicht deaktiviert werden.',
        variant: 'destructive',
      });
    }
  };
  
  const viewDetails = (application: PartnerApplication) => {
    setSelectedApplication(application);
    setShowDetailsDialog(true);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const getStatusBadge = (status: string, isActive: boolean) => {
    if (status === 'approved' && isActive) {
      return <Badge className="bg-green-500">Aktiv</Badge>;
    } else if (status === 'approved' && !isActive) {
      return <Badge className="bg-gray-500">Inaktiv</Badge>;
    } else if (status === 'rejected') {
      return <Badge className="bg-red-500">Abgelehnt</Badge>;
    } else {
      return <Badge className="bg-yellow-500">Ausstehend</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Handshake className="h-5 w-5" />
          Partnerschaftsanträge
        </CardTitle>
        <CardDescription>
          Verwalte eingehende Partnerschaftsanfragen und bestehende Partnerschaften.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : partnershipRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Keine Partnerschaftsanfragen vorhanden.</p>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Eingereicht am</TableHead>
                  <TableHead>Discord ID</TableHead>
                  <TableHead>Server</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partnershipRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{formatDate(request.created_at)}</TableCell>
                    <TableCell>{request.discord_id}</TableCell>
                    <TableCell>
                      <a
                        href={`https://discord.gg/${request.discord_invite}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <LinkIcon className="h-4 w-4 mr-1" />
                        Einladung
                      </a>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status, request.is_active)}
                      {request.is_renewal && (
                        <Badge className="ml-2 bg-purple-500">Verlängerung</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewDetails(request)}
                        >
                          Details
                        </Button>
                        
                        {request.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleApprove(request)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleReject(request)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {request.status === 'approved' && request.is_active && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleDeactivate(request)}
                          >
                            Deaktivieren
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Partnership details dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-3xl">
            {selectedApplication && (
              <>
                <DialogHeader>
                  <DialogTitle>Partnerschaftsanfrage Details</DialogTitle>
                  <DialogDescription>
                    Eingereicht am {formatDate(selectedApplication.created_at)}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-lg mb-2">Server Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Discord ID:</span>
                        <span>{selectedApplication.discord_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Discord Invite:</span>
                        <a
                          href={`https://discord.gg/${selectedApplication.discord_invite}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          discord.gg/{selectedApplication.discord_invite}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Mitglieder:</span>
                        <span>{selectedApplication.member_count}</span>
                      </div>
                      
                      {selectedApplication.logo_url && (
                        <div className="mt-4">
                          <span className="text-gray-500 block mb-2">Server Logo:</span>
                          <div className="h-24 w-24 overflow-hidden rounded-md border border-gray-200">
                            <img 
                              src={selectedApplication.logo_url} 
                              alt="Server Logo" 
                              className="h-full w-full object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-2">Anfrage Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-500 block">Status:</span>
                        <div className="mt-1">
                          {getStatusBadge(selectedApplication.status, selectedApplication.is_active)}
                          {selectedApplication.is_renewal && (
                            <Badge className="ml-2 bg-purple-500">Verlängerung</Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Grund für Partnerschaft:</span>
                        <p className="text-sm mt-1">{selectedApplication.reason}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Erwartungen:</span>
                        <p className="text-sm mt-1">{selectedApplication.expectations}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium text-lg mb-2">Werbung für den Partnerbereich</h3>
                  <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                    <p>{selectedApplication.advertisement}</p>
                  </div>
                </div>
                
                <DialogFooter className="flex justify-between items-center mt-6">
                  <div>
                    {selectedApplication.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => {
                            handleApprove(selectedApplication);
                            setShowDetailsDialog(false);
                          }}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Genehmigen
                        </Button>
                        <Button 
                          variant="outline" 
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => {
                            handleReject(selectedApplication);
                            setShowDetailsDialog(false);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Ablehnen
                        </Button>
                      </div>
                    )}
                    
                    {selectedApplication.status === 'approved' && selectedApplication.is_active && (
                      <Button 
                        variant="outline" 
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => {
                          handleDeactivate(selectedApplication);
                          setShowDetailsDialog(false);
                        }}
                      >
                        Deaktivieren
                      </Button>
                    )}
                  </div>
                  
                  <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                    Schließen
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PartnershipRequestsManager;
