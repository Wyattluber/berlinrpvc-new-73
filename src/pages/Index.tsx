import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServerStats from '../components/ServerStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

const Index = () => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.onerror = null;
    target.src = 'https://via.placeholder.com/400x200?text=BerlinRP-VC';
  };

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
                onError={handleImageError}
              />
            </div>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
              Deine Community für den privaten BerlinRP-VC Server
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white/20 hover:bg-gradient-to-r from-blue-600 to-indigo-700 backdrop-blur-sm bg-white/5 group"
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
        <div className="py-8">
          <ServerStats />
        </div>

        {/* Discord Widget Section */}
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Unser Discord</h2>
            <div className="flex justify-center">
              <iframe 
                src="https://discord.com/widget?id=1283167094854258741&theme=dark" 
                width="350" 
                height="500" 
                allowTransparency={true} 
                frameBorder="0" 
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                title="Discord Embed"
                className="rounded-lg shadow-lg"
              ></iframe>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-10 text-gray-800">Unser Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Founder */}
              <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300">
                <img
                  src="https://cdn.discordapp.com/avatars/1150411455443783795/4255ccaf55b3d9ecdddcabe4e6d53fc5?size=1024"
                  alt="Founder"
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-indigo-500"
                />
                <h3 className="text-xl font-bold text-gray-800">◤✞𝕯𝖆𝖗𝖐 𝕬𝖓𝖌𝖊𝖑✞◥</h3>
                <p className="text-sm text-indigo-600 mt-1">Founder</p>
              </div>
              {/* Co-Founder */}
              <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300">
                <img
                  src="https://cdn.discordapp.com/avatars/1020320597936439429/0328f839138b450d1029f2c582f4f4e0?size=1024"
                  alt="Co-Founder"
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-indigo-500"
                />
                <h3 className="text-xl font-bold text-gray-800">Backtrix_23 | Berlin RP-VC</h3>
                <p className="text-sm text-indigo-600 mt-1">Co-Founder</p>
              </div>
              {/* Teamleitung */}
              <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300">
                <img
                  src="https://cdn.discordapp.com/avatars/22020/username" // Füge hier das Profilbild von gamestarlolo ein
                  alt="gamestarlolo"
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-indigo-500"
                  onError={handleImageError}
                />
                <h3 className="text-xl font-bold text-gray-800">gamestarlolo</h3>
                <p className="text-sm text-indigo-600 mt-1">Teamleitung</p>
              </div>

              {/* Moderatoren */}
              <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-800">Moderatoren (10)</h3>
                <p className="text-sm text-indigo-600 mt-1">Rollenverifizierte Moderatoren</p>
                <div className="flex flex-wrap gap-4 justify-center mt-4">
                  {['Mod1', 'Mod2', 'Mod3', 'Mod4', 'Mod5', 'Mod6', 'Mod7', 'Mod8', 'Mod9', 'Mod10'].map((mod, index) => (
                    <div key={index} className="w-12 h-12 rounded-full bg-gray-300 flex justify-center items-center">
                      <span className="text-xs font-bold">{mod}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unverifizierte Moderatoren */}
              <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-800">Unverifizierte Moderatoren (7)</h3>
                <p className="text-sm text-indigo-600 mt-1">Unverifizierte Moderatoren</p>
                <div className="flex flex-wrap gap-4 justify-center mt-4">
                  {['Unmod1', 'Unmod2', 'Unmod3', 'Unmod4', 'Unmod5', 'Unmod6', 'Unmod7'].map((unmod, index) => (
                    <div key={index} className="w-12 h-12 rounded-full bg-gray-300 flex justify-center items-center">
                      <span className="text-xs font-bold">{unmod}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platzhalter */}
              <div className="bg-white shadow-inner rounded-2xl p-6 flex items-center justify-center text-center text-gray-500 italic">
                Weitere Teammitglieder werden bald eingetragen...
              </div>
            </div>
          </div>
        </section>

        {/* Changelog Section */}
        <section className="relative py-16 bg-gray-50">
          <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rotate-[-5deg]">
            <h2 className="text-5xl font-extrabold text-gray-400 opacity-60">COMING SOON</h2>
          </div>
          <div className="container mx-auto px-4 relative z-0">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Changelog</CardTitle>
                  <CardDescription>
                    Hier findest du alle wichtigen Updates und Änderungen unserer Community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Platzhalter für zukünftige Einbindung */}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <div className="relative rounded-lg overflow-hidden shadow-xl">
                  <img
                    src="/lovable-uploads/dd1f41c8-840e-4e30-a847-665d1ef1d0b1.png"
                    alt="BerlinRP-VC Community"
                    className="rounded-lg shadow-lg w-full h-auto max-w-md mx-auto"
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>
                </div>
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Über Unsere Community</h2>
                <p className="text-gray-700 mb-4">
                  Der BerlinRP-VC Server bietet dir eine realistische Simulation des Berliner Roleplays mit Voice-Chat.
                  Werde Teil unserer aktiven Community und erlebe spannende Einsätze, Teamwork und viele weitere
                  Features.
                </p>
                <Button size="lg" variant="outline" className="mt-4">
                  <Link to="/apply">Bewerben</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
};

export default Index;
