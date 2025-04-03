
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Partners = () => {
  // Partner logos and information
  const partners = [
    {
      name: "Rettungsdienst Berlin",
      logo: "/lovable-uploads/dd1f41c8-840e-4e30-a847-665d1ef1d0b1.png",
      description: "Offizieller Partner für Rettungsdienst-Simulationen und Notfalltraining.",
      website: "https://example.com/rettungsdienst"
    },
    {
      name: "Berliner Feuerwehr Simulation",
      logo: "/lovable-uploads/facc787d-f5d9-4ce8-9d2b-2c329ba5f0cd.png",
      description: "Partner für realistische Feuerwehr-Einsatzszenarien und Ausbildung.",
      website: "https://example.com/feuerwehr"
    },
    {
      name: "Polizei Berlin RP",
      logo: "/placeholder.svg",
      description: "Zusammenarbeit bei der Simulation von Polizeieinsätzen und Verkehrskontrollen.",
      website: "https://example.com/polizei"
    }
  ];

  // Custom styles for partner cards with hover effects
  const style = `
    .partner-card {
      transition: all 0.3s ease;
      transform-origin: center;
    }
    .partner-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .partner-logo {
      transition: all 0.5s ease;
    }
    .partner-card:hover .partner-logo {
      transform: scale(1.05);
    }
    .partner-link {
      position: relative;
      overflow: hidden;
    }
    .partner-link::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(to right, #3b82f6, #6366f1);
      transition: width 0.3s ease;
    }
    .partner-card:hover .partner-link::after {
      width: 100%;
    }
  `;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Add the custom CSS */}
        <style>{style}</style>
        
        {/* Header Section */}
        <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Unsere Partner</h1>
            <p className="text-xl mb-6 max-w-3xl mx-auto">
              BerlinRP-VC arbeitet mit verschiedenen Partnern zusammen, um das bestmögliche Roleplay-Erlebnis zu bieten.
            </p>
          </div>
        </section>

        {/* Partners Section */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {partners.map((partner, index) => (
                <div 
                  key={index} 
                  className="partner-card bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 flex flex-col"
                >
                  <div className="h-48 bg-gray-50 flex items-center justify-center p-6">
                    <img 
                      src={partner.logo} 
                      alt={partner.name} 
                      className="partner-logo max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-bold mb-3 text-gray-800">{partner.name}</h3>
                    <p className="text-gray-600 mb-4">{partner.description}</p>
                  </div>
                  <div className="px-6 pb-6">
                    <a 
                      href={partner.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="partner-link inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Besuche Website
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Partnership CTA */}
            <div className="mt-16 text-center">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Interessiert an einer Partnerschaft?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Wir sind immer auf der Suche nach neuen Partnerschaften, um unsere Community zu erweitern und 
                das Spielerlebnis zu verbessern.
              </p>
              <a 
                href="mailto:info@berlinrpvc.de" 
                className="inline-block px-6 py-3 rounded-md bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium hover:from-blue-700 hover:to-indigo-800 transition-colors duration-300"
              >
                Kontaktiere uns
              </a>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-10 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Was unsere Partner sagen
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <p className="italic text-gray-600 mb-4">
                  "Die Zusammenarbeit mit BerlinRP-VC hat unsere Community enorm bereichert. 
                  Die Professionalität und Leidenschaft des Teams sind wirklich beeindruckend."
                </p>
                <p className="font-bold">- Leiter des Rettungsdienstes Berlin</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <p className="italic text-gray-600 mb-4">
                  "Durch unsere Partnerschaft mit BerlinRP-VC können wir realistische Einsatzszenarien 
                  simulieren und unsere Mitglieder optimal trainieren."
                </p>
                <p className="font-bold">- Koordinator der Berliner Feuerwehr Simulation</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Partners;
