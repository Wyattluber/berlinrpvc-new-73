
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import Changelog from '@/components/Changelog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-mobile';

const Index = () => {
  const [serverStats, setServerStats] = useState({
    discordMembers: 0,
    partnerServers: 0,
    servers: 0,
    lastUpdated: '',
  });
  
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from('server_stats')
          .select('*')
          .order('id', { ascending: false })
          .limit(1)
          .single();
          
        if (error) throw error;
        
        setServerStats(data);
        console.log("Loaded server stats:", data);
      } catch (err) {
        console.error('Error fetching server stats:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-20">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Willkommen bei BerlinRP-VC</h1>
              <p className="text-xl mb-6">
                Der deutsche Roblox Roleplay Server mit dem Fokus auf realistische Simulationen und Erlebnisse.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/apply">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-lg py-2 px-6">
                    Jetzt bewerben
                  </Button>
                </Link>
                <a href="https://discord.gg/berlinrpvc" target="_blank" rel="noreferrer">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900 text-lg py-2 px-6">
                    Discord beitreten
                  </Button>
                </a>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="https://via.placeholder.com/400x200?text=BerlinRP-VC"
                alt="BerlinRP-VC" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Server Statistiken</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{loading ? '-' : serverStats.discordMembers}</div>
                <div className="text-gray-600">Discord Mitglieder</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{loading ? '-' : serverStats.partnerServers}</div>
                <div className="text-gray-600">Partner Server</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{loading ? '-' : serverStats.servers}</div>
                <div className="text-gray-600">Rollenspiel Server</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* News & Discord Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-8">Neuigkeiten & Updates</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Änderungshistorie</CardTitle>
                    <CardDescription>Die neuesten Änderungen und Updates auf unserem Server</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Changelog />
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold mb-8">Unser Discord</h2>
                <div className="flex justify-center">
                  <iframe 
                    src="https://discord.com/widget?id=1283167094854258741&theme=dark" 
                    width="350" 
                    height="500" 
                    allowTransparency={true} 
                    frameBorder="0" 
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    title="Discord"
                    className="border-none rounded-md shadow-md"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* How to Join */}
        <section className="py-16 bg-blue-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Wie kannst du mitmachen?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>1. Discord beitreten</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Tritt unserem Discord-Server bei, um alle wichtigen Informationen zu erhalten und Teil unserer Community zu werden.</p>
                  <a href="https://discord.gg/berlinrpvc" target="_blank" rel="noreferrer" className="block mt-4">
                    <Button className="w-full">Discord beitreten</Button>
                  </a>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>2. Team beitreten</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Bewirb dich als Teammitglied und hilf uns, das Spielerlebnis für alle zu verbessern und zu gestalten.</p>
                  <Link to="/apply" className="block mt-4">
                    <Button className="w-full">Jetzt bewerben</Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>3. Spielen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Sobald du aufgenommen bist, kannst du auf unseren Servern spielen und an unseren Events teilnehmen.</p>
                  <Link to="/subservers" className="block mt-4">
                    <Button className="w-full">Server ansehen</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
            
            <Alert className="mt-12 max-w-2xl mx-auto">
              <Info className="h-4 w-4" />
              <AlertTitle>Hinweis</AlertTitle>
              <AlertDescription>
                Um als Spieler teilzunehmen, musst du mindestens 12 Jahre alt sein und unsere Regeln akzeptieren.
              </AlertDescription>
            </Alert>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
