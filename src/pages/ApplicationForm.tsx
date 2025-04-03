
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HelpCircle } from 'lucide-react';

const ApplicationForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState('identification'); // identification, application
  const [discordUserId, setDiscordUserId] = useState('');
  const [formData, setFormData] = useState({
    robloxUsername: '',
    age: '',
    experience: '',
    frpUnderstanding: '',
    vdmUnderstanding: '',
    taschenRPUnderstanding: ''
  });
  const [discordIdError, setDiscordIdError] = useState('');
  const [userFromStorage, setUserFromStorage] = useState<any>(null);
  
  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      toast({
        title: "Login erforderlich",
        description: "Bitte logge dich ein, um fortzufahren.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    setUserFromStorage(userData);
    
    // If user already has a Discord ID saved in profile, use it
    if (userData.discordId) {
      setDiscordUserId(userData.discordId);
    }
  }, [navigate, toast]);
  
  const validateDiscordId = (id: string) => {
    // Check if it contains only numbers and is between the correct length (typical Discord IDs are 17-19 digits)
    const discordIdRegex = /^\d{17,19}$/;
    if (!discordIdRegex.test(id)) {
      setDiscordIdError('Discord ID muss aus 17-19 Ziffern bestehen');
      return false;
    }
    
    setDiscordIdError('');
    return true;
  };
  
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!discordUserId.trim()) {
      setDiscordIdError('Bitte gib deine Discord-User-ID ein');
      return;
    }
    
    if (!validateDiscordId(discordUserId)) {
      return;
    }
    
    // If the user doesn't have a Discord ID saved yet, save it
    if (userFromStorage && !userFromStorage.discordId) {
      const updatedUser = {
        ...userFromStorage,
        discordId: discordUserId
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    setStep('application');
    toast({
      title: "Erfolgreich",
      description: "Du kannst jetzt mit deiner Bewerbung fortfahren.",
      duration: 3000,
    });
  };
  
  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const validateAge = (age: string) => {
    // Age should be a number between 1 and 99
    const ageRegex = /^[1-9][0-9]?$/;
    return ageRegex.test(age);
  };
  
  const validateTextLength = (text: string) => {
    return text.length >= 30;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Age validation
    if (!validateAge(formData.age)) {
      toast({
        title: "Ungültiges Alter",
        description: "Bitte gib ein gültiges Alter ein (nur Zahlen von 1-99)",
        variant: "destructive",
      });
      return;
    }
    
    // Text fields validation
    const textFields = [
      { name: 'experience', label: 'Erfahrung' },
      { name: 'frpUnderstanding', label: 'FRP Verständnis' },
      { name: 'vdmUnderstanding', label: 'VDM Verständnis' },
      { name: 'taschenRPUnderstanding', label: 'Taschen RP Verständnis' }
    ];
    
    for (const field of textFields) {
      const value = formData[field.name as keyof typeof formData];
      if (!validateTextLength(value)) {
        toast({
          title: `Zu kurze Antwort: ${field.label}`,
          description: "Bitte gib mindestens 30 Zeichen ein",
          variant: "destructive",
        });
        return;
      }
    }
    
    // In a real app, this would send the form data to a backend
    toast({
      title: "Bewerbung eingereicht",
      description: "Deine Bewerbung wurde erfolgreich gesendet. Wir werden dich über Discord kontaktieren.",
      duration: 5000,
    });
    
    setTimeout(() => {
      navigate('/profile');
    }, 2000);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />
      
      <main className="flex-grow py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Bewerbungsformular</h1>
          
          <div className="max-w-2xl mx-auto mb-6">
            <Card className="bg-white/90 shadow-md">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-3">Hier kannst du dich als Moderator bewerben!</h2>
                <p className="mb-3">Falls alle Plätze bereits vergeben sind, wirst du automatisch auf die Warteliste gesetzt.</p>
                
                <h3 className="font-bold mt-4 mb-2">Wichtige Voraussetzung:</h3>
                <p className="mb-3">Du solltest unser Regelwerk sicher beherrschen. Bitte achte darauf, deine Antworten sorgfältig und authentisch zu formulieren – kopierte oder durch KI generierte Texte können zur Ablehnung deiner Bewerbung führen.</p>
                
                <h3 className="font-bold mt-4 mb-2">Hinweis:</h3>
                <p className="mb-3">Sollten wir deine Bewerbung in Betracht ziehen, laden wir dich zu einem kurzen Videocall auf Discord ein, um dir einige Fragen zu stellen und ggbf. dein Alter zu verifizieren.</p>
                
                <p className="mb-3">Bitte halte dafür ein gültiges Ausweisdokument bereit, auf dem nur dein Geburtsdatum und dein Foto sichtbar sind. Alle anderen Daten MÜSSEN abgedeckt sein.</p>
                
                <p className="font-medium mb-3">Solltest du das nicht wollen, bitten wir dich diese Bewerbung nicht zu machen.</p>
              </CardContent>
            </Card>
          </div>
          
          {step === 'identification' ? (
            <Card className="max-w-md mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle>Identifikation</CardTitle>
                <CardDescription className="text-blue-100">
                  Bitte bestätige deine Discord-User-ID, damit wir dich kontaktieren können.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleContinue} className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="discord">Discord User-ID</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 rounded-full"
                          >
                            <HelpCircle className="h-4 w-4 text-blue-500" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 text-sm">
                          <div className="space-y-2">
                            <h4 className="font-medium">So findest du deine Discord User-ID:</h4>
                            <ol className="list-decimal ml-4 space-y-1">
                              <li>Öffne die Discord-Einstellungen (Zahnrad-Symbol)</li>
                              <li>Gehe zu "Erweitert" und aktiviere "Entwicklermodus"</li>
                              <li>Klicke mit der rechten Maustaste auf deinen Benutzernamen</li>
                              <li>Wähle "ID kopieren" und füge sie hier ein</li>
                            </ol>
                            <p className="text-muted-foreground">Die User-ID ist eine lange Zahl wie z.B. 123456789012345678</p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    {userFromStorage && userFromStorage.discordId ? (
                      <Input 
                        id="discord" 
                        value={discordUserId}
                        className="border-blue-200 bg-gray-50 text-gray-600"
                        readOnly
                      />
                    ) : (
                      <Input 
                        id="discord" 
                        placeholder="z.B. 123456789012345678" 
                        value={discordUserId}
                        onChange={(e) => {
                          setDiscordUserId(e.target.value);
                          if (e.target.value) validateDiscordId(e.target.value);
                        }}
                        className={`border-blue-200 focus:border-blue-500 ${discordIdError ? 'border-red-500' : ''}`}
                        required 
                      />
                    )}
                    {discordIdError && <p className="text-sm text-red-500">{discordIdError}</p>}
                    <p className="text-sm text-gray-500">
                      {userFromStorage && userFromStorage.discordId 
                        ? "Diese Discord ID wurde aus deinem Profil übernommen."
                        : "Bitte gib deine Discord-User-ID ein, damit wir dich nach deiner Bewerbung kontaktieren können."}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox id="terms" required />
                      <Label htmlFor="terms" className="text-sm">
                        Ich stimme zu, dass meine Daten für den Bewerbungsprozess gespeichert werden dürfen.
                      </Label>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox id="accuracy" required />
                      <Label htmlFor="accuracy" className="text-sm">
                        Ich bestätige, dass alle von mir gemachten Angaben wahrheitsgemäß und nach bestem Wissen ausgefüllt wurden.
                      </Label>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300">
                    Weiter zur Bewerbung
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle>Deine Bewerbung</CardTitle>
                <CardDescription className="text-blue-100">
                  Bitte beantworte alle Fragen ehrlich und ausführlich.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="robloxUsername">1. Roblox Username</Label>
                      <Input 
                        id="robloxUsername"
                        placeholder="Dein Roblox Username" 
                        required 
                        className="border-blue-200 focus:border-blue-500"
                        value={formData.robloxUsername}
                        onChange={(e) => handleInputChange('robloxUsername', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="age">2. Alter</Label>
                      <p className="text-sm text-gray-500 mb-1">Das Mindestalter für unseren Server beträgt 12 Jahre.</p>
                      <Input 
                        id="age" 
                        type="text" 
                        placeholder="Dein Alter (nur Zahlen)" 
                        required 
                        className="border-blue-200 focus:border-blue-500" 
                        max="99"
                        maxLength={2}
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="experience">3. Warum möchtest du Moderator werden und welche Erfahrungen hast du schon gemacht?</Label>
                      <Textarea 
                        id="experience"
                        placeholder="Beschreibe deine Motivation und bisherige Erfahrungen (mind. 30 Zeichen)"
                        required
                        rows={4}
                        className="border-blue-200 focus:border-blue-500"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.experience.length < 30 ? 
                          `Noch ${30 - formData.experience.length} Zeichen benötigt` : 
                          '✓ Ausreichende Länge'}
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="frpUnderstanding">4. Was versteht man unter FRP?</Label>
                      <Textarea 
                        id="frpUnderstanding"
                        placeholder="Erkläre das Konzept von FRP (mind. 30 Zeichen)"
                        required
                        rows={3}
                        className="border-blue-200 focus:border-blue-500"
                        value={formData.frpUnderstanding}
                        onChange={(e) => handleInputChange('frpUnderstanding', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.frpUnderstanding.length < 30 ? 
                          `Noch ${30 - formData.frpUnderstanding.length} Zeichen benötigt` : 
                          '✓ Ausreichende Länge'}
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="vdmUnderstanding">5. Was versteht man unter VDM?</Label>
                      <Textarea 
                        id="vdmUnderstanding"
                        placeholder="Erkläre das Konzept von VDM (mind. 30 Zeichen)"
                        required
                        rows={3}
                        className="border-blue-200 focus:border-blue-500"
                        value={formData.vdmUnderstanding}
                        onChange={(e) => handleInputChange('vdmUnderstanding', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.vdmUnderstanding.length < 30 ? 
                          `Noch ${30 - formData.vdmUnderstanding.length} Zeichen benötigt` : 
                          '✓ Ausreichende Länge'}
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="taschenRPUnderstanding">6. Was versteht man unter Taschen RP?</Label>
                      <Textarea 
                        id="taschenRPUnderstanding"
                        placeholder="Erkläre das Konzept von Taschen RP (mind. 30 Zeichen)"
                        required
                        rows={3}
                        className="border-blue-200 focus:border-blue-500"
                        value={formData.taschenRPUnderstanding}
                        onChange={(e) => handleInputChange('taschenRPUnderstanding', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.taschenRPUnderstanding.length < 30 ? 
                          `Noch ${30 - formData.taschenRPUnderstanding.length} Zeichen benötigt` : 
                          '✓ Ausreichende Länge'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep('identification')} 
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      Zurück
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                    >
                      Bewerbung absenden
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ApplicationForm;
