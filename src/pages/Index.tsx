import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow z-10">
        {/* Hero */}
        <section className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 text-center relative z-[1]">
            <img 
              src="/lovable-uploads/facc787d-f5d9-4ce8-9d2b-2c329ba5f0cd.png"
              alt="BerlinRP-VC"
              className="w-full max-w-5xl max-h-72 object-contain mx-auto drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]"
            />
            <p className="text-2xl mt-6 max-w-3xl mx-auto text-blue-100">
              Deine Community für den privaten BerlinRP-VC Server
            </p>
            <div className="mt-8">
              <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 backdrop-blur-sm bg-white/5 group">
                <a href="https://discord.gg/berlinrpvc" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <span>Discord Beitreten</span>
                  <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Coming Soon Changelog */}
        <section className="py-20 bg-gray-100 relative overflow-hidden">
          <div className="container mx-auto px-4 text-center">
            <div className="relative inline-block">
              <Card className="opacity-50 grayscale blur-sm">
                <CardHeader>
                  <CardTitle>Changelog</CardTitle>
                  <CardDescription>Hier findest du bald alle Updates!</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-32 flex items-center justify-center">Noch nicht verfügbar</div>
                </CardContent>
              </Card>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] text-3xl font-extrabold text-red-600 opacity-80 pointer-events-none">
                <div className="border-4 border-red-600 px-4 py-2 rounded-full">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Highlights (Coming Soon) */}
        <section className="py-20 bg-white text-center relative">
          <div className="container mx-auto px-4">
            <div className="relative inline-block">
              <div className="bg-gray-200 p-10 rounded-lg opacity-50 blur-sm grayscale">
                <h2 className="text-3xl font-bold">Community Highlights</h2>
                <p className="text-gray-600 mt-4">Spannende Inhalte aus unserer Community folgen bald.</p>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] text-3xl font-extrabold text-red-600 opacity-80 pointer-events-none">
                <div className="border-4 border-red-600 px-4 py-2 rounded-full">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Discord Team Section */}
        <section className="py-28 bg-gradient-to-br from-[#2f3136] to-[#1e2124] text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12 text-center">Unser Team</h2>
            <p className="text-center mb-8 text-gray-400">Einige Rollen sind bereits besetzt – weitere Mitglieder folgen bald!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

              {/* Founder */}
              <div className="bg-[#36393f] rounded-2xl p-6 shadow-md text-center">
                <img src="https://cdn.discordapp.com/avatars/1150411455443783795/4255ccaf55b3d9ecdddcabe4e6d53fc5?size=1024" alt="Founder" className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-indigo-600" />
                <h3 className="text-xl font-semibold">◤✞𝕯𝖆𝖗𝖐 𝕬𝖓𝖌𝖊𝖑✞◥</h3>
                <p className="text-sm text-gray-400">Founder</p>
              </div>

              {/* Co-Founder */}
              <div className="bg-[#36393f] rounded-2xl p-6 shadow-md text-center">
                <img src="https://cdn.discordapp.com/avatars/1020320597936439429/0328f839138b450d1029f2c582f4f4e0?size=1024" alt="Co-Founder" className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-purple-600" />
                <h3 className="text-xl font-semibold">Backtrix_23 | Berlin RP-VC</h3>
                <p className="text-sm text-gray-400">Co-Founder</p>
              </div>

              {/* Teamleiter */}
              <div className="bg-[#36393f] rounded-2xl p-6 shadow-md text-center">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-gray-700 flex items-center justify-center text-2xl text-gray-400">?</div>
                <h3 className="text-xl font-semibold">Wird eingetragen</h3>
                <p className="text-sm text-gray-400">Teamleiter</p>
              </div>

              {/* Moderatoren */}
              <div className="bg-[#36393f] rounded-2xl p-6 shadow-md text-center">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-gray-700 flex items-center justify-center text-2xl text-gray-400">?</div>
                <h3 className="text-xl font-semibold">Wird eingetragen</h3>
                <p className="text-sm text-gray-400">Moderatoren</p>
              </div>

            </div>
          </div>
        </section>

        {/* Discord Widget */}
        <section className="py-28 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Tritt unserer Community bei</h2>
            <p className="text-lg mb-8">Direkt hier das Server-Widget anzeigen</p>
            <div className="flex justify-center">
              <iframe
                src="https://discord.com/widget?id=1283167094854258741&theme=dark"
                width="350"
                height="500"
                allowTransparency={true}
                frameBorder="0"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
              ></iframe>
            </div>
          </div>
        </section>

        {/* Spacer for visual balance */}
        <section className="py-10 bg-white"></section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
