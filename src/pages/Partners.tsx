
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Partners = () => {
  // Partner discord servers information
  const partners = [
    {
      name: "RP DE VC",
      logo: "/placeholder.svg",
      description: "Discord RP Partner (Die Partnerschaft läuft aus, da der Link nicht mehr gültig ist)",
      website: "https://discord.gg/5P8xcTc3",
      owner: "aby_got_aim",
      color: "from-blue-500 to-purple-600" // Added color gradient
    },
    {
      name: "Roleplay Unite 🇩🇪(vc)",
      logo: "/placeholder.svg",
      description: "Discord RP Partner für Voice Chat Roleplay",
      website: "https://discord.gg/pDpDHtSqgU",
      owner: "lucakautschek",
      color: "from-green-500 to-emerald-600" // Added color gradient
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-12 bg-gradient-to-b from-blue-50 to-white">
        {/* Header Section */}
        <section className="mb-12">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Unsere Partner
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                BerlinRP-VC arbeitet mit verschiedenen Discord-Servern zusammen, um das bestmögliche 
                Roleplay-Erlebnis zu bieten.
              </p>
            </div>
          </div>
        </section>

        {/* Partners Grid */}
        <section className="mb-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {partners.map((partner, index) => (
                <div 
                  key={index} 
                  className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-100"
                >
                  {/* Colorful top border */}
                  <div className={`h-2 bg-gradient-to-r ${partner.color} w-full`}></div>
                  
                  {/* Background gradient effect on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${partner.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-xl font-bold bg-gradient-to-r ${partner.color} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}>
                        {partner.name}
                      </h3>
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br ${partner.color} bg-opacity-10 p-1 group-hover:scale-110 transition-transform duration-300`}>
                        <img 
                          src={partner.logo} 
                          alt={partner.name} 
                          className="w-10 h-10 object-contain" 
                        />
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{partner.description}</p>
                    
                    {partner.owner && (
                      <p className="text-sm text-gray-500 mb-6">
                        <span className="font-medium">Owner:</span> {partner.owner}
                      </p>
                    )}
                    
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <a 
                        href={partner.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`inline-flex items-center font-medium relative bg-gradient-to-r ${partner.color} bg-clip-text text-transparent`}
                      >
                        <span className="relative z-10 transition-colors duration-300 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-1 after:w-0 after:bg-gradient-to-r after:from-blue-500 after:to-purple-600 after:transition-all after:duration-300 group-hover:after:w-full">
                          Discord beitreten
                        </span>
                        <svg 
                          className="ml-2 w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Become a Partner - with more vibrant colors */}
        <section className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 py-16 rounded-3xl mx-4 md:mx-8 lg:mx-16 shadow-lg border border-blue-200">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Möchtest du Partner werden?
            </h2>
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
              Wir sind immer auf der Suche nach neuen Discord-Servern, mit denen wir zusammenarbeiten können, 
              um unsere Community zu erweitern und das Spielerlebnis zu verbessern.
            </p>
            <a 
              href="mailto:info@berlinrpvc.de" 
              className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg hover:scale-105 transform"
            >
              Kontaktiere uns
            </a>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Partners;
