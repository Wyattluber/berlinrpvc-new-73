
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { ExternalLink, LoaderIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface SubServer {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  status: string;
  link: string | null;
  created_at: string;
  updated_at: string;
}

const SubServers = () => {
  const [subServers, setSubServers] = useState<SubServer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubServers = async () => {
      try {
        const { data, error } = await supabase
          .from('sub_servers')
          .select('*')
          .order('status', { ascending: false }) // Active servers first, then coming_soon and inactive
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }

        setSubServers(data || []);
      } catch (error) {
        console.error('Error fetching sub servers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubServers();
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'inactive':
        return 'Inaktiv';
      case 'coming_soon':
        return 'Coming Soon';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'coming_soon':
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  // Group servers by status
  const activeServers = subServers.filter(server => server.status === 'active');
  const comingSoonServers = subServers.filter(server => server.status === 'coming_soon');
  const inactiveServers = subServers.filter(server => server.status === 'inactive');

  const renderServerCard = (server: SubServer) => (
    <Card key={server.id} className="overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all duration-300">
      <div className={`h-2 bg-gradient-to-r ${server.color}`}></div>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <span className="text-2xl">{server.icon}</span>
            <span>{server.name}</span>
          </CardTitle>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(server.status)}`}>
            {getStatusLabel(server.status)}
          </span>
        </div>
        <CardDescription>{server.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-gray-600 text-sm">
          {server.status === 'coming_soon' ? 
            'Dieser Server befindet sich derzeit in Entwicklung und wird in Kürze verfügbar sein.' : 
            server.status === 'inactive' ? 
            'Dieser Server ist derzeit nicht verfügbar.' :
            'Verbinde dich jetzt mit diesem Server und beginne dein Roleplay-Abenteuer!'}
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          disabled={server.status !== 'active' || !server.link}
          variant={server.status === 'active' && server.link ? "default" : "outline"} 
          className={server.status === 'active' && server.link ? 
            `w-full bg-gradient-to-r ${server.color} group-hover:shadow-md transition-all duration-300` : 
            "w-full text-gray-500"}
          asChild={server.status === 'active' && server.link ? true : false}
        >
          {server.status === 'active' && server.link ? (
            <a href={server.link} target="_blank" rel="noopener noreferrer">
              <span className="flex items-center gap-2">
                <span>Server beitreten</span>
                <ExternalLink size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          ) : (
            <span>
              {server.status === 'coming_soon' ? 'Demnächst verfügbar' : 'Derzeit nicht verfügbar'}
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Unsere Unterserver
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              BerlinRP-VC besteht aus verschiedenen Unterservern, die jeweils für unterschiedliche Bereiche des 
              Roleplays verantwortlich sind. Entdecke sie hier!
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoaderIcon className="h-10 w-10 animate-spin text-indigo-400" />
            </div>
          ) : (
            <div className="space-y-10 max-w-5xl mx-auto">
              {activeServers.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-center">Aktive Server</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {activeServers.map(server => renderServerCard(server))}
                  </div>
                </div>
              )}
              
              {comingSoonServers.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-4 text-center">Demnächst verfügbar</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {comingSoonServers.map(server => renderServerCard(server))}
                  </div>
                </div>
              )}
              
              {inactiveServers.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-4 text-center">Inaktive Server</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {inactiveServers.map(server => renderServerCard(server))}
                  </div>
                </div>
              )}
              
              {subServers.length === 0 && (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-500">Keine Unterserver gefunden.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SubServers;
