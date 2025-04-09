// GANZER CODE
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServerStats from '../components/ServerStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import Changelog from '@/components/Changelog';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow mt-0 z-10">
        {/* Hero */}
        <section className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white py-16 md:py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 text-center relative z-[1]">
            <div className="w-full max-w-4xl mx-auto mb-8">
              <img
                src="/lovable-uploads/facc787d-f5d9-4ce8-9d2b-2c329ba5f0cd.png"
                alt="BerlinRP-VC"
                className="w-full h-auto max-h-64 object-contain mx-auto filter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
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

        {/* Server Stats */}
        <ServerStats />

        {/* Community Highlights */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Community Highlights</h2>
            <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
              Erlebe einzigartige Momente mit unserer Community – ob witzige Situationen, spannende Einsätze oder emotionale Stories.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <img src="/lovable-uploads/highlight1.jpg" alt="Highlight 1" className="rounded-lg shadow-md" />
              <img src="/lovable-uploads/highlight2.jpg" alt="Highlight 2" className="rounded-lg shadow-md" />
              <img src="/lovable-uploads/highlight3.jpg" alt="Highlight 3" className="rounded-lg shadow-md" />
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Unser Team</h2>
            <p className="text-gray-600 mb-10 max-w-xl mx-auto">Das Leitungsteam von BerlinRP-VC stellt sich vor.</p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <img src="/lovable-uploads/team1.png" alt="Team 1" className="w-24 h-24 rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-semibold">MaxMustermann</h3>
                <p className="text-gray-500 text-sm">Serverleitung</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <img src="/lovable-uploads/team2.png" alt="Team 2" className="w-24 h-24 rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-semibold">RoleplayPro</h3>
                <p className="text-gray-500 text-sm">RP-Koordination</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <img src="/lovable-uploads/team3.png" alt="Team 3" className="w-24 h-24 rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-semibold">TechNerd</h3>
                <p className="text-gray-500 text-sm">Entwicklung & Web</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Unsere Technik & Features</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Discord Login</h3>
                <p className="text-gray-600">Einfache Anmeldung mit deinem Discord-Account – keine Registrierung nötig.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Bewerbungssystem</h3>
                <p className="text-gray-600">Schlanke Formulare, automatische Benachrichtigungen – alles läuft effizient.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Statistik & Kontrolle</h3>
                <p className="text-gray-600">Mit Supabase und Custom-Panel verwalten wir Nutzer, Rollen und Aktivitäten.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Changelog – Coming Soon */}
        <section className="py-12 bg-gray-50 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto relative">
              <div className="absolute inset-0 bg-gray-200 bg-opacity-80 z-10 flex items-center justify-center rotate-[-5deg] pointer-events-none">
                <span className="text-4xl font-bold text-gray-500 opacity-70">Coming Soon</span>
              </div>
              <Card className="relative z-0">
                <CardHeader>
                  <CardTitle>Changelog</CardTitle>
                  <CardDescription>
                    Hier findest du bald alle wichtigen Updates und Änderungen unserer Community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Wird aktuell vorbereitet …</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Über Uns */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <img
                  src="/lovable-uploads/dd1f41c8-840e-4e30-a847-665d1ef1d0b1.png"
                  alt="BerlinRP-VC Community"
                  className="rounded-lg shadow-lg w-full h-auto max-w-md mx-auto"
                />
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Über Unsere Community</h2>
                <p className="text-gray-700 mb-4">
                  Der BerlinRP-VC Server bietet dir eine realistische Simulation des Berliner Roleplays mit Voice-Chat.
                </p>
                <p className="text-gray-700 mb-6">
                  Egal ob du als Sanitäter, Feuerwehrmann oder Polizist aktiv werden möchtest – bei uns findest du deinen Platz!
                </p>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800">
                  <Link to="/partners">Unsere Partner</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Discord Widget */}
        <section className="py-16 bg-gray-100 text-center">
          <h2 className="text-3xl font-bold mb-6">Live auf unserem Discord</h2>
          <iframe
            src="https://discord.com/widget?id=1283167094854258741&theme=dark"
            width="350"
            height="500"
            allowTransparency={true}
            frameBorder="0"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            className="mx-auto rounded-xl shadow-md"
          ></iframe>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-purple-700 to-blue-700 text-white py-16 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Bereit für den Einsatz?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">Werde Teil unseres Teams und hilf mit, das virtuelle Berlin am Laufen zu halten.</p>
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
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
