
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Handshake, CalendarIcon } from 'lucide-react';

interface ModeratorTabProps {
  navigate: any;
}

const ModeratorTab: React.FC<ModeratorTabProps> = ({ navigate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderator Funktionen</CardTitle>
        <CardDescription>
          Zugriff auf Moderationsfunktionen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={() => navigate('/admin/partnerships')} className="w-full justify-start">
            <Handshake className="h-4 w-4 mr-2" />
            Partnerschaften verwalten
          </Button>
          
          <Button onClick={() => navigate('/admin/team-settings')} className="w-full justify-start">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Teammeetings verwalten
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModeratorTab;
