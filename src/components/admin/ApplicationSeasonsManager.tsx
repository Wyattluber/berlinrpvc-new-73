
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const ApplicationSeasonsManager = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Bewerbungssaisons-Manager
        </CardTitle>
        <CardDescription>
          Verwalte Bewerbungssaisons und Anmeldefristen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted py-8 px-6 rounded-md text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Bewerbungssaisons-Verwaltung wird geladen</h3>
          <p className="text-muted-foreground mb-4">
            Die Bewerbungssaisons-Verwaltungskomponente wird geladen oder ist gerade in Entwicklung.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationSeasonsManager;
