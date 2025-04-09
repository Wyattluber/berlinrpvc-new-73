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

      // Holen der Benutzerinformationen aus Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Laden der Discord- und Roblox-IDs aus der "profiles"-Tabelle
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('discord_id, roblox_id')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          setUserDiscordId(profileData.discord_id || '');
          setUserRobloxId(profileData.roblox_id || '');
        } else {
          toast({
            title: "Fehler beim Laden der Benutzerdaten",
            description: "Die Profilinformationen konnten nicht abgerufen werden.",
            variant: "destructive"
          });
        }
      }

      // Überprüfen, ob der Benutzer bereits eine Bewerbung eingereicht hat
      const { data: applications } = await supabase
        .from('applications')
        .select('id, status')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (applications && applications.id) {
        setHasSubmittedApplication(true);
        toast({
          title: "Bewerbung bereits eingereicht",
          description: "Du hast bereits eine Bewerbung eingereicht. Überprüfe den Status im Profil-Dashboard.",
        });
        navigate('/profile');
      }

      // Überprüfen, ob der Benutzer Administrator oder Moderator ist
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (adminData && adminData.role) {
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
            userDiscordId={userDiscordId}  // Discord ID
            userRobloxId={userRobloxId}    // Roblox ID
            userRobloxUsername={userRobloxUsername}
          />
        );
      // Weitere Schritte...
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-10 bg-gradient-to-b from-gray-50 to-white">
        {renderStepContent()}
      </main>
      <Footer />
    </div>
  );
};

const Step1BasicInfo = ({ onNext, userDiscordId, userRobloxId, userRobloxUsername }) => {
  return (
    <div>
      {/* Discord ID - Nur anzeigen, nicht bearbeitbar */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Discord ID</label>
        <input 
          type="text" 
          value={userDiscordId} 
          readOnly 
          className="mt-1 block w-full bg-gray-100 text-gray-700 border border-gray-300 rounded-md p-2"
        />
      </div>

      {/* Roblox ID - Nur anzeigen, nicht bearbeitbar */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Roblox ID</label>
        <input 
          type="text" 
          value={userRobloxId} 
          readOnly 
          className="mt-1 block w-full bg-gray-100 text-gray-700 border border-gray-300 rounded-md p-2"
        />
      </div>

      {/* Weitere Eingabefelder und Logik */}
      <button 
        onClick={onNext} 
        className="mt-6 w-full py-2 px-4 bg-blue-600 text-white rounded-md"
      >
        Weiter
      </button>
    </div>
  );
};

export default ApplicationForm;
