
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Import ui components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertTriangle, CheckCircle2, Info, Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApplication } from '@/contexts/ApplicationContext';

// Define the form schema with Zod
const applicationFormSchema = z.object({
  roblox_username: z.string().min(1, { message: "Bitte gib deinen Roblox Benutzernamen ein." }),
  roblox_id: z.string().min(1, { message: "Bitte gib deine Roblox ID ein." }),
  discord_id: z.string().min(1, { message: "Bitte gib deine Discord ID ein." }),
  age: z.coerce
    .number({ required_error: "Bitte gib dein Alter ein.", invalid_type_error: "Bitte gib eine gültige Zahl ein." })
    .min(13, { message: "Du musst mindestens 13 Jahre alt sein." })
    .max(100, { message: "Bitte gib ein gültiges Alter ein." }),
  activity_level: z.coerce
    .number({ required_error: "Bitte schätze deine Aktivität ein.", invalid_type_error: "Bitte wähle eine Option." })
    .min(1, { message: "Bitte wähle eine Option." })
    .max(10, { message: "Bitte wähle eine Option." }),
  frp_understanding: z.string().min(20, { message: "Bitte gib eine ausführlichere Antwort (mindestens 20 Zeichen)." }),
  vdm_understanding: z.string().min(20, { message: "Bitte gib eine ausführlichere Antwort (mindestens 20 Zeichen)." }),
  taschen_rp_understanding: z.string().min(20, { message: "Bitte gib eine ausführlichere Antwort (mindestens 20 Zeichen)." }),
  server_age_understanding: z.string().min(20, { message: "Bitte gib eine ausführlichere Antwort (mindestens 20 Zeichen)." }),
  situation_handling: z.string().min(30, { message: "Bitte gib eine ausführlichere Antwort (mindestens 30 Zeichen)." }),
  bodycam_understanding: z.string().min(20, { message: "Bitte gib eine ausführlichere Antwort (mindestens 20 Zeichen)." }),
  friend_rule_violation: z.string().min(30, { message: "Bitte gib eine ausführlichere Antwort (mindestens 30 Zeichen)." }),
  other_servers: z.string().optional(),
  admin_experience: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationFormSchema>;

const ApplicationForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [userDiscordId, setUserDiscordId] = useState('');
  const [userRobloxId, setUserRobloxId] = useState('');
  const [userRobloxUsername, setUserRobloxUsername] = useState('');
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [hasSubmittedApplication, setHasSubmittedApplication] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { updateApplicationData, goToStep } = useApplication();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      roblox_username: '',
      roblox_id: '',
      discord_id: '',
      age: undefined,
      activity_level: undefined,
      frp_understanding: '',
      vdm_understanding: '',
      taschen_rp_understanding: '',
      server_age_understanding: '',
      situation_handling: '',
      bodycam_understanding: '',
      friend_rule_violation: '',
      other_servers: '',
      admin_experience: '',
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
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
        
        form.setValue('discord_id', discordId);
        form.setValue('roblox_id', robloxId);
        form.setValue('roblox_username', robloxUsername);
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
    };

    checkAuth();
  }, [navigate, form]);

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Du musst angemeldet sein, um eine Bewerbung einzureichen.");
      }
      
      // Update context data for application steps
      updateApplicationData({
        robloxUsername: data.roblox_username,
        robloxId: data.roblox_id,
        discordId: data.discord_id,
        age: data.age,
        frpUnderstanding: data.frp_understanding,
        vdmUnderstanding: data.vdm_understanding,
        taschenRpUnderstanding: data.taschen_rp_understanding,
        serverAgeUnderstanding: data.server_age_understanding,
        situationHandling: data.situation_handling,
        bodycamUnderstanding: data.bodycam_understanding,
        friendRuleViolation: data.friend_rule_violation,
        otherServers: data.other_servers || '',
        adminExperience: data.admin_experience || '',
        activityLevel: data.activity_level,
      });
      
      // Submit the application to Supabase
      const { error } = await supabase
        .from('applications')
        .insert([
          {
            user_id: user.id,
            roblox_username: data.roblox_username,
            roblox_id: data.roblox_id,
            discord_id: data.discord_id,
            age: data.age,
            activity_level: data.activity_level,
            frp_understanding: data.frp_understanding,
            vdm_understanding: data.vdm_understanding,
            taschen_rp_understanding: data.taschen_rp_understanding,
            server_age_understanding: data.server_age_understanding,
            situation_handling: data.situation_handling,
            bodycam_understanding: data.bodycam_understanding,
            friend_rule_violation: data.friend_rule_violation,
            other_servers: data.other_servers || null,
            admin_experience: data.admin_experience || null,
          }
        ]);

      if (error) throw error;

      setSubmitSuccess(true);
      form.reset();

      // Show success toast and redirect after short delay
      toast({
        title: "Bewerbung eingereicht",
        description: "Deine Bewerbung wurde erfolgreich übermittelt. Du wirst gleich zu deinem Profil weitergeleitet.",
      });
      
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
      
    } catch (error: any) {
      console.error("Error submitting application:", error);
      setSubmitError(error.message);
      toast({
        title: "Fehler",
        description: error.message || "Es gab ein Problem beim Einreichen der Bewerbung.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authenticated === null) {
    // Loading state
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
    // This should redirect to login or profile, but just in case show an error
    return null;
  }

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
              {submitError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Fehler beim Einreichen</AlertTitle>
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
              
              {submitSuccess && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Bewerbung eingereicht!</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Deine Bewerbung wurde erfolgreich übermittelt. Du wirst in Kürze zu deinem Profil weitergeleitet.
                  </AlertDescription>
                </Alert>
              )}
              
              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  Beantworte alle Fragen ehrlich und ausführlich. Deine Bewerbung wird von unserem Team sorgfältig geprüft.
                </AlertDescription>
              </Alert>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">1. Persönliche Informationen</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="roblox_username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Roblox Benutzername</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  placeholder="Dein Roblox Benutzername" 
                                  {...field} 
                                  value={field.value || userRobloxUsername}
                                  className="pr-10"
                                  readOnly={!!userRobloxUsername}
                                />
                                {userRobloxUsername && (
                                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </FormControl>
                            {userRobloxUsername && (
                              <FormDescription>
                                Automatisch aus deinem Profil übernommen
                              </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="roblox_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Roblox ID</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  placeholder="Deine Roblox ID" 
                                  {...field} 
                                  value={field.value || userRobloxId}
                                  className="pr-10"
                                  readOnly={!!userRobloxId}
                                />
                                {userRobloxId && (
                                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </FormControl>
                            {userRobloxId && (
                              <FormDescription>
                                Automatisch aus deinem Profil übernommen
                              </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="discord_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discord ID</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  placeholder="Deine Discord ID" 
                                  {...field} 
                                  value={field.value || userDiscordId}
                                  className="pr-10"
                                  readOnly={!!userDiscordId}
                                />
                                {userDiscordId && (
                                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </FormControl>
                            {userDiscordId && (
                              <FormDescription>
                                Automatisch aus deinem Profil übernommen
                              </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alter</FormLabel>
                            <FormControl>
                              <Input type="number" min="13" max="100" placeholder="Dein Alter" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="activity_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wie aktiv schätzt du dich auf einer Skala von 1-10 ein?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              defaultValue={field.value?.toString()}
                              className="flex flex-wrap gap-2"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <div key={num} className="flex items-center space-x-2">
                                  <RadioGroupItem value={num.toString()} id={`activity-${num}`} />
                                  <Label htmlFor={`activity-${num}`}>{num}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">2. Regelverständnis</h2>
                    
                    <FormField
                      control={form.control}
                      name="frp_understanding"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Was ist für dich FRP (Fail-Roleplay)?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Erkläre, was du unter FRP verstehst und gib Beispiele."
                              className="min-h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="vdm_understanding"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Was ist für dich VDM (Vehicle-Deathmatch)?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Erkläre, was du unter VDM verstehst und gib Beispiele."
                              className="min-h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="taschen_rp_understanding"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Was ist Taschen-RP und warum ist es verboten?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Erkläre, was du unter Taschen-RP verstehst und warum es verboten ist."
                              className="min-h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="server_age_understanding"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wie alt muss man sein, um auf dem Server spielen zu dürfen?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Erkläre die Altersregeln des Servers."
                              className="min-h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">3. Situationshandhabung</h2>
                    
                    <FormField
                      control={form.control}
                      name="situation_handling"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wie würdest du mit einem Spieler umgehen, der sich weigert, auf Teammitglieder zu hören?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Beschreibe, wie du diese Situation handhaben würdest."
                              className="min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bodycam_understanding"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Was ist eine Bodycam und wann kommt sie zum Einsatz?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Erkläre den Zweck und Einsatz von Bodycams."
                              className="min-h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="friend_rule_violation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wie würdest du vorgehen, wenn ein Freund von dir gegen die Regeln verstößt?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Beschreibe, wie du dich in dieser Situation verhalten würdest."
                              className="min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">4. Erfahrung (Optional)</h2>
                    
                    <FormField
                      control={form.control}
                      name="other_servers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Auf welchen anderen Servern spielst du noch?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Liste andere Server auf, auf denen du aktiv bist (optional)."
                              className="min-h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="admin_experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hast du bereits Erfahrung als Administrator/Teammitglied?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Beschreibe deine bisherige Erfahrung (optional)."
                              className="min-h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-700"
                      disabled={isSubmitting || submitSuccess}
                    >
                      {isSubmitting ? 
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Bewerbung wird eingereicht...
                        </div> : 
                        "Bewerbung einreichen"
                      }
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 text-center text-sm text-gray-500">
              <p>Alle Bewerbungen werden von unserem Team geprüft und bearbeitet.</p>
              <p>Der Status deiner Bewerbung wird in deinem Profil angezeigt.</p>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ApplicationForm;
