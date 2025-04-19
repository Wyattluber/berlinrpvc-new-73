
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { getUserTeamAbsences, getTeamSettings } from '@/lib/admin/team';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle, User } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import TeamAbsenceForm from '@/components/admin/TeamAbsenceForm';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ModinfoTab = () => {
  const { session } = useAuth();
  const [absences, setAbsences] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (session?.user?.id) {
          // Load user's absences directly from the database
          const { data: absencesData, error: absencesError } = await supabase
            .from('team_absences')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });
          
          if (absencesError) throw absencesError;
          setAbsences(absencesData || []);

          // Load team meeting settings
          const { data: settingsData, error: settingsError } = await supabase
            .from('team_settings')
            .select('*')
            .single();
          
          if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
          setSettings(settingsData || null);
        }
      } catch (error) {
        console.error('Error loading moderator info:', error);
        toast({
          title: 'Fehler',
          description: 'Daten konnten nicht geladen werden.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy', { locale: de });
    } catch (error) {
      return 'Ungültiges Datum';
    }
  };

  const getStatusBadge = (status) => {
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Teammeetings Information
          </CardTitle>
          <CardDescription>
            Aktuell geplante Teammeetings und Informationen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tag</h3>
                  <p className="mt-1">{settings.meeting_day || 'Nicht festgelegt'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Zeit</h3>
                  <p className="mt-1">{settings.meeting_time || 'Nicht festgelegt'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Frequenz</h3>
                  <p className="mt-1">{settings.meeting_frequency || 'Wöchentlich'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Ort</h3>
                  <p className="mt-1">{settings.meeting_location || 'Discord'}</p>
                </div>
              </div>
              {settings.meeting_notes && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500">Notizen</h3>
                  <p className="mt-1 text-sm whitespace-pre-line">{settings.meeting_notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Keine Meeting-Informationen vorhanden</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Abwesenheit beantragen</CardTitle>
          <CardDescription>
            Falls du an kommenden Meetings nicht teilnehmen kannst, reiche hier deine Abwesenheit ein
          </CardDescription>
        </CardHeader>
        <CardContent>
          {session?.user && <TeamAbsenceForm userId={session.user.id} onSuccess={() => {
            // Reload absences after form submission
            setLoading(true);
            supabase
              .from('team_absences')
              .select('*')
              .eq('user_id', session.user.id)
              .order('created_at', { ascending: false })
              .then(({ data, error }) => {
                if (error) {
                  console.error('Error reloading absences:', error);
                } else {
                  setAbsences(data || []);
                }
                setLoading(false);
              });
          }} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meine Abwesenheiten</CardTitle>
          <CardDescription>
            Übersicht deiner gemeldeten Abwesenheiten
          </CardDescription>
        </CardHeader>
        <CardContent>
          {absences.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Du hast bisher keine Abwesenheiten gemeldet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {absences.map((absence) => (
                <div key={absence.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium">
                          {formatDate(absence.start_date)} bis {formatDate(absence.end_date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{absence.reason}</p>
                    </div>
                    <div>{getStatusBadge(absence.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModinfoTab;
