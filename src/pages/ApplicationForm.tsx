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

const Step1 = () => {
  const { applicationData, updateApplicationData } = useApplication();
  const [showRobloxIdHelp, setShowRobloxIdHelp] = useState(false);
  const [showDiscordIdHelp, setShowDiscordIdHelp] = useState(false);
  const [showAgeWarning, setShowAgeWarning] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || '';
    updateApplicationData({ age: value });
    
    if (value && value < 12) {
      setShowAgeWarning(true);
    } else {
      setShowAgeWarning(false);
      setAgeConfirmed(true);
    }
  };

  const validateRobloxId = (value: string) => {
    return /^\d+$/.test(value);
  };

  const validateDiscordId = (value: string) => {
    return /^\d{17,19}$/.test(value);
  };

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
            onChange={(e) => {
              const value = e.target.value;
              updateApplicationData({ robloxId: value });
              if (value && !validateRobloxId(value)) {
                toast({
                  title: "Ungültige Roblox ID",
                  description: "Bitte gib eine gültige numerische Roblox ID ein",
                  variant: "destructive"
                });
              }
            }}
            placeholder="Deine Roblox ID"
            required
          />
          {showRobloxIdHelp && (
            <div className="text-sm bg-blue-50 p-3 rounded-md border border-blue-100 text-blue-700 mt-2 overflow-auto">
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
        <div className="flex items-center justify-between">
          <Label htmlFor="discordId">Discord ID</Label>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-blue-600" 
            onClick={() => setShowDiscordIdHelp(!showDiscordIdHelp)}
          >
            <HelpCircle size={16} />
          </Button>
        </div>
        <Input
          id="discordId"
          value={applicationData.discordId}
          onChange={(e) => {
            const value = e.target.value;
            updateApplicationData({ discordId: value });
            if (value && !validateDiscordId(value) && value.length > 10) {
              toast({
                title: "Ungültige Discord ID",
                description: "Eine Discord ID besteht aus 17-19 Ziffern",
                variant: "destructive"
              });
            }
          }}
          placeholder="Deine Discord ID"
          required
        />
        {showDiscordIdHelp && (
          <div className="text-sm bg-blue-50 p-3 rounded-md border border-blue-100 text-blue-700 mt-2">
            <p>Um deine Discord ID zu finden:</p>
            <ol className="list-decimal ml-4 mt-1">
              <li>Öffne Discord und gehe zu den Einstellungen</li>
              <li>Wähle "Erweitert" und aktiviere den "Entwicklermodus"</li>
              <li>Klicke mit der rechten Maustaste auf deinen Namen und wähle "ID kopieren"</li>
              <li>Die Discord ID besteht aus 17-19 Ziffern</li>
            </ol>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="age">Wie alt bist du?</Label>
        <Input
          id="age"
          type="number"
          min="12"
          max="99"
          value={applicationData.age}
          onChange={handleAgeChange}
          placeholder="Dein Alter"
          required
        />
        
        {showAgeWarning && (
          <div className="text-sm bg-amber-50 p-3 rounded-md border border-amber-200 text-amber-800 mt-2">
            <p className="font-medium">Altershinweis</p>
            <p>Das Mindestalter für unseren Server beträgt 12 Jahre. Bist du sicher, dass du dein Alter korrekt eingegeben hast?</p>
            <div className="mt-2 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  updateApplicationData({ age: 12 });
                  setShowAgeWarning(false);
                  setAgeConfirmed(true);
                }}
              >
                Korrigieren
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  setShowAgeWarning(false);
                  setAgeConfirmed(true);
                }}
              >
                Bestätigen
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Step2 = () => {
  const { applicationData, updateApplicationData } = useApplication();

  const validateMinLength = (value: string, minLength: number = 30) => {
    return value.length >= minLength;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="frpUnderstanding">
          Was versteht man unter FRP?
          <span className="text-xs text-gray-500 ml-2">(min. 30 Zeichen)</span>
        </Label>
        <Textarea
          id="frpUnderstanding"
          value={applicationData.frpUnderstanding}
          onChange={(e) => {
            const value = e.target.value;
            updateApplicationData({ frpUnderstanding: value });
            
            if (value && value.length < 30) {
              e.target.classList.add('border-red-300');
            } else {
              e.target.classList.remove('border-red-300');
            }
          }}
          placeholder="Erläutere dein Verständnis von Failed Roleplay (FRP)"
          required
          className={applicationData.frpUnderstanding && !validateMinLength(applicationData.frpUnderstanding) ? 'border-red-300' : ''}
        />
        {applicationData.frpUnderstanding && !validateMinLength(applicationData.frpUnderstanding) && (
          <p className="text-xs text-red-500">Bitte schreibe mindestens 30 Zeichen</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="vdmUnderstanding">
          Was versteht man unter VDM?
          <span className="text-xs text-gray-500 ml-2">(min. 30 Zeichen)</span>
        </Label>
        <Textarea
          id="vdmUnderstanding"
          value={applicationData.vdmUnderstanding}
          onChange={(e) => {
            const value = e.target.value;
            updateApplicationData({ vdmUnderstanding: value });
            
            if (value && value.length < 30) {
              e.target.classList.add('border-red-300');
            } else {
              e.target.classList.remove('border-red-300');
            }
          }}
          placeholder="Erläutere dein Verständnis von Vehicle Deathmatch (VDM)"
          required
          className={applicationData.vdmUnderstanding && !validateMinLength(applicationData.vdmUnderstanding) ? 'border-red-300' : ''}
        />
        {applicationData.vdmUnderstanding && !validateMinLength(applicationData.vdmUnderstanding) && (
          <p className="text-xs text-red-500">Bitte schreibe mindestens 30 Zeichen</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="taschenRpUnderstanding">
          Was versteht man unter Taschen RP?
          <span className="text-xs text-gray-500 ml-2">(min. 30 Zeichen)</span>
        </Label>
        <Textarea
          id="taschenRpUnderstanding"
          value={applicationData.taschenRpUnderstanding}
          onChange={(e) => {
            const value = e.target.value;
            updateApplicationData({ taschenRpUnderstanding: value });
            
            if (value && value.length < 30) {
              e.target.classList.add('border-red-300');
            } else {
              e.target.classList.remove('border-red-300');
            }
          }}
          placeholder="Erläutere dein Verständnis von Taschen Roleplay"
          required
          className={applicationData.taschenRpUnderstanding && !validateMinLength(applicationData.taschenRpUnderstanding) ? 'border-red-300' : ''}
        />
        {applicationData.taschenRpUnderstanding && !validateMinLength(applicationData.taschenRpUnderstanding) && (
          <p className="text-xs text-red-500">Bitte schreibe mindestens 30 Zeichen</p>
        )}
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
  
  const validateMinLength = (value: string, minLength: number = 30) => {
    return value.length >= minLength;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="situationHandling">
          Es passiert eine Situation, die nicht im Regelwerk abgedeckt ist. Wie gehst du vor?
          <span className="text-xs text-gray-500 ml-2">(min. 30 Zeichen)</span>
        </Label>
        <Textarea
          id="situationHandling"
          value={applicationData.situationHandling}
          onChange={(e) => {
            const value = e.target.value;
            updateApplicationData({ situationHandling: value });
            
            if (value && value.length < 30) {
              e.target.classList.add('border-red-300');
            } else {
              e.target.classList.remove('border-red-300');
            }
          }}
          placeholder="Beschreibe deinen Umgang mit unklaren Situationen"
          required
          className={applicationData.situationHandling && !validateMinLength(applicationData.situationHandling) ? 'border-red-300' : ''}
        />
        {applicationData.situationHandling && !validateMinLength(applicationData.situationHandling) && (
          <p className="text-xs text-red-500">Bitte schreibe mindestens 30 Zeichen</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bodycamUnderstanding">
          Was verstehen wir unter der Bodycam Pflicht?
          <span className="text-xs text-gray-500 ml-2">(min. 30 Zeichen)</span>
        </Label>
        <Textarea
          id="bodycamUnderstanding"
          value={applicationData.bodycamUnderstanding}
          onChange={(e) => {
            const value = e.target.value;
            updateApplicationData({ bodycamUnderstanding: value });
            
            if (value && value.length < 30) {
              e.target.classList.add('border-red-300');
            } else {
              e.target.classList.remove('border-red-300');
            }
          }}
          placeholder="Erläutere dein Verständnis der Bodycam Pflicht"
          required
          className={applicationData.bodycamUnderstanding && !validateMinLength(applicationData.bodycamUnderstanding) ? 'border-red-300' : ''}
        />
        {applicationData.bodycamUnderstanding && !validateMinLength(applicationData.bodycamUnderstanding) && (
          <p className="text-xs text-red-500">Bitte schreibe mindestens 30 Zeichen</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="friendRuleViolation">
          Ein Freund von dir verstößt gegen die Regeln. Was machst du?
          <span className="text-xs text-gray-500 ml-2">(min. 30 Zeichen)</span>
        </Label>
        <Textarea
          id="friendRuleViolation"
          value={applicationData.friendRuleViolation}
          onChange={(e) => {
            const value = e.target.value;
            updateApplicationData({ friendRuleViolation: value });
            
            if (value && value.length < 30) {
              e.target.classList.add('border-red-300');
            } else {
              e.target.classList.remove('border-red-300');
            }
          }}
          placeholder="Beschreibe wie du mit Regelverstößen von Freunden umgehen würdest"
          required
          className={applicationData.friendRuleViolation && !validateMinLength(applicationData.friendRuleViolation) ? 'border-red-300' : ''}
        />
        {applicationData.friendRuleViolation && !validateMinLength(applicationData.friendRuleViolation) && (
          <p className="text-xs text-red-500">Bitte schreibe mindestens 30 Zeichen</p>
        )}
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

const ApplicationForm = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [ageBlocked, setAgeBlocked] = useState(false);
  
  const { 
    applicationData, 
    currentStep, 
    goToNextStep, 
    goToPreviousStep, 
    totalSteps,
    resetForm,
    updateApplicationData
  } = useApplication();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        if (session.user.user_metadata?.provider_id) {
          updateApplicationData({ discordId: session.user.user_metadata.provider_id });
        }
      } else {
        setShowLoginAlert(true);
      }
    };
    
    getUser();

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
    const validateTextLength = (text: string) => text && text.length >= 30;
    
    switch (currentStep) {
      case 1:
        const isDiscordIdValid = /^\d{17,19}$/.test(applicationData.discordId || '');
        const isRobloxIdValid = /^\d+$/.test(applicationData.robloxId || '');
        
        if (applicationData.age < 12 && !ageBlocked) {
          toast({
            title: "Altersbeschränkung",
            description: "Du musst mindestens 12 Jahre alt sein, um dich zu bewerben.",
            variant: "destructive"
          });
          setAgeBlocked(true);
          return false;
        }
        
        if (!isDiscordIdValid && applicationData.discordId) {
          toast({
            title: "Ungültige Discord ID",
            description: "Bitte gib eine gültige Discord ID ein (17-19 Ziffern)",
            variant: "destructive"
          });
          return false;
        }
        
        if (!isRobloxIdValid && applicationData.robloxId) {
          toast({
            title: "Ungültige Roblox ID",
            description: "Bitte gib eine gültige numerische Roblox ID ein",
            variant: "destructive"
          });
          return false;
        }
        
        return Boolean(
          applicationData.robloxUsername &&
          applicationData.robloxId &&
          applicationData.discordId &&
          applicationData.age &&
          isDiscordIdValid &&
          isRobloxIdValid &&
          !ageBlocked
        );
      case 2:
        return Boolean(
          validateTextLength(applicationData.frpUnderstanding) &&
          validateTextLength(applicationData.vdmUnderstanding) &&
          validateTextLength(applicationData.taschenRpUnderstanding) &&
          applicationData.serverAgeUnderstanding
        );
      case 3:
        return Boolean(
          validateTextLength(applicationData.situationHandling) &&
          validateTextLength(applicationData.bodycamUnderstanding) &&
          validateTextLength(applicationData.friendRuleViolation) &&
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
        description: "Bitte fülle alle erforderlichen Felder korrekt aus.",
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
          status: 'pending',
          age_blocked: ageBlocked
        })
        .select();

      if (error) {
        throw error;
      }

      setShowSubmitConfirm(false);
      setShowSuccessDialog(true);
      
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

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-8 bg-gradient-to-b from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="shadow-lg border-t-4 border-indigo-600">
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
                  disabled={isLoading || (applicationData.age < 12 && currentStep === 1 && !ageBlocked)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
      
      <AlertDialog open={showLoginAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anmeldung erforderlich</AlertDialogTitle>
            <AlertDialogDescription>
              Du musst angemeldet sein, um eine Bewerbung einzureichen. Bitte melde dich an.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleLogin}>
              Zum Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
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

const ApplicationFormWrapper = () => {
  return (
    <ApplicationProvider>
      <ApplicationForm />
    </ApplicationProvider>
  );
};

export default ApplicationFormWrapper;
