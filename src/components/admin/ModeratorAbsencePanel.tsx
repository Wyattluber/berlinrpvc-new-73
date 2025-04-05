
import React from 'react';
import { useContext } from 'react';
import { SessionContext } from '../../App'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TeamAbsenceForm from './TeamAbsenceForm';
import { AlertCircle } from 'lucide-react';

const ModeratorAbsencePanel = () => {
  const session = useContext(SessionContext);

  if (!session?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vom Meeting abmelden</CardTitle>
          <CardDescription>
            Du musst angemeldet sein, um diese Funktion zu nutzen.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          Vom Team-Meeting abmelden
        </CardTitle>
        <CardDescription>
          Teile mit, wenn du bei einem kommenden Team-Meeting nicht dabei sein kannst
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TeamAbsenceForm userId={session.user.id} />
      </CardContent>
    </Card>
  );
};

export default ModeratorAbsencePanel;
