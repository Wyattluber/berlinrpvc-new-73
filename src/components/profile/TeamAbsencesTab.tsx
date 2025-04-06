
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Loader2, CalendarX } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ModeratorAbsencePanel from '../admin/ModeratorAbsencePanel';

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

const TeamAbsencesTab: React.FC = () => {
  const [absences, setAbsences] = useState<TeamAbsence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAbsences();
  }, []);

  const loadAbsences = async () => {
    setLoading(true);
    try {
      const { data: absencesData, error: absencesError } = await supabase
        .from('team_absences')
        .select(`
          id,
          user_id,
          start_date,
          end_date,
          reason,
          status,
          created_at,
          profiles:user_id (username)
        `)
        .order('start_date', { ascending: false });

      if (absencesError) throw absencesError;

      const formattedData = absencesData?.map(item => ({
        ...item,
        username: (item.profiles as any)?.username || 'Unbekannter Benutzer'
      })) || [];

      setAbsences(formattedData);
    } catch (error) {
      console.error('Error fetching absences:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      <ModeratorAbsencePanel />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Team-Abmeldungen Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          {absences.length === 0 ? (
            <div className="text-center p-8 border rounded-md bg-gray-50">
              <CalendarX className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Keine Abmeldungen gefunden</p>
            </div>
          ) : (
            <>
              {/* Desktop view */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teammitglied</TableHead>
                      <TableHead>Abwesend vom</TableHead>
                      <TableHead>bis zum</TableHead>
                      <TableHead>Grund</TableHead>
                      <TableHead>Status</TableHead>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile view */}
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamAbsencesTab;
