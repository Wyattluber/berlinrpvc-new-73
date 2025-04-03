
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServerStats from '../components/ServerStats';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-hamburg-blue text-white py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Willkommen bei Notruf Hamburg
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Deine Community für den privaten Notruf Hamburg Server
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-hamburg-red hover:bg-red-700">
                <Link to="/apply">Bewerben</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Discord Beitreten
              </Button>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <ServerStats />
        
        {/* About Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <img 
                  src="/placeholder.svg" 
                  alt="Notruf Hamburg Community" 
                  className="rounded-lg shadow-lg w-full h-auto max-w-md mx-auto"
                />
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-6 text-hamburg-blue">Über Unsere Community</h2>
                <p className="text-gray-700 mb-4">
                  Der Notruf Hamburg Server bietet dir eine realistische Simulation des Hamburger Notdienstes. 
                  Werde Teil unserer aktiven Community und erlebe spannende Einsätze, Teamwork und Freundschaften.
                </p>
                <p className="text-gray-700 mb-6">
                  Egal ob du als Sanitäter, Feuerwehrmann oder Polizist aktiv werden möchtest - bei uns findest du 
                  deinen Platz im Team!
                </p>
                <Button className="bg-hamburg-blue hover:bg-blue-800">
                  <Link to="/partners">Unsere Partner</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-hamburg-red text-white py-16 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Bereit für den Einsatz?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Werde Teil unseres Teams und hilf mit, den virtuellen Notdienst in Hamburg am Laufen zu halten.
            </p>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
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
