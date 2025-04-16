
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Handshake, Calendar, ShoppingBag } from 'lucide-react';

interface ModeratorTabProps {
  navigate: any;
}

const ModeratorTab: React.FC<ModeratorTabProps> = ({ navigate }) => {
  // Redirect to external admin panel
  const redirectToAdminPanel = (path: string) => {
    window.location.href = `https://berlinrpvc-new-51.lovable.app/login${path}`;
  };
  
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
          <Button 
            onClick={() => redirectToAdminPanel('/partnerships')} 
            className="w-full justify-start"
          >
            <Handshake className="h-4 w-4 mr-2" />
            Partnerschaften verwalten
          </Button>
          
          <Button 
            onClick={() => redirectToAdminPanel('/team-settings')} 
            className="w-full justify-start"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Teammeetings verwalten
          </Button>
          
          <Button 
            onClick={() => redirectToAdminPanel('/store')} 
            className="w-full justify-start"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Clothing Store verwalten
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModeratorTab;
