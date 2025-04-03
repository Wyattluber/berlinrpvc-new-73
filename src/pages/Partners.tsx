
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ExternalLink, Users } from 'lucide-react';

// Updated data for partner servers with real information
const partnerServers = [
  {
    name: "RP DE",
    description: "Deutscher Roleplay Discord-Server mit Fokus auf realistische Simulationen.",
    owner: "aby_got_aim",
    discordLink: "https://discord.gg/qd5TqNUs",
    serverImage: "/placeholder.svg"
  },
  {
    name: "Roleplay Unite 🇩🇪(vc)",
    description: "Community für deutschsprachigen Roleplay mit Voice-Chat Funktionen.",
    owner: "lucakautschek",
    discordLink: "https://discord.gg/pDpDHtSqgU",
    serverImage: "/placeholder.svg"
  },
];

const Partners = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header Section with New Gradient */}
        <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Unsere Partner</h1>
            <p className="text-xl mb-6 max-w-3xl mx-auto">
              Wir arbeiten mit verschiedenen Discord-Servern zusammen, um ein besseres Erlebnis für alle zu schaffen.
            </p>
            
            {/* Discord Join Button with Hover Effect */}
            <a 
              href="https://discord.gg/berlinrpvc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 p-0.5 text-sm font-medium text-white hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 group-hover:from-purple-600 group-hover:to-blue-500"
            >
              <span className="relative rounded-md bg-gray-900 bg-opacity-50 px-5 py-2.5 transition-all duration-300 ease-in-out group-hover:bg-opacity-0">
                <span className="flex items-center gap-2">
                  <span className="block group-hover:hidden">Join us now</span>
                  <span className="hidden group-hover:block">Join us</span>
                  <ExternalLink size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </span>
            </a>
          </div>
        </section>
        
        {/* Logo Section */}
        <section className="py-10 bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="container mx-auto px-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-3xl">
              <img 
                src="/lovable-uploads/facc787d-f5d9-4ce8-9d2b-2c329ba5f0cd.png" 
                alt="BerlinRP-VC Logo" 
                className="w-full h-auto object-contain mx-auto mb-8 glow-effect"
              />
            </div>
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-400 shadow-lg shadow-blue-500/50">
              <img 
                src="/lovable-uploads/dd1f41c8-840e-4e30-a847-665d1ef1d0b1.png" 
                alt="BerlinRP-VC Logo Icon" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
        
        {/* Partner Servers Section with Improved Cards */}
        <section className="py-16 bg-gradient-to-b from-gray-800 to-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              Partner Server
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {partnerServers.map((server, index) => (
                <Card key={index} className="flex flex-col h-full overflow-hidden border-0 bg-gradient-to-br from-gray-800 to-gray-900 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 pb-8 relative">
                    <div className="absolute -bottom-6 left-6 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-white">{server.name}</CardTitle>
                    <CardDescription className="text-blue-100">{server.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow text-gray-300 pt-8">
                    <p className="text-sm mb-3">
                      <span className="font-semibold text-blue-300">Discord-Owner:</span> {server.owner}
                    </p>
                  </CardContent>
                  <CardFooter className="border-t border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 group relative overflow-hidden border-0"
                    >
                      <a 
                        href={server.discordLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <span>Discord Beitreten</span>
                        <ExternalLink size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Become a Partner Section with Improved Design */}
        <section className="py-16 bg-gradient-to-t from-blue-900 to-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent opacity-20"></div>
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              Partner werden
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-blue-100">
              Hast du einen Discord-Server und möchtest mit uns zusammenarbeiten? 
              Wir freuen uns über neue Partnerschaften!
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 group"
            >
              <a href="https://discord.gg/berlinrpvc" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <span>Partnerschaft anfragen</span>
                <ExternalLink size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />

      {/* CSS for glow effect */}
      <style jsx>{`
        .glow-effect {
          filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.5));
        }
      `}</style>
    </div>
  );
};

export default Partners;
