
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, AlertCircle, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchTeamAbsences } from '@/lib/admin/team';

interface TeamAbsence {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  username?: string;
}

const TeamAbsencesList = () => {
  const [absences, setAbsences] = useState<TeamAbsence[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadAbsences();
  }, []);

  const loadAbsences = async () => {
    setLoading(true);
    try {
      const absences = await fetchTeamAbsences();
      console.log('Loaded team absences:', absences);
      setAbsences(absences);
    } catch (error) {
      console.error('Error fetching absences:', error);
      toast({
        title: "Fehler",
        description: "Abmeldungen konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('team_absences')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setAbsences(absences.map(absence => 
        absence.id === id ? { ...absence, status } : absence
      ));

      toast({
        title: "Erfolgreich",
        description: `Abmeldung wurde ${status === 'approved' ? 'genehmigt' : 'abgelehnt'}.`
      });
    } catch (error) {
      console.error('Error updating absence status:', error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Genehmigt</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Abgelehnt</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Ausstehend</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (absences.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md bg-gray-50">
        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500">Keine Abmeldungen gefunden</p>
      </div>
    );
  }

  // Desktop view (table)
  const desktopView = (
    <div className="hidden md:block overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teammitglied</TableHead>
            <TableHead>Abwesend vom</TableHead>
            <TableHead>bis zum</TableHead>
            <TableHead>Grund</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {absences.map((absence) => (
            <TableRow key={absence.id}>
              <TableCell className="font-medium">{absence.username}</TableCell>
              <TableCell>{format(new Date(absence.start_date), 'dd.MM.yyyy', { locale: de })}</TableCell>
              <TableCell>{format(new Date(absence.end_date), 'dd.MM.yyyy', { locale: de })}</TableCell>
              <TableCell className="max-w-[200px] truncate">{absence.reason}</TableCell>
              <TableCell>{getStatusBadge(absence.status)}</TableCell>
              <TableCell>
                {absence.status === 'pending' ? (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-green-600"
                      onClick={() => handleStatusChange(absence.id, 'approved')}
                      disabled={processingId === absence.id}
                    >
                      {processingId === absence.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600"
                      onClick={() => handleStatusChange(absence.id, 'rejected')}
                      disabled={processingId === absence.id}
                    >
                      {processingId === absence.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 italic">Bearbeitet</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // Mobile view (cards)
  const mobileView = (
    <div className="md:hidden space-y-4">
      {absences.map((absence) => (
        <Card key={absence.id} className="overflow-hidden">
          <CardHeader className="py-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">{absence.username}</CardTitle>
              {getStatusBadge(absence.status)}
            </div>
          </CardHeader>
          <CardContent className="pb-3 pt-0 space-y-2">
            <div className="text-sm">
              <span className="text-gray-500">Abwesend vom:</span> {format(new Date(absence.start_date), 'dd.MM.yyyy', { locale: de })}
            </div>
            <div className="text-sm">
              <span className="text-gray-500">bis zum:</span> {format(new Date(absence.end_date), 'dd.MM.yyyy', { locale: de })}
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Grund:</span> {absence.reason}
            </div>
            {absence.status === 'pending' && (
              <div className="flex space-x-2 mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-green-600"
                  onClick={() => handleStatusChange(absence.id, 'approved')}
                  disabled={processingId === absence.id}
                >
                  {processingId === absence.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                  Genehmigen
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-red-600"
                  onClick={() => handleStatusChange(absence.id, 'rejected')}
                  disabled={processingId === absence.id}
                >
                  {processingId === absence.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <X className="h-4 w-4 mr-1" />}
                  Ablehnen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div>
      {desktopView}
      {mobileView}
    </div>
  );
};

export default TeamAbsencesList;
