
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Link, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { format, addMonths, isPast } from 'date-fns';
import { de } from 'date-fns/locale';

const PartnershipStatus = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [partnerApplication, setPartnerApplication] = useState(null);
  const [partnerServer, setPartnerServer] = useState(null);

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
  const expirationDate = addMonths(createdDate, 1);
  const isExpired = isPast(expirationDate);
  
  // If partnership is approved but expired, show as inactive
  const isActivePartnership = partnerApplication.status === 'approved' && 
                             partnerApplication.is_active && 
                             !isExpired;

  const renderStatusBadge = () => {
    if (partnerApplication.status === 'approved') {
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
    if (partnerApplication.status === 'approved') {
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
                partnerApplication.status === 'approved' ? (isActivePartnership ? 'Aktiv' : 'Inaktiv') :
                partnerApplication.status === 'rejected' ? 'Abgelehnt' :
                'In Bearbeitung'
              }</h3>
              <p className="text-sm text-gray-500">
                Eingereicht am: {format(createdDate, 'PPP', { locale: de })}
              </p>
            </div>
          </div>

          {partnerApplication.status === 'approved' && (
            <div className="flex items-center p-3 bg-blue-50 rounded-md border border-blue-100 mt-3">
              <Calendar className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800">Gültigkeitszeitraum</p>
                <p className="text-sm text-blue-600">
                  {isExpired ? 
                    `Deine Partnerschaft ist am ${format(expirationDate, 'PPP', { locale: de })} abgelaufen.` :
                    `Deine Partnerschaft ist gültig bis: ${format(expirationDate, 'PPP', { locale: de })}`
                  }
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
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnershipStatus;
