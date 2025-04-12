
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, UserCheckIcon, ShieldAlertIcon, Users, Link as LinkIcon, Loader2 } from 'lucide-react';
import PartnershipRequestForm from '@/components/PartnershipRequestForm';
import { 
  getApplicationTexts, 
  DEFAULT_TEAM_DESCRIPTION, 
  DEFAULT_PARTNERSHIP_DESCRIPTION,
  DEFAULT_REQUIREMENTS_DESCRIPTION 
} from '@/lib/admin/applicationTexts';

const Apply = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [applicationTab, setApplicationTab] = useState('team');
  const [loading, setLoading] = useState(true);
  const [teamDescription, setTeamDescription] = useState(DEFAULT_TEAM_DESCRIPTION);
  const [partnershipDescription, setPartnershipDescription] = useState(DEFAULT_PARTNERSHIP_DESCRIPTION);
  const [requirementsDescription, setRequirementsDescription] = useState(DEFAULT_REQUIREMENTS_DESCRIPTION);

  useEffect(() => {
    const loadTexts = async () => {
      setLoading(true);
      try {
        const texts = await getApplicationTexts();
        if (texts) {
          setTeamDescription(texts.team_description || DEFAULT_TEAM_DESCRIPTION);
          setPartnershipDescription(texts.partnership_description || DEFAULT_PARTNERSHIP_DESCRIPTION);
          setRequirementsDescription(texts.requirements_description || DEFAULT_REQUIREMENTS_DESCRIPTION);
        }
      } catch (error) {
        console.error('Error loading application texts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTexts();
  }, []);

  const handleApplyClick = () => {
    if (session) {
      navigate('/apply/form');
    } else {
      navigate('/login', { state: { from: '/apply/form' } });
    }
  };

  const formatDescription = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
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
            
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
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
                      
                      <div className="prose max-w-none text-gray-700">
                        <h3 className="text-xl font-medium mb-3">Deine Aufgaben als Moderator</h3>
                        <div className="whitespace-pre-line">
                          {formatDescription(teamDescription)}
                        </div>
                      </div>
                      
                      <div className="prose max-w-none text-gray-700 mt-6">
                        <h3 className="text-xl font-medium mb-3">Allgemeine Anforderungen</h3>
                        <div className="whitespace-pre-line">
                          {formatDescription(requirementsDescription)}
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
                        
                        <div className="prose max-w-none text-gray-700">
                          <div className="whitespace-pre-line">
                            {formatDescription(partnershipDescription)}
                          </div>
                        </div>
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
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Apply;
