
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addMonths, isPast, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { PartnerStatusBadge, PartnerStatusIcon } from './partnership/PartnerStatusBadge';
import PartnershipRenewalDialog from './partnership/PartnershipRenewalDialog';
import PartnershipDetails from './partnership/PartnershipDetails';

const PartnershipStatus = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [partnerApplication, setPartnerApplication] = useState(null);
  const [partnerServer, setPartnerServer] = useState(null);
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);

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

  const handleEndPartnership = async () => {
    if (!partnerApplication) return;
    
    try {
      setLoading(true);
      
      // Update the partner application
      const { error: updateError } = await supabase
        .from('partner_applications')
        .update({ 
          is_active: false
        })
        .eq('id', partnerApplication.id);

      if (updateError) throw updateError;
      
      // Update the partner server if it exists
      if (partnerServer) {
        const { error: serverError } = await supabase
          .from('partner_servers')
          .update({ is_active: false })
          .eq('id', partnerServer.id);
          
        if (serverError) throw serverError;
      }
      
      toast({
        title: "Partnerschaft beendet",
        description: "Deine Partnerschaft wurde erfolgreich beendet.",
      });
      
      // Update local state
      setPartnerApplication({
        ...partnerApplication,
        is_active: false
      });
      
      setConfirmEndOpen(false);
    } catch (error) {
      console.error('Error ending partnership:', error);
      toast({
        title: "Fehler",
        description: "Die Partnerschaft konnte nicht beendet werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRenewalSubmitted = (updatedApplication) => {
    setPartnerApplication(updatedApplication);
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

  const statusText = isPendingRenewal ? 'Verlängerung läuft' :
    partnerApplication.status === 'approved' ? (isActivePartnership ? 'Aktiv' : 'Inaktiv') :
    partnerApplication.status === 'rejected' ? 'Abgelehnt' : 'In Bearbeitung';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Partnerschaft</CardTitle>
            <CardDescription>Details zu deiner Partnerschaftsanfrage</CardDescription>
          </div>
          <PartnerStatusBadge 
            status={partnerApplication.status} 
            isActive={isActivePartnership} 
            isExpired={isExpired}
            isPendingRenewal={isPendingRenewal}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <PartnerStatusIcon 
              status={partnerApplication.status}
              isActive={isActivePartnership}
              isExpired={isExpired}
              isPendingRenewal={isPendingRenewal}
            />
            <div>
              <h3 className="font-medium">Status: {statusText}</h3>
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

          <PartnershipDetails 
            partnerServer={partnerServer} 
            isActivePartnership={isActivePartnership}
          />

          {partnerApplication.status === 'rejected' && (
            <div className="mt-4 p-3 bg-red-50 rounded-md">
              <p className="text-sm text-red-800">
                Deine Partnerschaftsanfrage wurde abgelehnt. Du kannst bei Fragen das Team kontaktieren.
              </p>
            </div>
          )}

          {/* Partnership action buttons */}
          {partnerApplication.status === 'approved' && partnerApplication.is_active && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
              {/* Renewal Button */}
              {(isExpirationSoon || isExpired) && !isPendingRenewal && (
                <PartnershipRenewalDialog 
                  partnerApplication={partnerApplication}
                  isExpired={isExpired}
                  onRenewalSubmitted={handleRenewalSubmitted}
                />
              )}
              
              {/* End Partnership Button */}
              <AlertDialog open={confirmEndOpen} onOpenChange={setConfirmEndOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Partnerschaft beenden
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Partnerschaft beenden</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bist du sicher, dass du deine Partnerschaft beenden möchtest? 
                      Diese Aktion kann nicht rückgängig gemacht werden.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleEndPartnership}>
                      Beenden
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
