
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServerStats from '../components/ServerStats';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow mt-0 z-10">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent opacity-20"></div>
          </div>
          <div className="container mx-auto px-4 text-center relative z-[1]">
            <div className="w-full max-w-4xl mx-auto mb-8">
              <img 
                src="/lovable-uploads/facc787d-f5d9-4ce8-9d2b-2c329ba5f0cd.png" 
                alt="BerlinRP-VC" 
                className="w-full h-auto max-h-64 object-contain mx-auto filter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://via.placeholder.com/400x200?text=BerlinRP-VC';
                }}
              />
            </div>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
              Deine Community für den privaten BerlinRP-VC Server
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white/20 hover:bg-white/10 backdrop-blur-sm bg-white/5 group"
              >
                <a href="https://discord.gg/berlinrpvc" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <span>Discord Beitreten</span>
                  <ExternalLink size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <ServerStats />
        
        {/* Discord Widget Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="md:w-1/2 mb-8 md:mb-0 max-w-xl">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  Tritt unserem Discord bei
                </h2>
                <p className="text-gray-700 mb-4">
                  Werde Teil unserer aktiven Discord-Community und bleibe auf dem Laufenden über
                  alle Neuigkeiten, Events und Updates. Hier findest du auch Gleichgesinnte für gemeinsame
                  Rollenspiel-Erlebnisse.
                </p>
                <p className="text-gray-700 mb-6">
                  Unser Discord-Server ist der zentrale Anlaufpunkt für alle BerlinRP-VC Aktivitäten
                  und ein wichtiger Bestandteil unserer Community.
                </p>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <a href="https://discord.gg/berlinrpvc" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <span>Jetzt beitreten</span>
                    <ExternalLink size={16} />
                  </a>
                </Button>
              </div>
              
              <div className="md:w-1/2 flex justify-center">
                <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
                  <iframe 
                    src="https://discord.com/widget?id=1283167094854258741&theme=dark" 
                    width="350" 
                    height="500" 
                    allowTransparency={true} 
                    frameBorder="0" 
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    title="Discord BerlinRP-VC"
                    className="w-full max-w-[350px]"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* About Section */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <div className="relative rounded-lg overflow-hidden shadow-xl">
                  <img 
                    src="/lovable-uploads/dd1f41c8-840e-4e30-a847-665d1ef1d0b1.png" 
                    alt="BerlinRP-VC Community" 
                    className="rounded-lg shadow-lg w-full h-auto max-w-md mx-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://via.placeholder.com/600x400?text=Community+Image';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>
                </div>
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Über Unsere Community</h2>
                <p className="text-gray-700 mb-4">
                  Der BerlinRP-VC Server bietet dir eine realistische Simulation des Berliner Roleplays mit Voice-Chat. 
                  Werde Teil unserer aktiven Community und erlebe spannende Einsätze, Teamwork und Freundschaften.
                </p>
                <p className="text-gray-700 mb-6">
                  Egal ob du als Sanitäter, Feuerwehrmann oder Polizist aktiv werden möchtest - bei uns findest du 
                  deinen Platz im Team!
                </p>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <Link to="/partners">Unsere Partner</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-gradient-to-r from-purple-700 to-blue-700 text-white py-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent opacity-30"></div>
          </div>
          <div className="container mx-auto px-4 relative z-[1]">
            <h2 className="text-3xl font-bold mb-4">Bereit für den Einsatz?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Werde Teil unseres Teams und hilf mit, das virtuelle Berlin am Laufen zu halten.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300"
            >
              <Link to="/apply/form">Jetzt Bewerben</Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
