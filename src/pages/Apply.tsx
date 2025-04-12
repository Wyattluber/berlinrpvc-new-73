
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Shield, AlertCircle, ServerCrash, Server } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const partnerServerDescription = {
  title: "Partner Server",
  description: "Werde offizieller Partner von BerlinRP-VC! Tausche Discord-Einladungen aus und profitiere von gegenseitiger Werbung und Community-Austausch.",
  benefits: [
    "Erhöhte Sichtbarkeit in unserer Community",
    "Zugang zu gemeinsamen Events",
    "Gegenseitige Bewerbung",
    "Austausch und Netzwerke"
  ],
  requirements: [
    "Aktiver Discord-Server mit mindestens 50 Mitgliedern",
    "Thematischer Bezug zu Roleplay, Berlin, oder Gaming",
    "Einhaltung der Discord Community-Richtlinien"
  ]
};

const Apply = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [activeTab, setActiveTab] = useState("moderator");
  const [authError, setAuthError] = useState(false);

  const checkUserStatus = async (applicationType: string) => {
    setIsLoading(true);
    
    try {
      // First check if there's a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error checking session:', sessionError);
        throw sessionError;
      }
      
      if (!session) {
        toast({
          title: "Anmeldung erforderlich",
          description: "Du musst angemeldet sein, um dich zu bewerben.",
        });
        navigate('/login');
        return;
      }
      
      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();
        
      if (adminError) {
        console.error('Error checking admin status:', adminError);
        // Continue with the flow, as this is not a critical error
      }
        
      if (adminData) {
        setShowAlert(true);
        return;
      }
      
      // Check if user already has an application
      let existingApplication;
      let existingAppError;
      
      if (applicationType === 'moderator') {
        const { data, error } = await supabase
          .from('applications')
          .select('id, status')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        existingApplication = data;
        existingAppError = error;
      } else if (applicationType === 'partner') {
        const { data, error } = await supabase
          .from('partner_applications')
          .select('id, status')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        existingApplication = data;
        existingAppError = error;
      }
      
      if (existingAppError) {
        console.error('Error checking existing application:', existingAppError);
        // Continue with the flow if there's an error checking existing applications
      }
      
      if (existingApplication) {
        toast({
          title: "Bewerbung bereits eingereicht",
          description: `Du hast bereits eine ${applicationType === 'moderator' ? 'Moderator' : 'Partner'}-Bewerbung eingereicht. Bitte prüfe den Status in deinem Profil.`,
        });
        navigate('/profile');
        return;
      }
      
      // Navigate to appropriate form
      if (applicationType === 'moderator') {
        navigate('/apply/form');
      } else if (applicationType === 'partner') {
        navigate('/apply/partner-form');
      }
      
    } catch (error) {
      console.error('Error checking user status:', error);
      setAuthError(true);
      toast({
        title: "Fehler",
        description: "Es gab ein Problem bei der Überprüfung deines Benutzerstatus. Du wirst zur Anmeldeseite weitergeleitet.",
        variant: "destructive"
      });
      
      // Fallback: If authentication checks fail, redirect to login
      setTimeout(() => navigate('/login'), 1500);
    } finally {
      setIsLoading(false);
    }
  };

  // Direct navigation function that skips checks in case of auth errors
  const handleDirectNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Werde Teil unserer Community</h1>
            <p className="text-xl mb-6 max-w-3xl mx-auto">
              Entdecke die verfügbaren Möglichkeiten, Teil von BerlinRP-VC zu werden und 
              finde heraus, welche Option am besten zu dir passt.
            </p>
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

        {authError && (
          <div className="container mx-auto px-4 py-6">
            <Alert variant="warning" className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Authentifizierungsproblem</AlertTitle>
              <AlertDescription className="text-amber-700">
                Es gibt ein Problem mit der Authentifizierung. Du kannst trotzdem fortfahren, 
                musst dich aber später anmelden.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <section className="py-10 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="moderator" className="max-w-4xl mx-auto" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="moderator" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Moderator werden</span>
                </TabsTrigger>
                <TabsTrigger value="partner" className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  <span>Partner werden</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="moderator">
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
                    </CardFooter>
                  </Card>
                </div>
                
                <section className="py-16">
                  <div className="container mx-auto px-4">
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
                          onClick={() => isLoading || authError ? handleDirectNavigation('/apply/form') : checkUserStatus('moderator')}
                          disabled={isLoading && !authError}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0"
                        >
                          {isLoading ? 'Bitte warten...' : 'Als Moderator bewerben'}
                        </Button>
                        
                        {authError && (
                          <p className="text-sm text-amber-600 mt-2">
                            Bei Authentifizierungsproblemen wirst du später nach deinen Anmeldedaten gefragt.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </TabsContent>
              
              <TabsContent value="partner">
                <h2 className="text-3xl font-bold mb-10 text-center bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
                  Partnerschaft mit BerlinRP-VC
                </h2>
                
                <div className="max-w-4xl mx-auto">
                  <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden bg-gradient-to-br from-white to-indigo-50">
                    <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
                      <CardTitle>{partnerServerDescription.title}</CardTitle>
                      <CardDescription className="text-indigo-100">{partnerServerDescription.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow divide-y space-y-4">
                      <div className="pt-2">
                        <h4 className="font-semibold mb-2">Vorteile einer Partnerschaft:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {partnerServerDescription.benefits.map((benefit, i) => (
                            <li key={i}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="pt-4">
                        <h4 className="font-semibold mb-2">Voraussetzungen:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {partnerServerDescription.requirements.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t bg-gradient-to-r from-indigo-50 to-purple-50">
                    </CardFooter>
                  </Card>
                </div>
                
                <section className="py-16">
                  <div className="container mx-auto px-4">
                    <div className="bg-gradient-to-br from-white to-indigo-50 shadow-md rounded-lg p-8 max-w-3xl mx-auto border border-indigo-100">
                      <h3 className="font-bold text-xl mb-4 text-indigo-700">Wie läuft eine Partnerschaft ab?</h3>
                      <p className="mb-4">Nach der Bewerbung prüft unser Team deine Anfrage. Bei positiver Bewertung tauschen wir Discord-Einladungen aus und platzieren gegenseitige Werbung auf den jeweiligen Servern.</p>
                      <p className="mb-6">Wir freuen uns auf eine erfolgreiche Zusammenarbeit mit deinem Server!</p>
                      
                      <div className="text-center">
                        <Button 
                          size="lg" 
                          onClick={() => isLoading || authError ? handleDirectNavigation('/apply/partner-form') : checkUserStatus('partner')}
                          disabled={isLoading && !authError}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-0"
                        >
                          {isLoading ? 'Bitte warten...' : 'Als Partner bewerben'}
                        </Button>
                        
                        {authError && (
                          <p className="text-sm text-amber-600 mt-2">
                            Bei Authentifizierungsproblemen wirst du später nach deinen Anmeldedaten gefragt.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Apply;
