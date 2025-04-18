
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Handshake, Calendar, ShoppingBag, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';

const ModeratorTab = () => {
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
            asChild
            className="w-full justify-start"
            type="button"
          >
            <Link to="/moderator/dashboard">
              <Handshake className="h-4 w-4 mr-2" />
              Partnerschaften verwalten
            </Link>
          </Button>
          
          <Button 
            asChild
            className="w-full justify-start"
            type="button"
          >
            <Link to="/moderator/dashboard">
              <Calendar className="h-4 w-4 mr-2" />
              Teammeetings verwalten
            </Link>
          </Button>
          
          <Button 
            asChild
            className="w-full justify-start"
            type="button"
          >
            <Link to="/moderator/dashboard">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Clothing Store verwalten
            </Link>
          </Button>
          
          <Button 
            asChild
            className="w-full justify-start"
            type="button"
          >
            <Link to="/moderator/dashboard">
              <Palette className="h-4 w-4 mr-2" />
              Discord Design verwalten
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModeratorTab;
