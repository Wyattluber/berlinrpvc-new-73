
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const jobRoles = [
  {
    title: "Sanitätsdienst",
    description: "Als Sanitäter bist du für die medizinische Erstversorgung zuständig. Du rückst zu Notfällen aus und transportierst Patienten ins Krankenhaus.",
    tasks: [
      "Notfallversorgung und Erste Hilfe",
      "Patientendokumentation",
      "Koordination mit Krankenhäusern",
      "Teamarbeit mit anderen Rettungskräften"
    ],
    requirement: "Grundkenntnisse über Erste Hilfe von Vorteil"
  },
  {
    title: "Feuerwehr",
    description: "Als Feuerwehrmann/frau bekämpfst du Brände, rettest Personen aus Gefahrensituationen und unterstützt bei technischen Hilfeleistungen.",
    tasks: [
      "Brandbekämpfung",
      "Technische Hilfeleistung",
      "Personenrettung",
      "Enge Zusammenarbeit mit anderen Diensten"
    ],
    requirement: "Technisches Verständnis und Teamfähigkeit"
  },
  {
    title: "Polizei",
    description: "Als Polizist/in sorgst du für Ordnung und Sicherheit. Du bearbeitest Einsätze, führst Verkehrskontrollen durch und unterstützt bei Großeinsätzen.",
    tasks: [
      "Streifen- und Einsatzdienst",
      "Verkehrskontrollen",
      "Unfallaufnahme",
      "Ermittlungsarbeit bei Straftaten"
    ],
    requirement: "Kenntnisse der Gesetzeslage von Vorteil"
  }
];

const Apply = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header Section */}
        <section className="bg-hamburg-blue text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Werde Teil des Teams</h1>
            <p className="text-xl mb-6 max-w-3xl mx-auto">
              Entdecke die verfügbaren Positionen in unserem Notruf Hamburg Team und finde heraus, 
              welche Rolle am besten zu dir passt.
            </p>
            <Button size="lg" className="bg-hamburg-red hover:bg-red-700">
              <Link to="/apply/form">Direkt zur Bewerbung</Link>
            </Button>
          </div>
        </section>

        {/* Job Roles Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center text-hamburg-blue">Verfügbare Positionen</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobRoles.map((role, index) => (
                <Card key={index} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle>{role.title}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <h4 className="font-semibold mb-2">Aufgaben:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {role.tasks.map((task, i) => (
                        <li key={i}>{task}</li>
                      ))}
                    </ul>
                    <div className="mt-4">
                      <h4 className="font-semibold mb-1">Voraussetzung:</h4>
                      <p className="text-sm">{role.requirement}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-hamburg-blue hover:bg-blue-800">
                      <Link to="/apply/form" className="w-full">Jetzt Bewerben</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center text-hamburg-blue">Allgemeine Anforderungen</h2>
            
            <div className="bg-white shadow-md rounded-lg p-8 max-w-3xl mx-auto">
              <h3 className="font-bold text-xl mb-4 text-hamburg-blue">Das erwarten wir von dir:</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-hamburg-red font-bold mr-2">•</span>
                  <span>Mindestalter: 16 Jahre</span>
                </li>
                <li className="flex items-start">
                  <span className="text-hamburg-red font-bold mr-2">•</span>
                  <span>Aktive Teilnahme am Server und Discord</span>
                </li>
                <li className="flex items-start">
                  <span className="text-hamburg-red font-bold mr-2">•</span>
                  <span>Teamfähigkeit und respektvoller Umgang</span>
                </li>
                <li className="flex items-start">
                  <span className="text-hamburg-red font-bold mr-2">•</span>
                  <span>Bereitschaft, sich in neue Themen einzuarbeiten</span>
                </li>
                <li className="flex items-start">
                  <span className="text-hamburg-red font-bold mr-2">•</span>
                  <span>Zuverlässigkeit und Engagement</span>
                </li>
                <li className="flex items-start">
                  <span className="text-hamburg-red font-bold mr-2">•</span>
                  <span>Funktionierendes Mikrofon und TS3/Discord</span>
                </li>
              </ul>
              
              <div className="text-center">
                <Button size="lg" className="bg-hamburg-red hover:bg-red-700">
                  <Link to="/apply/form">Bewerbungsformular öffnen</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Apply;
