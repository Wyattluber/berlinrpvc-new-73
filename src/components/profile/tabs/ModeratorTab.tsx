
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModeratorTabProps {
  navigate?: any;
}

const ModeratorTab: React.FC<ModeratorTabProps> = ({ navigate: navProp }) => {
  // Use the navigate prop if provided, otherwise use the hook
  const navigateHook = useNavigate();
  const navigate = navProp || navigateHook;
  
  const handleNavigation = (path: string) => {
    // Verwende navigate-Funktion für korrekte Router-Navigation
    navigate(path);
    
    // Zum Seitenanfang scrollen
    window.scrollTo(0, 0);
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
          <Button onClick={() => handleNavigation('/admin/applications')}>
            <ClipboardList className="h-4 w-4 mr-2" />
            Bewerbungen verwalten
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModeratorTab;
