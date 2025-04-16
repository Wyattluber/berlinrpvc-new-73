
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2, ExternalLink } from 'lucide-react';
import PartnershipRequestForm from '@/components/PartnershipRequestForm';

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data, error } = await supabase
          .from('partner_servers')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setPartners(data);
      } catch (error) {
        console.error('Error fetching partners:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPartners();
  }, []);

  const closeForm = () => {
    setShowRequestForm(false);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <main className="flex-grow py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Unsere Partner
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Wir arbeiten mit verschiedenen Partnern zusammen, um dir ein besseres Erlebnis zu bieten.
            </p>
          </div>
          
          <div className="mb-8 flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
            <Button 
              onClick={() => setShowRequestForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Partner werden
            </Button>
            
            <Button 
              variant="outline"
              asChild
            >
              <Link to="/profile">Anfrage verwalten</Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium text-gray-700 mb-2">Keine Partner gefunden</h3>
              <p className="text-gray-500">Derzeit haben wir keine aktiven Partnerschaften.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner) => (
                <div 
                  key={partner.id} 
                  className="bg-white shadow-sm border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-24 h-24 mb-4 overflow-hidden rounded-full border-2 border-gray-200">
                      <img 
                        src={partner.logo_url || '/placeholder.svg'} 
                        alt={partner.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{partner.name}</h3>
                    {partner.description && (
                      <p className="text-gray-600 mb-4">{partner.description}</p>
                    )}
                    <div className="mt-auto pt-4">
                      <a 
                        href={partner.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        Besuchen <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {showRequestForm && (
        <PartnershipRequestForm onClose={closeForm} />
      )}
      
      <Footer />
    </div>
  );
};

export default Partners;
