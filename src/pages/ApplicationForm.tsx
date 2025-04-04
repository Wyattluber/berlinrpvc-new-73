
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApplication } from '@/contexts/ApplicationContext';
import Step1BasicInfo from '@/components/application/Step1BasicInfo';
import Step2RulesUnderstanding from '@/components/application/Step2RulesUnderstanding';
import Step3Situation from '@/components/application/Step3Situation';
import UnderageAlert from '@/components/application/UnderageAlert';

const ApplicationForm = () => {
  const [loading, setLoading] = useState(true);
  const [userDiscordId, setUserDiscordId] = useState('');
  const [userRobloxId, setUserRobloxId] = useState('');
  const [userRobloxUsername, setUserRobloxUsername] = useState('');
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [hasSubmittedApplication, setHasSubmittedApplication] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { currentStep, goToNextStep, goToPreviousStep, applicationData } = useApplication();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setAuthenticated(false);
        toast({
          title: "Nicht angemeldet",
          description: "Du musst angemeldet sein, um eine Bewerbung einzureichen.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      setAuthenticated(true);

      // Get the user's Discord ID and other info from metadata
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const discordId = user.user_metadata?.discord_id || '';
        const robloxId = user.user_metadata?.roblox_id || '';
        const robloxUsername = user.user_metadata?.roblox_username || '';
        
        setUserDiscordId(discordId);
        setUserRobloxId(robloxId);
        setUserRobloxUsername(robloxUsername);
      }

      // Check if the user has already submitted an application
      const { data: applications } = await supabase
        .from('applications')
        .select('id, status')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (applications) {
        setHasSubmittedApplication(true);
        toast({
          title: "Bewerbung bereits eingereicht",
          description: "Du hast bereits eine Bewerbung eingereicht. Überprüfe den Status im Profil-Dashboard.",
        });
        navigate('/profile');
      }

      // Check if user is admin or moderator
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (adminData) {
        setUserRole(adminData.role);
        toast({
          title: "Admin/Moderator-Zugriff",
          description: "Als Teammitglied kannst du keine Bewerbung einreichen.",
        });
        navigate('/profile');
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (authenticated === false || hasSubmittedApplication || userRole) {
    return null;
  }

  if (applicationData.isUnder12) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow py-10 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
          <UnderageAlert />
        </main>
        <Footer />
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo 
            onNext={goToNextStep} 
            userDiscordId={userDiscordId} 
            userRobloxId={userRobloxId} 
            userRobloxUsername={userRobloxUsername} 
          />
        );
      case 2:
        return (
          <Step2RulesUnderstanding 
            onNext={goToNextStep} 
            onBack={goToPreviousStep} 
          />
        );
      case 3:
        return (
          <Step3Situation 
            onBack={goToPreviousStep} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-10 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">BerlinRPVC Teammitglied-Bewerbung</CardTitle>
              <CardDescription>
                Fülle alle Felder sorgfältig aus, um dich als Teammitglied zu bewerben
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  Beantworte alle Fragen ehrlich und ausführlich. Deine Bewerbung wird von unserem Team sorgfältig geprüft.
                </AlertDescription>
              </Alert>

              {/* Progress indicator */}
              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Schritt {currentStep} von 3</span>
                  <span className="text-sm text-gray-500">{Math.round((currentStep / 3) * 100)}% abgeschlossen</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all" 
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {renderStepContent()}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ApplicationForm;
