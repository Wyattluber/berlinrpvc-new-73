
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit } from 'lucide-react';

const IdChangeRequestsManager = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          ID-Änderungsanträge
        </CardTitle>
        <CardDescription>
          Verwalte Anfragen zur Änderung von Benutzer-IDs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted py-8 px-6 rounded-md text-center">
          <Edit className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">ID-Änderungsverwaltung wird geladen</h3>
          <p className="text-muted-foreground mb-4">
            Die ID-Änderungsverwaltungskomponente wird geladen oder ist gerade in Entwicklung.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default IdChangeRequestsManager;
