
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Updated job roles with the detailed moderator description
const jobRoles = [
  {
    title: "Moderator",
    description: "Als Moderator hilfst du, den Server für alle Mitglieder angenehm zu gestalten. Du löst Konflikte, bearbeitest Tickets und unterstützt bei Veranstaltungen.",
    tasks: [
      "Löse Ingame-Probleme & schlichte Konflikte",
      "Teilnahme an wöchentlichen Team-Meetings",
      "Unterstützung bei Server-Events",
      "Mitarbeit im Support-Bereich"
    ],
    requirement: "Mindestens 16 Jahre alt, aktiv auf Discord und im Spiel",
    details: (
      <div className="mt-4 text-sm space-y-4 border-t pt-4">
        <div>
          <h4 className="font-bold mb-1">📌 Teamkleidung</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Die Teamkleidung kostet 10 Robux pro Stück und wird nicht gestellt</li>
            <li>Falls neue Kleidung erscheint, gibt es eine teilweise Erstattung</li>
          </ul>
          <p className="mt-1 font-medium">Aktueller Stand:</p>
          <ul className="list-disc list-inside">
            <li>Shirt – Wird am 22.03.25 im Team vorgestellt</li>
            <li>Optionale Hose – Noch nicht kaufbar</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-1">📌 Teammeetings</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Wann? Jeden Samstag um 19:00 Uhr in der Teamstage</li>
            <li>Hier besprechen die Admins wichtige Neuerungen und Änderungen</li>
            <li>Ob das Meeting stattfindet, siehst du in den Discord-Events</li>
          </ul>
          <p className="mt-1 text-amber-700 font-medium">Wichtig: Wenn du dich nicht abmeldest und unentschuldigt fehlst, erhältst du einen Warn</p>
        </div>
        
        <div>
          <h4 className="font-bold mb-1">📌 Warnsystem für Teammitglieder</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Warns sind nur für Teammitglieder & Admins einsehbar</li>
            <li>Nach drei Warns wirst du geloggt</li>
            <li>Beim vierten Warn: Verlust der Teamrolle & in der Regel ein Bann von allen Plattformen</li>
            <li>Schwerwiegendes Fehlverhalten kann zu einer direkten Sperre ohne vorherige Warnstufen führen</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-1">📌 Online-Präsenz bei Serverstart</h4>
          <p>Wenn der Server online geht, solltest du sofort beitreten, um die Sichtbarkeit in der öffentlichen Serverliste zu verbessern.</p>
        </div>
        
        <div>
          <h4 className="font-bold mb-1">📌 Tickets & Voicechat-Support</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Tickets & Voicechat-Support können nur von Teammitgliedern mit der „Ticket Support"-Rolle bearbeitet werden</li>
            <li>Diese Rolle erhältst du, wenn du Interesse zeigst und deine Aktivität von den zuständigen Leitern als geeignet bewertet wird</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-1">📌 Feedback & Verbesserungsvorschläge</h4>
          <p>Deine Ideen sind gefragt! Feedback hilft uns, das Spielerlebnis und die Teamstruktur stetig zu verbessern.</p>
        </div>
      </div>
    )
  }
];

const Apply = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header Section - Updated with gradient */}
        <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Werde Teil des Teams</h1>
            <p className="text-xl mb-6 max-w-3xl mx-auto">
              Entdecke die verfügbaren Positionen in unserem BerlinRP-VC Team und finde heraus, 
              welche Rolle am besten zu dir passt.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0">
              <Link to="/apply/form">Direkt zur Bewerbung</Link>
            </Button>
          </div>
        </section>

        {/* Job Roles Section - Updated with gradient backgrounds */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Bewirb dich als Moderator
            </h2>
            
            <div className="max-w-4xl mx-auto">
              {jobRoles.map((role, index) => (
                <Card key={index} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden bg-gradient-to-br from-white to-blue-50">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                    <CardTitle>{role.title}</CardTitle>
                    <CardDescription className="text-blue-100">{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <h4 className="font-semibold mb-2">Aufgaben:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {role.tasks.map((task, i) => (
                        <li key={i}>{task}</li>
                      ))}
                    </ul>
                    <div className="mt-4">
                      <h4 className="font-semibold mb-1">Voraussetzung:</h4>
                      <p>{role.requirement}</p>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                        Alles über den Bereich Moderation für Interessierte
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">BerlinRP-VC | 21. März 2025</p>
                      <h4 className="font-bold mb-3">Schritt 2: Deine Aufgaben als Moderator</h4>
                      {role.details}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gradient-to-r from-blue-50 to-indigo-50">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 border-0">
                      <Link to="/apply/form" className="w-full">Jetzt Bewerben</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements Section - Updated with gradients */}
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Allgemeine Anforderungen
            </h2>
            
            <div className="bg-gradient-to-br from-white to-blue-50 shadow-md rounded-lg p-8 max-w-3xl mx-auto border border-blue-100">
              <h3 className="font-bold text-xl mb-4 text-blue-700">Das erwarten wir von dir:</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-indigo-600 font-bold mr-2">•</span>
                  <span>Mindestalter: 16 Jahre</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 font-bold mr-2">•</span>
                  <span>Aktive Teilnahme am Server und Discord</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 font-bold mr-2">•</span>
                  <span>Teamfähigkeit und respektvoller Umgang</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 font-bold mr-2">•</span>
                  <span>Bereitschaft, sich in neue Themen einzuarbeiten</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 font-bold mr-2">•</span>
                  <span>Zuverlässigkeit und Engagement</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 font-bold mr-2">•</span>
                  <span>Funktionierendes Mikrofon und TS3/Discord</span>
                </li>
              </ul>
              
              <div className="text-center">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0">
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
