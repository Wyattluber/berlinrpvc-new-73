
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Link, CheckCircle, XCircle, Clock, Calendar, RefreshCw } from 'lucide-react';
import { format, addMonths, isPast, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea'; // Corrected import
import { toast } from '@/hooks/use-toast';

const PartnershipStatus = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [partnerApplication, setPartnerApplication] = useState(null);
  const [partnerServer, setPartnerServer] = useState(null);
  const [renewalOpen, setRenewalOpen] = useState(false);
  const [renewalReason, setRenewalReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPartnershipDetails = async () => {
      if (!session) return;

      try {
        // Get partnership application
        const { data: appData, error: appError } = await supabase
          .from('partner_applications')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (appError) throw appError;

        if (appData) {
          setPartnerApplication(appData);

          // If application is approved, check for partner server details
          if (appData.status === 'approved') {
            const { data: serverData, error: serverError } = await supabase
              .from('partner_servers')
              .select('*')
              .eq('partner_application_id', appData.id)
              .maybeSingle();

            if (serverError) throw serverError;
            
            if (serverData) {
              setPartnerServer(serverData);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching partnership details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartnershipDetails();
  }, [session]);

  const handleRenewalSubmit = async () => {
    if (!session || !partnerApplication) return;
    
    if (renewalReason.trim().length < 10) {
      toast({
        title: "Fehler",
        description: "Bitte gib eine ausführlichere Begründung für deine Verlängerungsanfrage an.",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create a renewal application based on the original
      const { error } = await supabase
        .from('partner_applications')
        .update({
          is_renewal: true,
          reason: renewalReason,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', partnerApplication.id);
      
      if (error) throw error;
      
      toast({
        title: "Anfrage gesendet",
        description: "Deine Partnerschaftsverlängerung wurde beantragt und wird geprüft.",
      });
      
      // Refresh data
      const { data } = await supabase
        .from('partner_applications')
        .select('*')
        .eq('id', partnerApplication.id)
        .single();
        
      if (data) {
        setPartnerApplication(data);
      }
      
      setRenewalOpen(false);
      setRenewalReason('');
      
    } catch (error) {
      console.error('Error submitting renewal:', error);
      toast({
        title: "Fehler",
        description: "Die Verlängerungsanfrage konnte nicht gesendet werden.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Partnerschaft</CardTitle>
          <CardDescription>Details zu deiner Partnerschaftsanfrage</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Lade Partnerschaftsdetails...</p>
        </CardContent>
      </Card>
    );
  }

  if (!partnerApplication) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Partnerschaft</CardTitle>
          <CardDescription>Details zu deiner Partnerschaftsanfrage</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Du hast noch keine Partnerschaftsanfrage gestellt.</p>
        </CardContent>
      </Card>
    );
  }

  const createdDate = new Date(partnerApplication.created_at);
  const expirationDate = partnerApplication.expiration_date 
    ? new Date(partnerApplication.expiration_date)
    : addMonths(createdDate, 1);
  const isExpired = isPast(expirationDate);
  const daysUntilExpiration = !isExpired ? differenceInDays(expirationDate, new Date()) : 0;
  const isExpirationSoon = !isExpired && daysUntilExpiration <= 7;
  
  // If partnership is approved but expired, show as inactive
  const isActivePartnership = partnerApplication.status === 'approved' && 
                             partnerApplication.is_active && 
                             !isExpired;
  
  // Check if application is a renewal that's pending
  const isPendingRenewal = partnerApplication.status === 'pending' && partnerApplication.is_renewal;

  const renderStatusBadge = () => {
    if (isPendingRenewal) {
      return <Badge className="bg-orange-500">Verlängerung läuft</Badge>;
    } else if (partnerApplication.status === 'approved') {
      return isActivePartnership ? 
        <Badge className="bg-green-500">Aktiv</Badge> : 
        <Badge className="bg-gray-500">Inaktiv</Badge>;
    } else if (partnerApplication.status === 'rejected') {
      return <Badge className="bg-red-500">Abgelehnt</Badge>;
    } else {
      return <Badge className="bg-yellow-500">In Bearbeitung</Badge>;
    }
  };

  const renderStatusIcon = () => {
    if (isPendingRenewal) {
      return <RefreshCw className="h-6 w-6 text-orange-500" />;
    } else if (partnerApplication.status === 'approved') {
      return isActivePartnership ? 
        <CheckCircle className="h-6 w-6 text-green-500" /> : 
        <XCircle className="h-6 w-6 text-gray-500" />;
    } else if (partnerApplication.status === 'rejected') {
      return <XCircle className="h-6 w-6 text-red-500" />;
    } else {
      return <Clock className="h-6 w-6 text-yellow-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Partnerschaft</CardTitle>
            <CardDescription>Details zu deiner Partnerschaftsanfrage</CardDescription>
          </div>
          {renderStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            {renderStatusIcon()}
            <div>
              <h3 className="font-medium">Status: {
                isPendingRenewal ? 'Verlängerung läuft' :
                partnerApplication.status === 'approved' ? (isActivePartnership ? 'Aktiv' : 'Inaktiv') :
                partnerApplication.status === 'rejected' ? 'Abgelehnt' :
                'In Bearbeitung'
              }</h3>
              <p className="text-sm text-gray-500">
                Eingereicht am: {format(createdDate, 'PPP', { locale: de })}
              </p>
              {partnerApplication.is_renewal && (
                <p className="text-sm text-orange-500 font-medium">
                  {isPendingRenewal ? 'Verlängerung wird bearbeitet' : 'Verlängerte Partnerschaft'}
                </p>
              )}
            </div>
          </div>

          {partnerApplication.status === 'approved' && (
            <div className={`flex items-center p-3 ${isExpirationSoon ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'} rounded-md border mt-3`}>
              <Calendar className={`h-5 w-5 ${isExpirationSoon ? 'text-amber-600' : 'text-blue-600'} mr-3 flex-shrink-0`} />
              <div>
                <p className={`font-medium ${isExpirationSoon ? 'text-amber-800' : 'text-blue-800'}`}>
                  {isExpirationSoon ? 'Partnerschaft läuft bald ab' : 'Gültigkeitszeitraum'}
                </p>
                <p className={`text-sm ${isExpirationSoon ? 'text-amber-600' : 'text-blue-600'}`}>
                  {isExpired ? 
                    `Deine Partnerschaft ist am ${format(expirationDate, 'PPP', { locale: de })} abgelaufen.` :
                    `Deine Partnerschaft ist gültig bis: ${format(expirationDate, 'PPP', { locale: de })}`
                  }
                  {isExpirationSoon && !isExpired && ` (noch ${daysUntilExpiration} Tage)`}
                </p>
              </div>
            </div>
          )}

          {partnerServer && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-medium mb-2">Partnerschaft Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Aktiv:</div>
                <div>{isActivePartnership ? 'Ja' : 'Nein'}</div>
                <div className="text-gray-500">Server:</div>
                <div>{partnerServer.name}</div>
                {partnerServer.website && (
                  <>
                    <div className="text-gray-500">Website:</div>
                    <div className="flex items-center">
                      <a 
                        href={partnerServer.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        Öffnen <Link className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {partnerApplication.status === 'rejected' && (
            <div className="mt-4 p-3 bg-red-50 rounded-md">
              <p className="text-sm text-red-800">
                Deine Partnerschaftsanfrage wurde abgelehnt. Du kannst bei Fragen das Team kontaktieren.
              </p>
            </div>
          )}

          {/* Renewal Button */}
          {partnerApplication.status === 'approved' && isActivePartnership && (isExpirationSoon || isExpired) && !isPendingRenewal && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Dialog open={renewalOpen} onOpenChange={setRenewalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant={isExpired ? "destructive" : "default"}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {isExpired ? "Partnerschaft erneuern" : "Verlängerung beantragen"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Partnerschaft verlängern</DialogTitle>
                    <DialogDescription>
                      Erkläre bitte, warum du deine Partnerschaft verlängern möchtest und was du dir von der weiteren Zusammenarbeit erhoffst.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="reason" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Grund für die Verlängerung
                      </label>
                      <Textarea
                        id="reason"
                        placeholder="Gib hier deine Begründung ein..."
                        className="min-h-[120px]"
                        value={renewalReason}
                        onChange={(e) => setRenewalReason(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setRenewalOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button onClick={handleRenewalSubmit} disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Wird gesendet
                        </>
                      ) : (
                        "Verlängerung beantragen"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
          
          {/* Show renewal status */}
          {isPendingRenewal && (
            <div className="mt-4 p-3 bg-orange-50 rounded-md border border-orange-100">
              <p className="text-sm text-orange-800">
                Deine Verlängerungsanfrage wird bearbeitet. Das Team wird sich so schnell wie möglich damit befassen.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnershipStatus;
