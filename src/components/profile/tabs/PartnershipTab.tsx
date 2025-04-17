
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HandshakeIcon } from 'lucide-react';
import PartnershipStatus from '@/components/profile/PartnershipStatus';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PartnershipTabProps {
  navigate: any;
}

const PartnershipTab: React.FC<PartnershipTabProps> = ({ navigate }) => {
  const { session } = useAuth();
  const [hasPartnership, setHasPartnership] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    
    const checkPartnership = async () => {
      try {
        const { data, error } = await supabase
          .from('partner_applications')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking partnership:', error);
        }
        
        setHasPartnership(!!data);
      } catch (error) {
        console.error('Error checking partnership:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkPartnership();
  }, [session]);

  return (
    <>
      <PartnershipStatus />
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>
            {hasPartnership ? 'Partnerschaft verwalten' : 'Partnerschaft beantragen'}
          </CardTitle>
          <CardDescription>
            {hasPartnership 
              ? 'Verwalte deine bestehende Partnerschaft mit unserem Server' 
              : 'Beantrage eine Partnerschaft für deinen Server oder deine Community'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/apply?tab=partnership')}>
            <HandshakeIcon className="h-4 w-4 mr-2" />
            {hasPartnership ? 'Partnerschaft verwalten' : 'Partnerschaft beantragen'}
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default PartnershipTab;
