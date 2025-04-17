
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';

const NewsManager = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          News-Manager
        </CardTitle>
        <CardDescription>
          Verwalte News-Beiträge und Ankündigungen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted py-8 px-6 rounded-md text-center">
          <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">News-Verwaltung wird geladen</h3>
          <p className="text-muted-foreground mb-4">
            Die News-Verwaltungskomponente wird geladen oder ist gerade in Entwicklung.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsManager;
