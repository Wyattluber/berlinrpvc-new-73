
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Info, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const applicationSchema = z.object({
  // Tab 1 - Personal Info
  age: z.string().min(1, {
    message: "Bitte gib dein Alter an.",
  }),
  robloxId: z.string().optional(),
  discordId: z.string().optional(),
  
  // Tab 2 - Server Rules Understanding
  frpUnderstanding: z.string().min(30, {
    message: "Bitte antworte mit mindestens 30 Zeichen."
  }),
  rdmUnderstanding: z.string().min(30, {
    message: "Bitte antworte mit mindestens 30 Zeichen."
  }),
  vdmUnderstanding: z.string().min(30, {
    message: "Bitte antworte mit mindestens 30 Zeichen."
  }),
  taschenRpUnderstanding: z.string().min(30, {
    message: "Bitte antworte mit mindestens 30 Zeichen."
  }),
  bodycamUnderstanding: z.string().min(30, {
    message: "Bitte antworte mit mindestens 30 Zeichen."
  }),
  friendRuleViolation: z.string().min(30, {
    message: "Bitte antworte mit mindestens 30 Zeichen."
  }),
  serverAgeUnderstanding: z.string().min(1, {
    message: "Bitte gib das Mindestalter ein."
  }),
  
  // Tab 3 - Experience
  whyModerator: z.string().min(50, {
    message: "Bitte erkläre ausführlicher, warum du Moderator werden möchtest (mindestens 50 Zeichen)."
  }),
  experience: z.string().min(50, {
    message: "Bitte beschreibe deine Erfahrung ausführlicher (mindestens 50 Zeichen)."
  }),
  otherServers: z.string().optional(),
  otherServerInvites: z.string().optional(),
  notes: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Du musst den Bedingungen zustimmen, um fortzufahren."
  })
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

const ModeratorApplication = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      age: "",
      robloxId: "",
      discordId: "",
      frpUnderstanding: "",
      rdmUnderstanding: "",
      vdmUnderstanding: "",
      taschenRpUnderstanding: "",
      bodycamUnderstanding: "",
      friendRuleViolation: "",
      serverAgeUnderstanding: "",
      whyModerator: "",
      experience: "",
      otherServers: "",
      otherServerInvites: "",
      notes: "",
      acceptTerms: false
    },
  });
  
  useEffect(() => {
    if (!session) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Du musst angemeldet sein, um dich als Moderator zu bewerben.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    // Fetch user profile data
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (data) {
        setUserProfile(data);
        form.setValue('robloxId', data.roblox_id || '');
        form.setValue('discordId', data.discord_id || '');
      }
    };
    
    fetchProfile();
  }, [session, navigate, form]);
  
  const handleNextTab = () => {
    if (activeTab === "personal") {
      const personalFields = ['age', 'robloxId', 'discordId'];
      const isPersonalValid = personalFields.every(field => {
        const result = form.trigger(field as any);
        return result;
      });
      
      if (isPersonalValid) {
        setActiveTab("rules");
      }
    } else if (activeTab === "rules") {
      const rulesFields = [
        'frpUnderstanding', 
        'rdmUnderstanding', 
        'vdmUnderstanding', 
        'taschenRpUnderstanding',
        'bodycamUnderstanding',
        'friendRuleViolation',
        'serverAgeUnderstanding'
      ];
      
      const isRulesValid = rulesFields.every(field => {
        const result = form.trigger(field as any);
        return result;
      });
      
      if (isRulesValid) {
        setActiveTab("experience");
      }
    }
  };
  
  const handlePreviousTab = () => {
    if (activeTab === "rules") {
      setActiveTab("personal");
    } else if (activeTab === "experience") {
      setActiveTab("rules");
    }
  };
  
  const onSubmit = async (values: ApplicationFormValues) => {
    if (!session) {
      toast({
        title: "Fehler",
        description: "Du musst angemeldet sein, um diese Aktion durchzuführen.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format the server invite link if provided
      const serverInvite = values.otherServerInvites 
        ? values.otherServerInvites.startsWith('http://discord.gg/') || values.otherServerInvites.startsWith('https://discord.gg/')
          ? values.otherServerInvites
          : `http://discord.gg/${values.otherServerInvites}`
        : '';
      
      // Submit the application to the database
      const { error } = await supabase
        .from('applications')
        .insert([
          {
            user_id: session.user.id,
            type: 'moderator',
            status: 'pending',
            roblox_id: values.robloxId || userProfile?.roblox_id,
            roblox_username: values.robloxId ? values.robloxId : userProfile?.roblox_id,
            discord_id: values.discordId || userProfile?.discord_id,
            age: parseInt(values.age),
            frp_understanding: values.frpUnderstanding,
            vdm_understanding: values.vdmUnderstanding,
            rdm_understanding: values.rdmUnderstanding,
            taschen_rp_understanding: values.taschenRpUnderstanding,
            bodycam_understanding: values.bodycamUnderstanding,
            friend_rule_violation: values.friendRuleViolation,
            server_age_understanding: values.serverAgeUnderstanding,
            other_servers: `${values.otherServers || ''} - ${serverInvite}`,
            admin_experience: values.experience,
            situation_handling: values.whyModerator,
            notes: values.notes,
          },
        ]);
        
      if (error) throw error;
      
      // Update profile if needed
      if ((values.robloxId && values.robloxId !== userProfile?.roblox_id) || 
          (values.discordId && values.discordId !== userProfile?.discord_id)) {
        
        await supabase
          .from('profiles')
          .update({
            roblox_id: values.robloxId || userProfile?.roblox_id,
            discord_id: values.discordId || userProfile?.discord_id
          })
          .eq('id', session.user.id);
      }
      
      toast({
        title: "Bewerbung eingereicht",
        description: "Deine Bewerbung als Moderator wurde erfolgreich eingereicht.",
      });
      
      // Redirect to profile page
      navigate('/profile?tab=applications');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Fehler",
        description: "Es ist ein Fehler beim Einreichen deiner Bewerbung aufgetreten. Bitte versuche es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!session) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 container mx-auto py-12 px-4 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 container mx-auto py-12 px-4">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/apply')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Button>
        
        <div className="max-w-3xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-green-500" />
                Moderator Bewerbung
              </CardTitle>
              <CardDescription>
                Bewerbe dich als Moderator und unterstütze unser Team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="personal">1. Persönliches</TabsTrigger>
                      <TabsTrigger value="rules">2. Regelverständnis</TabsTrigger>
                      <TabsTrigger value="experience">3. Erfahrung</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="personal" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dein Alter</FormLabel>
                            <FormControl>
                              <Input type="text" placeholder="z.B. 18" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="robloxId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deine Roblox ID {userProfile?.roblox_id && "(bereits gespeichert)"}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={userProfile?.roblox_id || "Deine Roblox ID"} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="discordId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deine Discord ID {userProfile?.discord_id && "(bereits gespeichert)"}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={userProfile?.discord_id || "Deine Discord ID"} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4">
                        <Button type="button" onClick={handleNextTab}>Weiter</Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="rules" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="frpUnderstanding"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Was versteht man unter FRP?</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Erkläre dein Verständnis von Fear Roleplay..." 
                                className="min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="rdmUnderstanding"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Was versteht man unter RDM?</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Erkläre dein Verständnis von Random Deathmatch..." 
                                className="min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="vdmUnderstanding"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Was versteht man unter VDM?</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Erkläre dein Verständnis von Vehicle Deathmatch..." 
                                className="min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="taschenRpUnderstanding"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Was versteht man unter Taschen RP?</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Erkläre dein Verständnis von Taschen RP..." 
                                className="min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bodycamUnderstanding"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Was versteht man unter einer Bodycamaufnahme und für was ist diese gut?</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Erkläre den Sinn und Zweck einer Bodycam..." 
                                className="min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="friendRuleViolation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ein Freund von dir verstößt gegen die Regeln. Was machst du?</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Beschreibe, wie du in dieser Situation reagieren würdest..." 
                                className="min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="serverAgeUnderstanding"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Was ist unser Server Mindestalter?</FormLabel>
                            <FormControl>
                              <Input type="text" placeholder="Gib das Mindestalter ein" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4 flex justify-between">
                        <Button type="button" variant="outline" onClick={handlePreviousTab}>
                          Zurück
                        </Button>
                        <Button type="button" onClick={handleNextTab}>
                          Weiter
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="experience" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="whyModerator"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Warum möchtest du Moderator werden und welche Erfahrungen hast du schon?</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Beschreibe deine Motivation und Erfahrung..." 
                                className="min-h-[120px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deine Erfahrung als Moderator</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Beschreibe deine bisherige Erfahrung als Moderator oder in ähnlichen Positionen..." 
                                className="min-h-[120px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="otherServers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bist du bereits auf anderen RP Discord-Servern aktiv? Wenn ja, auf welchen?</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Gib die Namen der Server an (optional)..." 
                                className="min-h-[80px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>Optional</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="otherServerInvites"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Einladungslinks zu den genannten Servern</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="z.B. https://discord.gg/invite" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>Optional</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Anmerkungen oder Fragen</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Hast du noch Anmerkungen oder Fragen?" 
                                className="min-h-[80px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>Optional</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="acceptTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md mt-6">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Deine Bewerbungsanfrage kann mehrere Tage in Anspruch nehmen, da unser Team ausgelastet sein könnte. Du bekommst bescheid, sobald deine Bewerbung angenommen oder abgelehnt wurde.
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4 flex justify-between">
                        <Button type="button" variant="outline" onClick={handlePreviousTab}>
                          Zurück
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Bewerbung wird eingereicht...
                            </>
                          ) : (
                            "Bewerbung einreichen"
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Was macht ein Moderator?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Als Moderator spielst du eine entscheidende Rolle bei der Aufrechterhaltung einer 
                positiven und sicheren Umgebung für unsere Community. Du bist verantwortlich für:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Durchsetzung der Community-Regeln</li>
                <li>Bearbeitung von Nutzeranfragen und -problemen</li>
                <li>Schlichtung von Konflikten</li>
                <li>Überwachung von Chat-Kanälen</li>
                <li>Unterstützung neuer Mitglieder</li>
              </ul>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
                <h4 className="font-medium">Anforderungen:</h4>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                  <li>Geduld und Verständnis im Umgang mit Menschen</li>
                  <li>Fähigkeit, fair und unparteiisch zu handeln</li>
                  <li>Zuverlässigkeit und Verantwortungsbewusstsein</li>
                  <li>Gute Kommunikationsfähigkeiten</li>
                  <li>Bereitschaft, mit dem Team zusammenzuarbeiten</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ModeratorApplication;
