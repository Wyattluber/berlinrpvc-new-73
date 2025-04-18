
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake } from 'lucide-react';
import PartnershipRequestsManager from '@/components/admin/PartnershipRequestsManager';

const PartnershipManagement = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Handshake className="h-5 w-5" />
          Partnerschaften verwalten
        </CardTitle>
        <CardDescription>
          Verwalte eingehende Partnerschaftsanfragen und bestehende Partnerschaften.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PartnershipRequestsManager />
      </CardContent>
    </Card>
  );
};

export default PartnershipManagement;
