
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, UserCheckIcon, ShieldAlertIcon, Users, Link as LinkIcon } from 'lucide-react';
import PartnershipRequestForm from '@/components/PartnershipRequestForm';

const Apply = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [applicationTab, setApplicationTab] = useState('team');

  const handleApplyClick = () => {
    if (session) {
      navigate('/apply/form');
    } else {
      navigate('/login', { state: { from: '/apply/form' } });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-gradient-to-b from-gray-50 to-white py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Werde Teil von BerlinRP-VC</h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Es gibt verschiedene Möglichkeiten, wie du ein Teil unserer Community werden kannst. 
                Wähle unten die Option, die am besten zu dir passt.
              </p>
            </div>
            
            <Tabs 
              defaultValue="team" 
              value={applicationTab} 
              onValueChange={setApplicationTab}
              className="mx-auto mb-10"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="team" className="text-sm md:text-base">
                  <UserCheckIcon className="h-4 w-4 mr-2 hidden md:inline" />
                  Team Bewerbung
                </TabsTrigger>
                <TabsTrigger value="partnership" className="text-sm md:text-base">
                  <LinkIcon className="h-4 w-4 mr-2 hidden md:inline" />
                  Partnerschaft
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="team" className="mt-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl">Bewirb dich für das Team</CardTitle>
                    <CardDescription>
                      Werde ein aktives Teammitglied und hilf uns den Server zu verbessern
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <InfoIcon className="h-4 w-4" />
                      <AlertTitle>Hinweis zur Bewerbung</AlertTitle>
                      <AlertDescription>
                        Bevor du dich bewirbst, stelle sicher, dass du die Regeln und Anforderungen von BerlinRP-VC kennst und akzeptierst.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full mt-1">
                            <ShieldAlertIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium">Voraussetzungen</h3>
                            <ul className="mt-1 text-gray-600 text-sm space-y-1 list-disc list-inside">
                              <li>Mindestens 13 Jahre alt</li>
                              <li>Aktives Discord- und Roblox-Konto</li>
                              <li>Verständnis der Serverregeln</li>
                              <li>Zeitliche Verfügbarkeit für Teammeetings</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full mt-1">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium">Deine Aufgaben</h3>
                            <ul className="mt-1 text-gray-600 text-sm space-y-1 list-disc list-inside">
                              <li>Server Moderation und Support</li>
                              <li>Mitwirkung an Community-Events</li>
                              <li>Teilnahme an Team-Meetings</li>
                              <li>Beitrag zur Verbesserung des Servers</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center pt-2 pb-6">
                    <Button size="lg" onClick={handleApplyClick}>
                      {session ? "Jetzt bewerben" : "Anmelden & Bewerben"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="partnership" className="mt-6">
                {session ? (
                  <PartnershipRequestForm />
                ) : (
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl md:text-3xl">Partnerschaft mit BerlinRP-VC</CardTitle>
                      <CardDescription>
                        Beantrage eine Partnerschaft für deinen Server oder deine Community
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertTitle>Bitte melde dich an</AlertTitle>
                        <AlertDescription>
                          Du musst angemeldet sein, um eine Partnerschaftsanfrage zu stellen.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                    <CardFooter className="flex justify-center pt-2 pb-6">
                      <Button 
                        size="lg" 
                        onClick={() => navigate('/login', { state: { from: '/apply' } })}
                      >
                        Anmelden & Partnerschaft beantragen
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Apply;
