
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HandshakeIcon, ExternalLink, Loader2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface Partner {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  website: string;
  members: number;
}

interface PartnerDetailModalProps {
  partner?: Partner;
  onClose: () => void;
}

const PartnerDetailModal: React.FC<PartnerDetailModalProps> = ({ partner, onClose }) => {
  if (!partner) return null;
  
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{partner.name}</DialogTitle>
        <DialogDescription>Partnerschaftsdetails</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full overflow-hidden">
            <img 
              src={partner.logo_url || '/placeholder.svg'} 
              alt={partner.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold">{partner.name}</h3>
          <div className="flex items-center justify-center mt-1">
            <Users className="h-4 w-4 mr-1 text-gray-500" />
            <p className="text-sm text-gray-500">{partner.members} Mitglieder</p>
          </div>
        </div>
        
        {partner.description && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Über den Server</h4>
            <p className="text-sm whitespace-pre-line">{partner.description}</p>
          </div>
        )}
        
        <div className="flex justify-center mt-4">
          <Button asChild>
            <a 
              href={partner.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center"
            >
              Zum Discord <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

const Partners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();
  
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data, error } = await supabase
          .from('partner_servers')
          .select('*')
          .eq('is_active', true)
          .order('name');
          
        if (error) throw error;
        
        setPartners(data || []);
      } catch (error) {
        console.error('Error fetching partners:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPartners();
  }, []);
  
  const openPartnerDetail = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowPartnerModal(true);
  };
  
  const closePartnerDetail = () => {
    setShowPartnerModal(false);
    setSelectedPartner(null);
  };
  
  const applyForPartnership = () => {
    if (session) {
      navigate('/apply?tab=partnership');
    } else {
      navigate('/login', { state: { from: '/apply?tab=partnership' } });
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Unsere Partner</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Entdecke unsere Partnerserver und -communities. Wir arbeiten mit verschiedenen Servern zusammen, 
              um ein besseres Erlebnis für alle zu schaffen.
            </p>
            <Button 
              onClick={applyForPartnership}
              className="mt-6"
            >
              <HandshakeIcon className="mr-2 h-4 w-4" />
              Partnerschaft beantragen
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium text-gray-700 mb-2">Keine Partner gefunden</h3>
              <p className="text-gray-500">Aktuell sind keine aktiven Partnerschaften verfügbar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner) => (
                <Card 
                  key={partner.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openPartnerDetail(partner)}
                >
                  <CardHeader className="pb-2 text-center">
                    <div className="flex justify-center mb-2">
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        <img 
                          src={partner.logo_url || '/placeholder.svg'} 
                          alt={partner.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{partner.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center justify-center">
                        <Users className="h-4 w-4 mr-1" />
                        {partner.members} Mitglieder
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {partner.description || 'Keine Beschreibung verfügbar.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Dialog open={showPartnerModal} onOpenChange={setShowPartnerModal}>
        {selectedPartner && (
          <PartnerDetailModal 
            partner={selectedPartner} 
            onClose={closePartnerDetail} 
          />
        )}
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Partners;
