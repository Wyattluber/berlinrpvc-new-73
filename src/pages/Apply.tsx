
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Users, ShieldCheck, Handshake, FileText, MessageSquare, CheckCircle, AlertTriangle, Loader2, Layout, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import PartnershipRequestForm from '@/components/PartnershipRequestForm';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const Apply = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("team-member");
  const { session } = useAuth();
  
  const handleModeratorApplication = () => {
    if (!session) {
      // If not logged in, redirect to login page with Discord authentication
      toast({
        title: "Anmeldung erforderlich",
        description: "Du musst dich zuerst mit Discord anmelden, um dich bewerben zu können.",
      });
      navigate('/login');
      return;
    }
    
    // If logged in, redirect to the application form
    navigate('/moderator/application');
  };
  
  const handleDiscordManagerApplication = () => {
    if (!session) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Du musst dich zuerst mit Discord anmelden, um dich bewerben zu können.",
      });
      navigate('/login');
      return;
    }
    
    // Check if user is already a moderator (in a real app, you'd fetch this from the database)
    // For now, we'll just show a message
    navigate('/discord-manager/application');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
            Werde Teil von BerlinRP-VC
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Entdecke die Möglichkeiten, dich in unserer Community einzubringen.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-12">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="team-member">Teammitglied werden</TabsTrigger>
            <TabsTrigger value="partner">Partner werden</TabsTrigger>
          </TabsList>
          
          <TabsContent value="team-member">
            <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
              <CardHeader className="py-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Teammitglied-Optionen
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Wähle die Position, für die du dich bewerben möchtest
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader className="py-3">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-green-500" />
                        Moderator werden
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <CardDescription className="text-gray-600 dark:text-gray-400 mb-3">
                        Unterstütze uns bei der Moderation und sorge für eine faire und
                        angenehme Atmosphäre auf unseren Servern.
                      </CardDescription>
                      <Button 
                        className="w-full"
                        onClick={handleModeratorApplication}
                      >
                        Als Moderator bewerben
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader className="py-3">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Layout className="h-5 w-5 text-purple-500" />
                        Discord Manager werden
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <CardDescription className="text-gray-600 dark:text-gray-400 mb-3">
                        Gestalte unseren Discord, halte ihn funktional und bringe
                        Neuerungen in Teammeetings ein. Erfordert vorherige Moderator-Rolle.
                      </CardDescription>
                      <Button 
                        className="w-full"
                        onClick={handleDiscordManagerApplication}
                      >
                        Als Discord Manager bewerben
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-6">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1 mb-2">
                    <Info className="h-4 w-4" />
                    Hinweis
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Für die Bewerbung als Discord Manager musst du bereits als Moderator akzeptiert worden sein.
                    Bei deiner Bewerbung wird geprüft, ob du die notwendigen Voraussetzungen erfüllst.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="partner">
            <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
              <CardHeader className="py-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-yellow-500" />
                  Partner werden
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Werde Partner von BerlinRP-VC und profitiere von unserer Reichweite
                  und Community.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h3 className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1 mb-2">
                      <Info className="h-4 w-4" />
                      Anforderungen für eine Partnerschaft
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-amber-700 dark:text-amber-400 text-sm">
                      <li>Deine Werbung wird in unserem Partnerchannel veröffentlicht</li>
                      <li>Unser Kanal muss in deinem Server im Kanal 🤝｜eigenwerbung abonniert und verlinkt sein</li>
                      <li>Alle 2 Tage wird eine Nachricht mit @everyone Ping von unserem Server in eurem Partnerchannel gesendet</li>
                      <li>Gegenseitige Promotion und aktiver Austausch zwischen den Communities</li>
                    </ul>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Vorteile einer Partnerschaft:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                      <li>Erhöhte Sichtbarkeit in unserer Community</li>
                      <li>Cross-Promotion auf unseren Plattformen</li>
                      <li>Zugang zu gemeinsamen Events</li>
                      <li>Exklusive Zusammenarbeitsmöglichkeiten</li>
                    </ul>
                  </div>
                  <Button asChild className="w-full md:w-auto">
                    <Link to="/partners">Mehr über Partnerschaften erfahren</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {!session ? (
              <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
                <CardContent className="p-6 text-center">
                  <Info className="h-10 w-10 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-lg font-medium mb-2">Anmeldung erforderlich</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Du musst dich anmelden, um eine Partnerschaftsanfrage zu stellen.
                  </p>
                  <Button 
                    onClick={() => navigate('/login')}
                    className="mx-auto"
                  >
                    Zur Anmeldung
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <PartnershipRequestForm />
            )}
          </TabsContent>
        </Tabs>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Häufig gestellte Fragen
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Wie kann ich mich als Teammitglied bewerben?</AccordionTrigger>
              <AccordionContent>
                Um dich als Teammitglied zu bewerben, wähle die gewünschte Position aus und klicke auf den entsprechenden Bewerbungs-Button.
                Du wirst zum Discord-Login weitergeleitet, um deine Identität zu bestätigen, falls du nicht bereits angemeldet bist.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Welche Vorteile habe ich als Moderator?</AccordionTrigger>
              <AccordionContent>
                Als Moderator hast du die Möglichkeit, aktiv die Community mitzugestalten
                und für eine positive Atmosphäre zu sorgen. Zudem erhältst du exklusive
                Einblicke und kannst dich mit anderen Moderatoren austauschen.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Was sind die Anforderungen für Discord Manager?</AccordionTrigger>
              <AccordionContent>
                Als Discord Manager solltest du bereits als Moderator tätig sein und gute Kenntnisse
                über Discord-Funktionen haben. Kreativität und ein Auge für benutzerfreundliche
                Gestaltung sind wichtige Voraussetzungen für diese Rolle. Die Bewerbung als Discord Manager
                erfordert, dass du bereits als Moderator akzeptiert worden bist.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Wie funktioniert eine Partnerschaft mit BerlinRP-VC?</AccordionTrigger>
              <AccordionContent>
                Eine Partnerschaft mit uns bietet dir die Möglichkeit, deine Marke oder
                dein Projekt einem breiten Publikum vorzustellen. Unsere Werbung wird in eurem Partnerchannel 
                veröffentlicht, und eure Werbung bei uns. Euer Kanal muss unseren Kanal 🤝｜eigenwerbung abonnieren 
                und verlinken. Alle 2 Tage wird eine Nachricht mit @everyone Ping von unserem Server in eurem 
                Partnerchannel gesendet.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Was macht ein Discord Manager?</AccordionTrigger>
              <AccordionContent>
                Als Discord Manager bist du verantwortlich für die Gestaltung und Funktionalität unseres Discord-Servers.
                Du bringst Neuerungen in Teammeetings ein, überwachst die Einhaltung der Regeln und kannst Teamler auf Fehler
                hinweisen. Diese Position erfordert vorherige Erfahrung als Moderator.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger>Welche Anforderungen gibt es für eine Partnerschaft?</AccordionTrigger>
              <AccordionContent>
                Für eine Partnerschaft müssen folgende Anforderungen erfüllt sein: Deine Werbung wird in unserem 
                Partnerchannel veröffentlicht. Unser Kanal muss in deinem Server im Kanal 🤝｜eigenwerbung abonniert 
                und verlinkt sein. Alle 2 Tage wird eine Nachricht mit @everyone Ping von unserem Server in eurem 
                Partnerchannel gesendet. Wir erwarten zudem aktiven Austausch zwischen unseren Communities.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Apply;
