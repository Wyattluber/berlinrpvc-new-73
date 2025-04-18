
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { TeamSettingsForm } from '@/components/admin/TeamSettingsForm';
import { TeamAbsencesList } from '@/components/admin/TeamAbsencesList';
import { TeamAbsenceForm } from '@/components/admin/TeamAbsenceForm';

const TeamMeetingsManagement = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Teammeetings verwalten
          </CardTitle>
          <CardDescription>
            Konfiguriere die Einstellungen für Teammeetings und verwalte Abwesenheiten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamSettingsForm />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Abwesenheiten einreichen</CardTitle>
          <CardDescription>
            Trage hier deine geplanten Abwesenheiten ein.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamAbsenceForm />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Abwesenheiten des Teams</CardTitle>
          <CardDescription>
            Übersicht aller gemeldeten Abwesenheiten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamAbsencesList />
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamMeetingsManagement;
