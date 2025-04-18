
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const AdminTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin-Funktionen</CardTitle>
        <CardDescription>
          Zugriff auf Administrator-Funktionen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          className="w-full justify-start"
          asChild
        >
          <a href="https://berlinrpvc-new-51.lovable.app/login" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Admin Dashboard öffnen
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminTab;
