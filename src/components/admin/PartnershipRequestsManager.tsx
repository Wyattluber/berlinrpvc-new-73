
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake } from 'lucide-react';

const PartnershipRequestsManager = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Handshake className="h-5 w-5" />
          Partnerschaftsanträge
        </CardTitle>
        <CardDescription>
          Verwalte eingehende Partnerschaftsanfragen und bestehende Partnerschaften.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted py-8 px-6 rounded-md text-center">
          <Handshake className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Partnerschaftsverwaltung wird geladen</h3>
          <p className="text-muted-foreground mb-4">
            Die Partnerschaftsverwaltungskomponente wird geladen oder ist gerade in Entwicklung.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnershipRequestsManager;
