
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Updated job description with emoji formatting and corrected age requirement
const jobDescription = {
  title: "Moderator",
  description: "Als Moderator hilfst du, den Server für alle Mitglieder angenehm zu gestalten. Du löst Konflikte, bearbeitest Tickets und unterstützt bei Veranstaltungen.",
  tasks: [
    "Löse Ingame-Probleme & schlichte Konflikte",
    "Teilnahme an wöchentlichen Team-Meetings",
    "Unterstützung bei Server-Events",
    "Mitarbeit im Support-Bereich"
  ],
  requirement: "Mindestens 14 Jahre alt, aktiv auf Discord und im Spiel",
  details: [
    {
      title: "📌 Teamkleidung",
      items: [
        "👕 Die Teamkleidung kostet 10 Robux pro Stück und wird nicht gestellt.",
        "💰 Falls neue Kleidung erscheint, gibt es eine teilweise Erstattung."
      ],
      additionalInfo: [
        "Aktueller Stand:",
        "👕 Shirt – Wird am 22.03.25 im Team vorgestellt.",
        "👖 Optionale Hose – Noch nicht kaufbar."
      ]
    },
    {
      title: "📌 Teammeetings",
      items: [
        "📅 Wann? Jeden Samstag um 19:00 Uhr in der Teamstage.",
        "📢 Hier besprechen die Admins wichtige Neuerungen und Änderungen.",
        "📝 Ob das Meeting stattfindet, siehst du in den Discord-Events."
      ],
      warning: "⚠ Wichtig: Wenn du dich nicht abmeldest und unentschuldigt fehlst, erhältst du einen Warn."
    },
    {
      title: "📌 Warnsystem für Teammitglieder",
      items: [
        "🔹 Warns sind nur für Teammitglieder & Admins einsehbar.",
        "🔹 Nach drei Warns wirst du geloggt.",
        "🔹 Beim vierten Warn: Verlust der Teamrolle & in der Regel ein Bann von allen Plattformen.",
        "🔹 Schwerwiegendes Fehlverhalten kann zu einer direkten Sperre ohne vorherige Warnstufen führen."
      ]
    },
    {
      title: "📌 Online-Präsenz bei Serverstart",
      items: [
        "Wenn der Server online geht, solltest du sofort beitreten, um die Sichtbarkeit in der öffentlichen Serverliste zu verbessern."
      ]
    },
    {
      title: "📌 Tickets & Voicechat-Support",
      items: [
        "🎫 Tickets & Voicechat-Support können nur von Teammitgliedern mit der \"Ticket Support\"-Rolle bearbeitet werden.",
        "👥 Diese Rolle erhältst du, wenn du Interesse zeigst und deine Aktivität von den zuständigen Leitern als geeignet bewertet wird."
      ]
    },
    {
      title: "📌 Feedback & Verbesserungsvorschläge",
      items: [
        "💡 Deine Ideen sind gefragt! Feedback hilft uns, das Spielerlebnis und die Teamstruktur stetig zu verbessern."
      ]
    },
    {
      title: "📌 Moderator-Aufgaben",
      items: [
        "🔹 Löse Ingame-Probleme & schlichte Konflikte.",
        "🔹 Missbrauch von Mod-Rechten führt zur sofortigen Degradierung.",
        "🔹 Schwere Regelverstöße können zu einem sofortigen Bann führen – ohne vorherige Warnstufen."
      ]
    }
  ]
};

const Apply = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Check if user is already admin/moderator before allowing to apply
  const checkUserStatus = async () => {
    setIsLoading(true);
    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Anmeldung erforderlich",
          description: "Du musst angemeldet sein, um dich zu bewerben.",
        });
        navigate('/login');
        return;
      }
      
      // Check if user is already an admin or moderator
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();
        
      if (adminData) {
        setShowAlert(true);
        return;
      }
      
      // Check if user already has a pending application
      const { data: applicationData } = await supabase
        .from('applications')
        .select('id, status')
        .eq('user_id', session.user.id)
        .maybeSingle();
        
      if (applicationData) {
        toast({
          title: "Bewerbung bereits eingereicht",
          description: "Du hast bereits eine Bewerbung eingereicht. Bitte prüfe den Status in deinem Profil.",
        });
        navigate('/profile');
        return;
      }
      
      // If all checks pass, proceed to application form
      navigate('/apply/form');
      
    } catch (error) {
      console.error('Error checking user status:', error);
      toast({
        title: "Fehler",
        description: "Es gab ein Problem bei der Überprüfung deines Benutzerstatus.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header Section */}
        <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Werde Teil des Teams</h1>
            <p className="text-xl mb-6 max-w-3xl mx-auto">
              Entdecke die verfügbaren Positionen in unserem BerlinRP-VC Team und finde heraus, 
              welche Rolle am besten zu dir passt.
            </p>
            <Button 
              size="lg" 
              onClick={checkUserStatus}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0"
            >
              {isLoading ? 'Bitte warten...' : 'Jetzt bewerben'}
            </Button>
          </div>
        </section>

        {showAlert && (
          <div className="container mx-auto px-4 py-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Bewerbung nicht möglich</AlertTitle>
              <AlertDescription>
                Du bist bereits Teammitglied und kannst dich nicht erneut bewerben.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Job Role Section */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Stellenbeschreibung: Moderator
            </h2>
            
            <div className="max-w-4xl mx-auto">
              <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                  <CardTitle>{jobDescription.title}</CardTitle>
                  <CardDescription className="text-blue-100">{jobDescription.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow divide-y space-y-4">
                  {/* Main tasks */}
                  <div className="pt-2">
                    <h4 className="font-semibold mb-2">Aufgaben:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {jobDescription.tasks.map((task, i) => (
                        <li key={i}>{task}</li>
                      ))}
                    </ul>
                    <div className="mt-4">
                      <h4 className="font-semibold mb-1">Voraussetzung:</h4>
                      <p>{jobDescription.requirement}</p>
                    </div>
                  </div>
                  
                  {/* Detailed sections */}
                  <div className="pt-4 space-y-6">
                    <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                      Alles über den Bereich Moderation für Interessierte
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">BerlinRP-VC | Stand: 04. April 2025</p>
                    
                    {jobDescription.details.map((section, index) => (
                      <div key={index} className="space-y-2">
                        <h4 className="font-bold mb-1">{section.title}</h4>
                        <ul className="list-none space-y-2">
                          {section.items.map((item, i) => (
                            <li key={i} className="pl-1">{item}</li>
                          ))}
                        </ul>
                        
                        {section.additionalInfo && (
                          <div className="mt-2 pl-1">
                            <p className="font-medium">{section.additionalInfo[0]}</p>
                            <ul className="list-none ml-1 mt-1">
                              {section.additionalInfo.slice(1).map((info, i) => (
                                <li key={i}>{info}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {section.warning && (
                          <p className="mt-2 text-amber-700 font-medium pl-1">
                            {section.warning}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-gradient-to-r from-blue-50 to-indigo-50">
                  <Button 
                    onClick={checkUserStatus}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 border-0"
                  >
                    {isLoading ? 'Bitte warten...' : 'Jetzt bewerben'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Requirements Section */}
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
                  <span>Mindestalter: 14 Jahre</span>
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
                  <span>Funktionierendes Mikrofon und Discord</span>
                </li>
              </ul>
              
              <div className="text-center">
                <Button 
                  size="lg" 
                  onClick={checkUserStatus}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0"
                >
                  {isLoading ? 'Bitte warten...' : 'Jetzt bewerben'}
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
