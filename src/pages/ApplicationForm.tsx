
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, ChevronRight, ChevronLeft, CheckCircle, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ApplicationForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAgeWarning, setShowAgeWarning] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [ageBlocked, setAgeBlocked] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);

  const [applicationData, setApplicationData] = useState({
    discordId: '',
    age: '' as number | string,
    robloxUsername: '',
    robloxId: '',
    activityLevel: 0,
    serverAgeUnderstanding: '',
    frpUnderstanding: '',
    vdmUnderstanding: '',
    taschenRpUnderstanding: '',
    bodycamUnderstanding: '',
    situationHandling: '',
    friendRuleViolation: '',
    otherServers: '',
    adminExperience: ''
  });

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || '';
    updateApplicationData({ age: value });
    
    if (typeof value === 'number' && value < 12) {
      setShowAgeWarning(true);
    } else {
      setShowAgeWarning(false);
      setAgeConfirmed(false);
    }
  };

  const updateApplicationData = (updates: Partial<typeof applicationData>) => {
    setApplicationData(prev => ({
      ...prev,
      ...updates
    }));
  };
  
  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Nicht eingeloggt",
          description: "Du musst angemeldet sein, um eine Bewerbung einzureichen.",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }
      
      setSessionUser(session.user);
      
      // Check if user has an existing application
      try {
        const { data: existingApplication, error } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (existingApplication) {
          toast({
            title: "Bewerbung existiert bereits",
            description: "Du hast bereits eine Bewerbung eingereicht. Du kannst keine weitere erstellen.",
            variant: "default"
          });
          
          navigate("/profile");
        }
      } catch (error) {
        console.error("Error checking existing application:", error);
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleSubmit = async () => {
    if (!sessionUser) {
      toast({
        title: "Fehler",
        description: "Du musst angemeldet sein, um eine Bewerbung einzureichen.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: sessionUser.id,
          discord_id: applicationData.discordId,
          age: typeof applicationData.age === 'number' ? applicationData.age : null,
          roblox_username: applicationData.robloxUsername,
          roblox_id: applicationData.robloxId,
          activity_level: applicationData.activityLevel,
          server_age_understanding: applicationData.serverAgeUnderstanding,
          frp_understanding: applicationData.frpUnderstanding,
          vdm_understanding: applicationData.vdmUnderstanding,
          taschen_rp_understanding: applicationData.taschenRpUnderstanding,
          bodycam_understanding: applicationData.bodycamUnderstanding,
          situation_handling: applicationData.situationHandling,
          friend_rule_violation: applicationData.friendRuleViolation,
          other_servers: applicationData.otherServers || null,
          admin_experience: applicationData.adminExperience || null,
          status: 'pending'
        });
        
      if (error) throw error;
      
      toast({
        title: "Bewerbung eingereicht",
        description: "Deine Bewerbung wurde erfolgreich eingereicht. Wir werden sie prüfen und uns bei dir melden.",
        variant: "default"
      });
      
      navigate("/profile");
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Fehler beim Einreichen",
        description: error.message || "Es gab einen Fehler beim Einreichen deiner Bewerbung.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const validateMinLength = (value: string, minLength: number = 30): boolean => {
    return value.length >= minLength;
  };
  
  const handleNextStep = () => {
    // Validate current step before proceeding
    switch (currentStep) {
      case 1:
        const isDiscordIdValid = /^\d{17,19}$/.test(applicationData.discordId || '');
        const isRobloxIdValid = /^\d+$/.test(applicationData.robloxId || '');
        const currentAge = typeof applicationData.age === 'number' ? applicationData.age : 0;
        
        if (currentAge < 12 && !ageBlocked) {
          toast({
            title: "Altersbeschränkung",
            description: "Du musst mindestens 12 Jahre alt sein, um dich zu bewerben.",
            variant: "destructive"
          });
          return;
        }
        
        if (!applicationData.discordId.trim()) {
          toast({
            title: "Discord ID fehlt",
            description: "Bitte gib deine Discord ID ein.",
            variant: "destructive"
          });
          return;
        }
        
        if (!isDiscordIdValid) {
          toast({
            title: "Ungültige Discord ID",
            description: "Die Discord ID muss eine 17-19-stellige Zahl sein.",
            variant: "destructive"
          });
          return;
        }
        
        if (!applicationData.age) {
          toast({
            title: "Alter fehlt",
            description: "Bitte gib dein Alter ein.",
            variant: "destructive"
          });
          return;
        }
        
        if (!applicationData.robloxUsername.trim()) {
          toast({
            title: "Roblox Benutzername fehlt",
            description: "Bitte gib deinen Roblox Benutzernamen ein.",
            variant: "destructive"
          });
          return;
        }
        
        if (!applicationData.robloxId.trim()) {
          toast({
            title: "Roblox ID fehlt",
            description: "Bitte gib deine Roblox ID ein.",
            variant: "destructive"
          });
          return;
        }
        
        if (!isRobloxIdValid) {
          toast({
            title: "Ungültige Roblox ID",
            description: "Die Roblox ID muss eine Zahl sein.",
            variant: "destructive"
          });
          return;
        }
        
        break;
        
      case 2:
        if (!applicationData.serverAgeUnderstanding.trim()) {
          toast({
            title: "Antwort fehlt",
            description: "Bitte beantworte die Frage zum Serveralter.",
            variant: "destructive"
          });
          return;
        }
        
        if (!validateMinLength(applicationData.serverAgeUnderstanding)) {
          toast({
            title: "Zu kurze Antwort",
            description: "Bitte gib eine ausführlichere Antwort zur Frage zum Serveralter (mindestens 30 Zeichen).",
            variant: "destructive"
          });
          return;
        }
        
        if (!applicationData.frpUnderstanding.trim()) {
          toast({
            title: "Antwort fehlt",
            description: "Bitte beantworte die Frage zu FRP.",
            variant: "destructive"
          });
          return;
        }
        
        if (!validateMinLength(applicationData.frpUnderstanding)) {
          toast({
            title: "Zu kurze Antwort",
            description: "Bitte gib eine ausführlichere Antwort zur FRP-Frage (mindestens 30 Zeichen).",
            variant: "destructive"
          });
          return;
        }
        
        if (!applicationData.vdmUnderstanding.trim()) {
          toast({
            title: "Antwort fehlt",
            description: "Bitte beantworte die Frage zu VDM.",
            variant: "destructive"
          });
          return;
        }
        
        if (!validateMinLength(applicationData.vdmUnderstanding)) {
          toast({
            title: "Zu kurze Antwort",
            description: "Bitte gib eine ausführlichere Antwort zur VDM-Frage (mindestens 30 Zeichen).",
            variant: "destructive"
          });
          return;
        }
        
        if (!applicationData.taschenRpUnderstanding.trim()) {
          toast({
            title: "Antwort fehlt",
            description: "Bitte beantworte die Frage zum Taschen-RP.",
            variant: "destructive"
          });
          return;
        }
        
        if (!validateMinLength(applicationData.taschenRpUnderstanding)) {
          toast({
            title: "Zu kurze Antwort",
            description: "Bitte gib eine ausführlichere Antwort zur Taschen-RP-Frage (mindestens 30 Zeichen).",
            variant: "destructive"
          });
          return;
        }
        break;
        
      case 3:
        if (!applicationData.bodycamUnderstanding.trim()) {
          toast({
            title: "Antwort fehlt",
            description: "Bitte beantworte die Frage zur Bodycam.",
            variant: "destructive"
          });
          return;
        }
        
        if (!validateMinLength(applicationData.bodycamUnderstanding)) {
          toast({
            title: "Zu kurze Antwort",
            description: "Bitte gib eine ausführlichere Antwort zur Bodycam-Frage (mindestens 30 Zeichen).",
            variant: "destructive"
          });
          return;
        }
        
        if (!applicationData.situationHandling.trim()) {
          toast({
            title: "Antwort fehlt",
            description: "Bitte beantworte die Frage zur Situationsbehandlung.",
            variant: "destructive"
          });
          return;
        }
        
        if (!validateMinLength(applicationData.situationHandling)) {
          toast({
            title: "Zu kurze Antwort",
            description: "Bitte gib eine ausführlichere Antwort zur Situationsbehandlungs-Frage (mindestens 30 Zeichen).",
            variant: "destructive"
          });
          return;
        }
        
        if (!applicationData.friendRuleViolation.trim()) {
          toast({
            title: "Antwort fehlt",
            description: "Bitte beantworte die Frage zum Regelverstoß durch einen Freund.",
            variant: "destructive"
          });
          return;
        }
        
        if (!validateMinLength(applicationData.friendRuleViolation)) {
          toast({
            title: "Zu kurze Antwort",
            description: "Bitte gib eine ausführlichere Antwort zur Regelverstoß-Frage (mindestens 30 Zeichen).",
            variant: "destructive"
          });
          return;
        }
        break;
      
      case 4:
        // Final step validation is not necessary as this is handled in handleSubmit
        return handleSubmit();
        
      default:
        break;
    }
    
    // If all validations pass, proceed to next step
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };
  
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-12 px-4 bg-gradient-to-b from-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center mb-2">
              Bewerbung für BerlinRP-VC
            </h1>
            <p className="text-center text-gray-600 mb-6">
              Bitte fülle das Formular sorgfältig aus, um deine Bewerbung einzureichen.
            </p>
            
            <div className="w-full space-y-2">
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Schritt {currentStep} von {totalSteps}</span>
                <span>{Math.round(progressPercentage)}% abgeschlossen</span>
              </div>
            </div>
          </div>

          <Card className="border-t-4 border-t-indigo-600 shadow-lg animate-fade-in">
            <CardContent className="p-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Persönliche Informationen</h2>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="discordId">
                        Discord ID <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="discordId"
                          placeholder="z.B. 123456789012345678"
                          value={applicationData.discordId}
                          onChange={(e) => updateApplicationData({ discordId: e.target.value })}
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Deine Discord ID ist eine 17-19-stellige Zahl. Du findest sie in den Discord-Einstellungen unter "Mein Account" und dann "Drei-Punkte-Menü neben deinem Namen" → "ID kopieren".
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="age">
                        Wie alt bist du? <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Alter eingeben"
                        value={applicationData.age}
                        onChange={handleAgeChange}
                        min={0}
                      />
                    </div>
                    
                    {showAgeWarning && (
                      <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-800">Altersprüfung</AlertTitle>
                        <AlertDescription className="text-amber-700">
                          <p>Du hast angegeben, dass du unter 12 Jahre alt bist. Bitte bestätige, dass diese Angabe korrekt ist.</p>
                          <div className="flex items-center mt-3">
                            <input 
                              type="checkbox" 
                              id="age-confirm" 
                              className="mr-2"
                              checked={ageConfirmed}
                              onChange={(e) => setAgeConfirmed(e.target.checked)}
                            />
                            <label htmlFor="age-confirm" className="text-sm">
                              Ich bestätige, dass ich unter 12 Jahre alt bin und verstehe, dass ich möglicherweise abgelehnt werde.
                            </label>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="robloxUsername">
                        Roblox Benutzername <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="robloxUsername"
                        placeholder="Dein Roblox Benutzername"
                        value={applicationData.robloxUsername}
                        onChange={(e) => updateApplicationData({ robloxUsername: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="robloxId">
                        Roblox ID <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="robloxId"
                        placeholder="z.B. 1234567890"
                        value={applicationData.robloxId}
                        onChange={(e) => updateApplicationData({ robloxId: e.target.value })}
                      />
                      <p className="text-sm text-gray-500">
                        Deine Roblox ID ist eine Zahl. Du findest sie in deinem Roblox-Profil in der URL (z.B. roblox.com/users/1234567890/profile).
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="activityLevel">
                        Wie aktiv bist du? <span className="text-red-500">*</span>
                      </Label>
                      <RadioGroup 
                        value={String(applicationData.activityLevel)} 
                        onValueChange={(value) => updateApplicationData({ activityLevel: parseInt(value) })}
                        className="grid grid-cols-1 md:grid-cols-5 gap-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id="activity-1" />
                          <Label htmlFor="activity-1">Sehr wenig</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2" id="activity-2" />
                          <Label htmlFor="activity-2">Wenig</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3" id="activity-3" />
                          <Label htmlFor="activity-3">Mittel</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="4" id="activity-4" />
                          <Label htmlFor="activity-4">Viel</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="5" id="activity-5" />
                          <Label htmlFor="activity-5">Sehr viel</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 2: Rule Understanding */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Regelverständnis Teil 1</h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="serverAgeUnderstanding">
                        Was verstehst du unter dem Serveralter? <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="serverAgeUnderstanding"
                        placeholder="Erkläre, was du unter dem Serveralter verstehst..."
                        value={applicationData.serverAgeUnderstanding}
                        onChange={(e) => updateApplicationData({ serverAgeUnderstanding: e.target.value })}
                        className="min-h-[120px]"
                      />
                      <p className="text-sm text-gray-500 flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        Mindestens 30 Zeichen erforderlich
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="frpUnderstanding">
                        Was verstehst du unter FRP? <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="frpUnderstanding"
                        placeholder="Erkläre, was du unter FRP verstehst..."
                        value={applicationData.frpUnderstanding}
                        onChange={(e) => updateApplicationData({ frpUnderstanding: e.target.value })}
                        className="min-h-[120px]"
                      />
                      <p className="text-sm text-gray-500 flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        Mindestens 30 Zeichen erforderlich
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="vdmUnderstanding">
                        Was verstehst du unter VDM? <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="vdmUnderstanding"
                        placeholder="Erkläre, was du unter VDM verstehst..."
                        value={applicationData.vdmUnderstanding}
                        onChange={(e) => updateApplicationData({ vdmUnderstanding: e.target.value })}
                        className="min-h-[120px]"
                      />
                      <p className="text-sm text-gray-500 flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        Mindestens 30 Zeichen erforderlich
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="taschenRpUnderstanding">
                        Was verstehst du unter Taschen-RP? <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="taschenRpUnderstanding"
                        placeholder="Erkläre, was du unter Taschen-RP verstehst..."
                        value={applicationData.taschenRpUnderstanding}
                        onChange={(e) => updateApplicationData({ taschenRpUnderstanding: e.target.value })}
                        className="min-h-[120px]"
                      />
                      <p className="text-sm text-gray-500 flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        Mindestens 30 Zeichen erforderlich
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 3: More Rule Understanding */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Regelverständnis Teil 2</h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="bodycamUnderstanding">
                        Was verstehst du unter Bodycam? <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="bodycamUnderstanding"
                        placeholder="Erkläre, was du unter Bodycam verstehst..."
                        value={applicationData.bodycamUnderstanding}
                        onChange={(e) => updateApplicationData({ bodycamUnderstanding: e.target.value })}
                        className="min-h-[120px]"
                      />
                      <p className="text-sm text-gray-500 flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        Mindestens 30 Zeichen erforderlich
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="situationHandling">
                        Wie gehst du mit einer Situation um, in der eine Person die Community-Regeln bricht? <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="situationHandling"
                        placeholder="Beschreibe deine Vorgehensweise..."
                        value={applicationData.situationHandling}
                        onChange={(e) => updateApplicationData({ situationHandling: e.target.value })}
                        className="min-h-[120px]"
                      />
                      <p className="text-sm text-gray-500 flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        Mindestens 30 Zeichen erforderlich
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="friendRuleViolation">
                        Ein Freund von dir bricht die Regeln. Wie reagierst du? <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="friendRuleViolation"
                        placeholder="Beschreibe deine Reaktion..."
                        value={applicationData.friendRuleViolation}
                        onChange={(e) => updateApplicationData({ friendRuleViolation: e.target.value })}
                        className="min-h-[120px]"
                      />
                      <p className="text-sm text-gray-500 flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        Mindestens 30 Zeichen erforderlich
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 4: Experience */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Erfahrung</h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="otherServers">
                        Auf welchen anderen Servern bist du aktiv? (optional)
                      </Label>
                      <Textarea
                        id="otherServers"
                        placeholder="Liste andere Server auf, auf denen du aktiv bist..."
                        value={applicationData.otherServers}
                        onChange={(e) => updateApplicationData({ otherServers: e.target.value })}
                        className="min-h-[120px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="adminExperience">
                        Hast du bereits Admin-Erfahrung auf anderen Servern? Wenn ja, wo und wie lange? (optional)
                      </Label>
                      <Textarea
                        id="adminExperience"
                        placeholder="Beschreibe deine Admin-Erfahrung..."
                        value={applicationData.adminExperience}
                        onChange={(e) => updateApplicationData({ adminExperience: e.target.value })}
                        className="min-h-[120px]"
                      />
                    </div>
                    
                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-800">Fertig!</AlertTitle>
                      <AlertDescription className="text-blue-700">
                        Du hast alle erforderlichen Felder ausgefüllt. Überprüfe deine Antworten noch einmal, bevor du die Bewerbung abschickst.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              )}
              
              <div className="mt-8 flex justify-between">
                {currentStep > 1 ? (
                  <Button
                    onClick={handlePrevStep}
                    variant="outline"
                    className="flex items-center"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Zurück
                  </Button>
                ) : (
                  <div></div>
                )}
                
                <Button
                  onClick={handleNextStep}
                  disabled={typeof applicationData.age === 'number' && applicationData.age < 12 && !ageConfirmed}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {currentStep === totalSteps ? (
                    isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                        Wird eingereicht...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Bewerbung absenden
                      </div>
                    )
                  ) : (
                    <div className="flex items-center">
                      Weiter
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ApplicationForm;
