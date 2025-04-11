
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PartnerApplication {
  id: string;
  status: string;
  created_at: string;
  discord_invite: string;
  is_active: boolean;
}

interface PartnerApplicationStatusProps {
  userId: string;
}

const PartnerApplicationStatus: React.FC<PartnerApplicationStatusProps> = ({ userId }) => {
  const [application, setApplication] = useState<PartnerApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const { data, error } = await supabase
          .from('partner_applications')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) throw error;
        setApplication(data);
      } catch (error) {
        console.error('Error fetching partner application:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchApplication();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const getStatusBadge = () => {
    switch (application.status) {
      case 'approved':
        return <Badge className="bg-green-500">Genehmigt</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Abgelehnt</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Bearbeitung</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getActiveStatusBadge = () => {
    if (application.status !== 'approved') return null;
    
    return application.is_active ? 
      <Badge className="bg-green-500 ml-2">Aktiv</Badge> : 
      <Badge variant="outline" className="bg-gray-100 text-gray-800 ml-2">Inaktiv</Badge>;
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Partnerschafts-Bewerbung</CardTitle>
          <div className="flex items-center">
            {getStatusBadge()}
            {getActiveStatusBadge()}
          </div>
        </div>
        <CardDescription>
          Eingereicht am {formatDate(application.created_at)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {application.status === 'approved' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">
                Deine Partnerschafts-Bewerbung wurde angenommen! Die Partnerschaft ist {application.is_active ? 'aktiv' : 'derzeit inaktiv'}.
              </p>
            </div>
          )}
          
          {application.status === 'rejected' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">
                Deine Partnerschafts-Bewerbung wurde leider abgelehnt. Du kannst dich gerne erneut bewerben, wenn sich die Umstände geändert haben.
              </p>
            </div>
          )}
          
          {application.status === 'pending' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800">
                Deine Bewerbung wird derzeit geprüft. Wir werden dich benachrichtigen, sobald eine Entscheidung getroffen wurde.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      {application.status === 'approved' && application.discord_invite && (
        <CardFooter className="flex justify-between">
          <div>Server-Einladung:</div>
          <Button size="sm" variant="outline" className="flex items-center gap-1" asChild>
            <a href={application.discord_invite} target="_blank" rel="noopener noreferrer">
              <span>Zum Discord</span>
              <ExternalLink size={14} />
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PartnerApplicationStatus;
