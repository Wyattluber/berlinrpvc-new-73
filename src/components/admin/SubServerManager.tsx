
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Server } from 'lucide-react';

const SubServerManager = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Subserver-Manager
        </CardTitle>
        <CardDescription>
          Verwalte die verfügbaren Subserver und deren Eigenschaften.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted py-8 px-6 rounded-md text-center">
          <Server className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Subserver-Verwaltung wird geladen</h3>
          <p className="text-muted-foreground mb-4">
            Die Subserver-Verwaltungskomponente wird geladen oder ist gerade in Entwicklung.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubServerManager;
