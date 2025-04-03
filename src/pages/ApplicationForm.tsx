
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ApplicationForm = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock login state
  
  // Mock login function - in a real app, this would use Discord OAuth
  const handleLoginWithDiscord = () => {
    // In a real app, this would redirect to Discord OAuth
    setIsLoggedIn(true);
    toast({
      title: "Erfolgreich angemeldet",
      description: "Du bist jetzt mit Discord verbunden.",
      duration: 3000,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the form data to a backend
    toast({
      title: "Bewerbung eingereicht",
      description: "Deine Bewerbung wurde erfolgreich gesendet. Wir werden uns bald bei dir melden.",
      duration: 5000,
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6 text-center text-hamburg-blue">Bewerbungsformular</h1>
          
          {!isLoggedIn ? (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Mit Discord anmelden</CardTitle>
                <CardDescription>
                  Um dich zu bewerben, musst du dich zuerst mit deinem Discord-Konto anmelden.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleLoginWithDiscord} 
                  className="w-full bg-[#5865F2] hover:bg-[#4752C4]"
                >
                  Mit Discord fortfahren
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Deine Bewerbung</CardTitle>
                <CardDescription>
                  Bitte fülle alle Felder aus, damit wir deine Bewerbung bearbeiten können.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Dein Name</Label>
                      <Input id="name" placeholder="Vor- und Nachname" required />
                    </div>
                    
                    <div>
                      <Label htmlFor="age">Alter</Label>
                      <Input id="age" type="number" min="16" placeholder="Dein Alter" required />
                    </div>
                    
                    <div>
                      <Label>Für welche Position bewirbst du dich?</Label>
                      <Select required>
                        <SelectTrigger>
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
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="motivation">Warum möchtest du Teil unseres Teams werden?</Label>
                      <Textarea 
                        id="motivation" 
                        placeholder="Erzähle uns, warum du dich für diese Position interessierst und was dich motiviert" 
                        rows={4}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="availability">Wann bist du normalerweise online?</Label>
                      <Textarea 
                        id="availability" 
                        placeholder="An welchen Tagen und zu welchen Uhrzeiten bist du normalerweise verfügbar?" 
                        rows={2}
                        required
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
                  
                  <Button type="submit" className="w-full bg-hamburg-red hover:bg-red-700">
                    Bewerbung absenden
                  </Button>
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
