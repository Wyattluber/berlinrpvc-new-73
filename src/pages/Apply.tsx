
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

const Apply = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("team-member");

  const handleModeratorApplication = () => {
    // Redirect to login page first, which uses Discord authentication
    toast({
      title: "Weiterleitung",
      description: "Du wirst zur Login-Seite weitergeleitet, um dich mit Discord anzumelden.",
    });
    navigate('/login');
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
                        onClick={handleModeratorApplication}
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
                    Bitte melde dich erst an, um fortzufahren.
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
              </CardContent>
            </Card>
            
            <PartnershipRequestForm />
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
                Du wirst zum Discord-Login weitergeleitet, um deine Identität zu bestätigen.
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
                dein Projekt einem breiten Publikum vorzustellen. Kontaktiere uns für
                weitere Informationen und individuelle Vereinbarungen.
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
          </Accordion>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Apply;
