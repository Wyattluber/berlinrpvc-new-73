import React from 'react'; import Navbar from '../components/Navbar'; import Footer from '../components/Footer'; import { Button } from '@/components/ui/button'; import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; import { Link } from 'react-router-dom'; import { ExternalLink } from 'lucide-react';

const Index = () => { return ( <div className="flex flex-col min-h-screen"> <Navbar />

<main className="flex-grow mt-0 z-10">
    {/* Hero Section */}
    <section className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent opacity-20"></div>
      </div>
      <div className="container mx-auto px-4 text-center relative z-[1]">
        <div className="w-full max-w-3xl mx-auto mb-8">
          <img 
            src="/lovable-uploads/facc787d-f5d9-4ce8-9d2b-2c329ba5f0cd.png" 
            alt="BerlinRP-VC" 
            className="w-full h-auto max-h-72 object-contain mx-auto filter drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]"
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
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 text-center grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl">
        <div className="bg-gray-100 p-6 rounded-xl shadow-sm">
          <h3 className="text-2xl font-semibold text-indigo-600">+500</h3>
          <p className="text-gray-700">Mitglieder</p>
        </div>
        <div className="bg-gray-100 p-6 rounded-xl shadow-sm">
          <h3 className="text-2xl font-semibold text-indigo-600">+50</h3>
          <p className="text-gray-700">Tägliche Spieler</p>
        </div>
        <div className="bg-gray-100 p-6 rounded-xl shadow-sm">
          <h3 className="text-2xl font-semibold text-indigo-600">+30</h3>
          <p className="text-gray-700">Bewerbungen pro Woche</p>
        </div>
      </div>
    </section>

    {/* Coming Soon Section */}
    <section className="py-24 bg-gray-100 relative text-center">
      <div className="absolute top-8 right-8 rotate-12 text-gray-300 text-5xl font-black tracking-widest opacity-30 select-none">
        COMING SOON
      </div>
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Neueste Änderungen</h2>
        <p className="mb-6 text-gray-600">Changelog und Community Highlights bald verfügbar.</p>
        <div className="border-dashed border-4 border-gray-400 rounded-xl py-20">Stempelartige Visualisierung geplant</div>
      </div>
    </section>

    {/* Team Section */}
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-12 text-indigo-700">Unser Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Founder */}
          <div className="bg-white p-6 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 hover:rotate-1">
            <img src="https://cdn.discordapp.com/avatars/1150411455443783795/4255ccaf55b3d9ecdddcabe4e6d53fc5?size=1024" alt="Founder" className="w-24 h-24 rounded-full mx-auto mb-4 shadow-md" />
            <h3 className="text-indigo-600 font-bold">Founder</h3>
            <p className="text-lg font-semibold">◤✞𝕯𝖆𝖗𝖐 𝕬𝖓𝖌𝖊𝖑✞◥</p>
          </div>
          {/* Co-Founder */}
          <div className="bg-white p-6 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 hover:-rotate-1">
            <img src="https://cdn.discordapp.com/avatars/1020320597936439429/0328f839138b450d1029f2c582f4f4e0?size=1024" alt="Co-Founder" className="w-24 h-24 rounded-full mx-auto mb-4 shadow-md" />
            <h3 className="text-indigo-600 font-bold">Co-Founder</h3>
            <p className="text-lg font-semibold">Backtrix_23 | Berlin RP-VC</p>
          </div>
          {/* Weitere Rollen */}
          <div className="bg-white p-6 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105">
            <h3 className="text-indigo-600 font-bold">Teamleiter & Moderatoren</h3>
            <p className="text-gray-600">Wird eingetragen...</p>
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

); };

export default Index;


