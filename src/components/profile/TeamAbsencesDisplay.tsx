
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TeamAbsence {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

const TeamAbsencesDisplay: React.FC<{ userId: string }> = ({ userId }) => {
  const [absences, setAbsences] = useState<TeamAbsence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('team_absences')
          .select('*')
          .eq('user_id', userId)
          .order('end_date', { ascending: false })
          .limit(5);

        if (error) throw error;
        setAbsences(data || []);
      } catch (error) {
        console.error('Error fetching absences:', error);
        toast({
          title: 'Fehler',
          description: 'Abwesenheiten konnten nicht geladen werden.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAbsences();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deine Team-Abmeldungen</CardTitle>
          <CardDescription>Lade Abmeldungen...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (absences.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deine Team-Abmeldungen</CardTitle>
          <CardDescription>Du hast dich bisher nicht vom Teammeeting abgemeldet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Genehmigt</span>;
      case 'rejected':
        return <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">Abgelehnt</span>;
      default:
        return <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Ausstehend</span>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deine Team-Abmeldungen</CardTitle>
        <CardDescription>Übersicht deiner Abmeldungen von Teammeetings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {absences.map((absence) => (
            <div key={absence.id} className="border p-3 rounded-md">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm font-medium">
                    {format(new Date(absence.start_date), 'dd.MM.yyyy', { locale: de })} - {format(new Date(absence.end_date), 'dd.MM.yyyy', { locale: de })}
                  </span>
                </div>
                {getStatusBadge(absence.status)}
              </div>
              <div className="text-sm text-gray-700 flex items-start mt-2">
                <AlertCircle className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                <span>{absence.reason}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamAbsencesDisplay;
