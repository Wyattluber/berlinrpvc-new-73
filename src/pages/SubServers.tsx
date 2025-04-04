
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const subServers = [
  {
    id: 'police',
    name: 'Polizei Berlin RP',
    description: 'Offizieller Polizei-Server für den BerlinRP-VC',
    icon: '👮‍♂️',
    color: 'from-blue-500 to-blue-700',
    status: 'active',
    link: '#',
    comingSoon: true
  },
  {
    id: 'fire',
    name: 'Feuerwehr/Sanitäter Berlin',
    description: 'Feuerwehr und Rettungsdienst für BerlinRP-VC',
    icon: '🚒',
    color: 'from-red-500 to-red-700',
    status: 'active',
    link: '#',
    comingSoon: true
  },
  {
    id: 'hvb',
    name: 'Busfahrer (HVB)',
    description: 'Offizieller HVB-Server für BerlinRP-VC',
    icon: '🚌',
    color: 'from-yellow-500 to-amber-700',
    status: 'active',
    link: '#',
    comingSoon: true
  },
  {
    id: 'adac',
    name: 'ADAC',
    description: 'Offizieller ADAC-Server für BerlinRP-VC',
    icon: '🔧',
    color: 'from-yellow-400 to-yellow-600',
    status: 'active',
    link: '#',
    comingSoon: true
  }
];

const SubServers = () => {
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {subServers.map(server => (
              <Card key={server.id} className="overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all duration-300">
                <div className={`h-2 bg-gradient-to-r ${server.color}`}></div>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <span className="text-2xl">{server.icon}</span>
                      <span>{server.name}</span>
                    </CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${server.comingSoon ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                      {server.comingSoon ? 'Coming Soon' : 'Aktiv'}
                    </span>
                  </div>
                  <CardDescription>{server.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-gray-600 text-sm">
                    {server.comingSoon ? 
                      'Dieser Server befindet sich derzeit in Entwicklung und wird in Kürze verfügbar sein.' : 
                      'Verbinde dich jetzt mit diesem Server und beginne dein Roleplay-Abenteuer!'}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    disabled={server.comingSoon}
                    variant={server.comingSoon ? "outline" : "default"} 
                    className={server.comingSoon ? "w-full text-gray-500" : `w-full bg-gradient-to-r ${server.color} group-hover:shadow-md transition-all duration-300`}
                  >
                    <span className="flex items-center gap-2">
                      {server.comingSoon ? 'Demnächst verfügbar' : (
                        <>
                          <span>Server beitreten</span>
                          <ExternalLink size={16} className="transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SubServers;
