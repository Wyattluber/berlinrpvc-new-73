
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApplicationProvider, useApplication } from '../contexts/ApplicationContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialog } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { HelpCircle, ArrowLeft, ArrowRight, Send, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Sub-components for each step
const Step1 = () => {
  const { applicationData, updateApplicationData } = useApplication();
  const [showRobloxIdHelp, setShowRobloxIdHelp] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="robloxUsername">Roblox Username</Label>
          </div>
          <Input
            id="robloxUsername"
            value={applicationData.robloxUsername}
            onChange={(e) => updateApplicationData({ robloxUsername: e.target.value })}
            placeholder="Dein Roblox Username"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="robloxId">Roblox ID</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-blue-600" 
              onClick={() => setShowRobloxIdHelp(!showRobloxIdHelp)}
            >
              <HelpCircle size={16} />
            </Button>
          </div>
          <Input
            id="robloxId"
            value={applicationData.robloxId}
            onChange={(e) => updateApplicationData({ robloxId: e.target.value })}
            placeholder="Deine Roblox ID"
            required
          />
          {showRobloxIdHelp && (
            <div className="text-sm bg-blue-50 p-3 rounded-md border border-blue-100 text-blue-700 mt-2">
              <p>Um deine Roblox ID zu finden:</p>
              <ol className="list-decimal ml-4 mt-1">
                <li>Gehe zu deinem Roblox Profil</li>
                <li>Die Nummer in der URL ist deine ID</li>
                <li>z.B. <span className="font-mono">https://www.roblox.com/users/<strong>12345678</strong>/profile</span></li>
              </ol>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="discordId">Discord ID</Label>
        <Input
          id="discordId"
          value={applicationData.discordId}
          onChange={(e) => updateApplicationData({ discordId: e.target.value })}
          placeholder="Deine Discord ID"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="age">Wie alt bist du?</Label>
        <Input
          id="age"
          type="number"
          min="13"
          max="99"
          value={applicationData.age}
          onChange={(e) => updateApplicationData({ age: parseInt(e.target.value) || '' })}
          placeholder="Dein Alter"
          required
        />
      </div>
    </div>
  );
};

const Step2 = () => {
  const { applicationData, updateApplicationData } = useApplication();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="frpUnderstanding">Was versteht man unter FRP?</Label>
        <Textarea
          id="frpUnderstanding"
          value={applicationData.frpUnderstanding}
          onChange={(e) => updateApplicationData({ frpUnderstanding: e.target.value })}
          placeholder="Erläutere dein Verständnis von Failed Roleplay (FRP)"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="vdmUnderstanding">Was versteht man unter VDM?</Label>
        <Textarea
          id="vdmUnderstanding"
          value={applicationData.vdmUnderstanding}
          onChange={(e) => updateApplicationData({ vdmUnderstanding: e.target.value })}
          placeholder="Erläutere dein Verständnis von Vehicle Deathmatch (VDM)"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="taschenRpUnderstanding">Was versteht man unter Taschen RP?</Label>
        <Textarea
          id="taschenRpUnderstanding"
          value={applicationData.taschenRpUnderstanding}
          onChange={(e) => updateApplicationData({ taschenRpUnderstanding: e.target.value })}
          placeholder="Erläutere dein Verständnis von Taschen Roleplay"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="serverAgeUnderstanding">Was ist unser Server Mindestalter?</Label>
        <Input
          id="serverAgeUnderstanding"
          value={applicationData.serverAgeUnderstanding}
          onChange={(e) => updateApplicationData({ serverAgeUnderstanding: e.target.value })}
          placeholder="Gib das Mindestalter für unseren Server an"
          required
        />
      </div>
    </div>
  );
};

const Step3 = () => {
  const { applicationData, updateApplicationData } = useApplication();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="situationHandling">
          Es passiert eine Situation, die nicht im Regelwerk abgedeckt ist. Wie gehst du vor?
        </Label>
        <Textarea
          id="situationHandling"
          value={applicationData.situationHandling}
          onChange={(e) => updateApplicationData({ situationHandling: e.target.value })}
          placeholder="Beschreibe deinen Umgang mit unklaren Situationen"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bodycamUnderstanding">Was verstehen wir unter der Bodycam Pflicht?</Label>
        <Textarea
          id="bodycamUnderstanding"
          value={applicationData.bodycamUnderstanding}
          onChange={(e) => updateApplicationData({ bodycamUnderstanding: e.target.value })}
          placeholder="Erläutere dein Verständnis der Bodycam Pflicht"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="friendRuleViolation">
          Ein Freund von dir verstößt gegen die Regeln. Was machst du?
        </Label>
        <Textarea
          id="friendRuleViolation"
          value={applicationData.friendRuleViolation}
          onChange={(e) => updateApplicationData({ friendRuleViolation: e.target.value })}
          placeholder="Beschreibe wie du mit Regelverstößen von Freunden umgehen würdest"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="otherServers">
          Bist du bereits auf anderen RP Discord-Servern aktiv? Wenn ja, auf welchen?
        </Label>
        <Textarea
          id="otherServers"
          value={applicationData.otherServers}
          onChange={(e) => updateApplicationData({ otherServers: e.target.value })}
          placeholder="Server Namen und Discord Einladungslinks (falls vorhanden)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="adminExperience">
          Hast du schon Erfahrung im Administrativen Bereich? Wenn Ja, Welche?
        </Label>
        <Textarea
          id="adminExperience"
          value={applicationData.adminExperience}
          onChange={(e) => updateApplicationData({ adminExperience: e.target.value })}
          placeholder="Beschreibe deine bisherigen administrativen Erfahrungen"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="activityLevel">Wie aktiv bist du? (1-10)</Label>
          <span className="font-medium">{applicationData.activityLevel}/10</span>
        </div>
        <Slider
          id="activityLevel"
          min={1}
          max={10}
          step={1}
          value={[applicationData.activityLevel]}
          onValueChange={(value) => updateApplicationData({ activityLevel: value[0] })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Anmerkungen oder Fragen (optional)</Label>
        <Textarea
          id="notes"
          value={applicationData.notes}
          onChange={(e) => updateApplicationData({ notes: e.target.value })}
          placeholder="Optionale Anmerkungen oder Fragen"
        />
      </div>

      <div className="flex items-start space-x-2 pt-2">
        <Checkbox
          id="acceptTerms"
          checked={applicationData.acceptTerms}
          onCheckedChange={(checked) => 
            updateApplicationData({ acceptTerms: checked as boolean })
          }
        />
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor="acceptTerms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Ich bestätige, dass ich verstehe, dass die Bearbeitung meiner Bewerbung mehrere Tage dauern kann und ich benachrichtigt werde, sobald eine Entscheidung getroffen wurde.
          </label>
        </div>
      </div>
    </div>
  );
};

// Main Form with Step Navigation
const ApplicationForm = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { 
    applicationData, 
    currentStep, 
    goToNextStep, 
    goToPreviousStep, 
    totalSteps,
    resetForm
  } = useApplication();

  useEffect(() => {
    // Check if user is logged in via Supabase
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Pre-fill discord ID if available in user metadata
        if (session.user.user_metadata?.provider_id) {
          updateApplicationData({ discordId: session.user.user_metadata.provider_id });
        }
      } else {
        setShowLoginAlert(true);
      }
    };
    
    getUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        if (!session?.user) {
          setShowLoginAlert(true);
        } else {
          setShowLoginAlert(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return Boolean(
          applicationData.robloxUsername &&
          applicationData.robloxId &&
          applicationData.discordId &&
          applicationData.age
        );
      case 2:
        return Boolean(
          applicationData.frpUnderstanding &&
          applicationData.vdmUnderstanding &&
          applicationData.taschenRpUnderstanding &&
          applicationData.serverAgeUnderstanding
        );
      case 3:
        return Boolean(
          applicationData.situationHandling &&
          applicationData.bodycamUnderstanding &&
          applicationData.friendRuleViolation &&
          applicationData.activityLevel &&
          applicationData.acceptTerms
        );
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep === totalSteps) {
        setShowSubmitConfirm(true);
      } else {
        goToNextStep();
      }
    } else {
      toast({
        title: "Fehlende Informationen",
        description: "Bitte fülle alle erforderlichen Felder aus.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setShowLoginAlert(true);
      return;
    }

    setIsLoading(true);
    
    try {
      // Insert application into Supabase
      const { data, error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          discord_id: applicationData.discordId,
          roblox_username: applicationData.robloxUsername,
          roblox_id: applicationData.robloxId,
          age: Number(applicationData.age),
          frp_understanding: applicationData.frpUnderstanding,
          vdm_understanding: applicationData.vdmUnderstanding,
          taschen_rp_understanding: applicationData.taschenRpUnderstanding,
          server_age_understanding: applicationData.serverAgeUnderstanding,
          situation_handling: applicationData.situationHandling,
          bodycam_understanding: applicationData.bodycamUnderstanding,
          friend_rule_violation: applicationData.friendRuleViolation,
          other_servers: applicationData.otherServers,
          admin_experience: applicationData.adminExperience,
          activity_level: applicationData.activityLevel,
          notes: applicationData.notes,
          status: 'pending'
        })
        .select();

      if (error) {
        throw error;
      }

      setShowSubmitConfirm(false);
      setShowSuccessDialog(true);
      
      // Reset form data
      resetForm();

    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Fehler beim Einreichen",
        description: error.message || "Es gab ein Problem beim Einreichen deiner Bewerbung. Bitte versuche es später erneut.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // For auto-updating the discord ID field
  const { updateApplicationData } = useApplication();

  // Handle login redirection
  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="shadow-lg border-t-4 border-blue-600">
            <CardContent className="p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-center mb-2">Bewerbung</h1>
                <p className="text-gray-500 text-center mb-6">
                  Fülle das Formular vollständig aus, um deine Bewerbung einzureichen
                </p>
                
                <Progress 
                  value={(currentStep / totalSteps) * 100} 
                  className="h-2 mb-2" 
                />
                
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Schritt {currentStep} von {totalSteps}</span>
                  <span>{Math.round((currentStep / totalSteps) * 100)}% abgeschlossen</span>
                </div>
              </div>
              
              <div className="min-h-[400px]">
                {currentStep === 1 && <Step1 />}
                {currentStep === 2 && <Step2 />}
                {currentStep === 3 && <Step3 />}
              </div>
              
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zurück
                </Button>
                
                <Button
                  onClick={handleNextStep}
                  disabled={isLoading}
                >
                  {currentStep === totalSteps ? (
                    <>
                      Absenden
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Weiter
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
      
      {/* Login Alert Dialog */}
      <AlertDialog open={showLoginAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anmeldung erforderlich</AlertDialogTitle>
            <AlertDialogDescription>
              Du musst angemeldet sein, um eine Bewerbung einzureichen. Bitte melde dich mit deinem Discord-Account an.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleLogin}>
              Zum Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Confirm Submit Dialog */}
      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bewerbung absenden?</AlertDialogTitle>
            <AlertDialogDescription>
              Bist du sicher, dass du deine Bewerbung absenden möchtest? Überprüfe bitte vorher alle Eingaben.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Wird gesendet..." : "Bewerbung absenden"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-green-600">
              <Check className="mr-2" /> Bewerbung erfolgreich eingereicht
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deine Bewerbung wurde erfolgreich eingereicht und wird von unserem Team geprüft. Du erhältst eine Benachrichtigung, sobald eine Entscheidung getroffen wurde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowSuccessDialog(false);
              navigate('/profile');
            }}>
              Zum Profil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Wrapper component that provides the ApplicationContext
const ApplicationFormWrapper = () => {
  return (
    <ApplicationProvider>
      <ApplicationForm />
    </ApplicationProvider>
  );
};

export default ApplicationFormWrapper;
