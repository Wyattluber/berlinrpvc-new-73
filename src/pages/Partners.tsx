
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Mock data for partner servers
const partnerServers = [
  {
    name: "Polizei Berlin Roleplay",
    description: "Ein Rollenspiel-Server mit Fokus auf realistischen Polizeieinsätzen in Berlin.",
    members: 450,
    discordLink: "#",
    serverImage: "/placeholder.svg"
  },
  {
    name: "Rettungsdienst Deutschland",
    description: "Deutschlandweiter virtueller Rettungsdienst mit Fokus auf medizinischen Notfällen.",
    members: 320,
    discordLink: "#",
    serverImage: "/placeholder.svg"
  },
  {
    name: "Feuerwehr München",
    description: "Virtueller Feuerwehr-Server mit realistischen Einsätzen und Fahrzeugen.",
    members: 280,
    discordLink: "#",
    serverImage: "/placeholder.svg"
  },
  {
    name: "Notruf NRW",
    description: "Server für Notdienst-Simulationen im Raum Nordrhein-Westfalen.",
    members: 210,
    discordLink: "#",
    serverImage: "/placeholder.svg"
  },
];

const Partners = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header Section */}
        <section className="bg-hamburg-blue text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Unsere Partner</h1>
            <p className="text-xl mb-6 max-w-3xl mx-auto">
              Wir arbeiten mit verschiedenen Discord-Servern zusammen, um ein besseres Erlebnis für alle zu schaffen.
            </p>
          </div>
        </section>
        
        {/* Partner Servers Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center text-hamburg-blue">Partner Server</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {partnerServers.map((server, index) => (
                <Card key={index} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-full h-40 mb-4 overflow-hidden rounded-md">
                      <img 
                        src={server.serverImage} 
                        alt={server.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle>{server.name}</CardTitle>
                    <CardDescription>{server.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-gray-600">Mitglieder: {server.members}</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      <a href={server.discordLink} target="_blank" rel="noopener noreferrer" className="w-full">
                        Discord Beitreten
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Become a Partner Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6 text-hamburg-blue">Partner werden</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Hast du einen Discord-Server und möchtest mit uns zusammenarbeiten? 
              Wir freuen uns über neue Partnerschaften!
            </p>
            <Button size="lg" className="bg-hamburg-red hover:bg-red-700">
              Partnerschaft anfragen
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Partners;
