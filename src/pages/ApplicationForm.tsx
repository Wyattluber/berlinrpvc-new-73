
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const ApplicationForm = () => {
  const { toast } = useToast();
  const [step, setStep] = useState('identification'); // identification, application
  const [discordUsername, setDiscordUsername] = useState('');
  
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discordUsername.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib deinen Discord-Benutzernamen ein.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setStep('application');
    toast({
      title: "Erfolgreich",
      description: "Du kannst jetzt mit deiner Bewerbung fortfahren.",
      duration: 3000,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the form data to a backend
    toast({
      title: "Bewerbung eingereicht",
      description: "Deine Bewerbung wurde erfolgreich gesendet. Wir werden dich über Discord kontaktieren.",
      duration: 5000,
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />
      
      <main className="flex-grow py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Bewerbungsformular</h1>
          
          {step === 'identification' ? (
            <Card className="max-w-md mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle>Identifikation</CardTitle>
                <CardDescription className="text-blue-100">
                  Bitte gib deinen Discord-Benutzernamen ein, damit wir dich kontaktieren können.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleContinue} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="discord">Discord Benutzername</Label>
                    <Input 
                      id="discord" 
                      placeholder="z.B. username#1234 oder username" 
                      value={discordUsername}
                      onChange={(e) => setDiscordUsername(e.target.value)}
                      required 
                      className="border-blue-200 focus:border-blue-500"
                    />
                    <p className="text-sm text-gray-500">
                      Bitte gib deinen vollständigen Discord-Benutzernamen ein, damit wir dich nach deiner Bewerbung kontaktieren können.
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm">
                      Ich stimme zu, dass meine Daten für den Bewerbungsprozess gespeichert werden dürfen.
                    </Label>
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
                  Bitte fülle alle Felder aus, damit wir deine Bewerbung bearbeiten können.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Dein Name</Label>
                      <Input id="name" placeholder="Vor- und Nachname" required className="border-blue-200 focus:border-blue-500" />
                    </div>
                    
                    <div>
                      <Label htmlFor="age">Alter</Label>
                      <Input id="age" type="number" min="16" placeholder="Dein Alter" required className="border-blue-200 focus:border-blue-500" />
                    </div>
                    
                    <div>
                      <Label>Für welche Position bewirbst du dich?</Label>
                      <Select required>
                        <SelectTrigger className="border-blue-200 focus:border-blue-500">
                          <SelectValue placeholder="Position auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sanitaet">Sanitätsdienst</SelectItem>
                          <SelectItem value="feuerwehr">Feuerwehr</SelectItem>
                          <SelectItem value="polizei">Polizei</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Hast du bereits Erfahrung in dieser Position?</Label>
                      <RadioGroup defaultValue="no" className="flex flex-col space-y-1 mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="exp-yes" />
                          <Label htmlFor="exp-yes">Ja</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="exp-no" />
                          <Label htmlFor="exp-no">Nein</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div>
                      <Label htmlFor="experience">Beschreibe deine bisherige Erfahrung</Label>
                      <Textarea 
                        id="experience" 
                        placeholder="Beschreibe hier deine Erfahrungen auf ähnlichen Servern oder in ähnlichen Positionen" 
                        rows={4}
                        className="border-blue-200 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="motivation">Warum möchtest du Teil unseres Teams werden?</Label>
                      <Textarea 
                        id="motivation" 
                        placeholder="Erzähle uns, warum du dich für diese Position interessierst und was dich motiviert" 
                        rows={4}
                        required
                        className="border-blue-200 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="availability">Wann bist du normalerweise online?</Label>
                      <Textarea 
                        id="availability" 
                        placeholder="An welchen Tagen und zu welchen Uhrzeiten bist du normalerweise verfügbar?" 
                        rows={2}
                        required
                        className="border-blue-200 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <Label>Hast du ein funktionierendes Mikrofon?</Label>
                      <RadioGroup defaultValue="yes" className="flex flex-col space-y-1 mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="mic-yes" />
                          <Label htmlFor="mic-yes">Ja</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="mic-no" />
                          <Label htmlFor="mic-no">Nein</Label>
                        </div>
                      </RadioGroup>
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
