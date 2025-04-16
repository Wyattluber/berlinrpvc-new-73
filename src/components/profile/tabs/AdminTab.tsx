
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface AdminTabProps {
  navigate: any;
}

const AdminTab: React.FC<AdminTabProps> = ({ navigate }) => {
  const goToAdminPanel = () => {
    window.location.href = 'https://berlinrpvc-new-51.lovable.app/login';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
        <CardDescription>
          Zugriff auf Verwaltungsfunktionen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={goToAdminPanel}>
          <Shield className="h-4 w-4 mr-2" />
          Admin Dashboard öffnen
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminTab;
