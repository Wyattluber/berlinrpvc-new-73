
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StoreItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: 'EUR' | 'ROBUX';
  image_url: string;
  product_url: string;
  created_at: string;
}

const ClothingStore = () => {
  const [loading, setLoading] = useState(true);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStoreItems = async () => {
      try {
        const { data, error } = await supabase
          .from('store_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setStoreItems(data || []);
      } catch (error) {
        console.error('Error fetching store items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreItems();
  }, []);

  const getCurrencySymbol = (currency: string) => {
    switch(currency) {
      case 'EUR': return '€';
      case 'ROBUX': return 'R$';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Clothing Store</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Entdecke unsere exklusiven Designs und Artikel für deinen Roblox-Charakter.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : storeItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border shadow-sm">
              <h3 className="text-xl font-medium text-gray-700 mb-2">Keine Artikel verfügbar</h3>
              <p className="text-gray-500">Zurzeit sind keine Artikel im Store verfügbar. Schau später wieder vorbei.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storeItems.map((item) => (
                <Card key={item.id}>
                  <div className="overflow-hidden h-56 bg-gray-100 rounded-t-lg">
                    <img 
                      src={item.image_url || '/placeholder.svg'} 
                      alt={item.name} 
                      className="w-full h-full object-cover object-center transition-transform hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{item.name}</CardTitle>
                    {item.description && (
                      <CardDescription>
                        {item.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardFooter className="flex justify-between items-center">
                    <div className="font-bold text-lg">
                      {getCurrencySymbol(item.currency)} {item.price}
                    </div>
                    <Button asChild>
                      <a 
                        href={item.product_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center"
                      >
                        Kaufen <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ClothingStore;
