
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HandshakeIcon } from 'lucide-react';
import PartnershipStatus from '@/components/profile/PartnershipStatus';

interface PartnershipTabProps {
  navigate: any;
}

const PartnershipTab: React.FC<PartnershipTabProps> = ({ navigate }) => {
  return (
    <>
      <PartnershipStatus />
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Partnerschaft beantragen</CardTitle>
          <CardDescription>
            Beantrage eine Partnerschaft für deinen Server oder deine Community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/apply?tab=partnership')}>
            <HandshakeIcon className="h-4 w-4 mr-2" />
            Partnerschaft beantragen
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default PartnershipTab;
