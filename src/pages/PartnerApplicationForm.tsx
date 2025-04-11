
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Info, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { usePartnerApplication } from '@/contexts/PartnerApplicationContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  discordId: z.string().min(1, { message: "Discord ID wird benötigt" }),
  discordInvite: z.string()
    .min(16, { message: "Discord-Einladungslink muss vollständig sein" })
    .startsWith("https://discord.gg/", { message: "Einladungslink muss mit https://discord.gg/ beginnen" }),
  reason: z.string().min(50, { message: "Bitte gib mindestens 50 Zeichen ein" }),
  requirements: z.string().min(10, { message: "Bitte gib mindestens 10 Zeichen ein" }),
  hasOtherPartners: z.boolean(),
  otherPartners: z.string().optional(),
}).refine(data => {
  // Check if otherPartners is required based on hasOtherPartners
  if (data.hasOtherPartners && (!data.otherPartners || data.otherPartners.length < 3)) {
    return false;
  }
  return true;
}, {
  message: "Bitte gib an, mit welchen Servern du bereits Partnerschaften hast",
  path: ["otherPartners"],
});

type FormValues = z.infer<typeof formSchema>;

const PartnerApplicationForm = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userDiscordId, setUserDiscordId] = useState('');
  const { applicationData, updateApplicationData } = usePartnerApplication();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discordId: applicationData.discordId || '',
      discordInvite: applicationData.discordInvite || 'https://discord.gg/',
      reason: applicationData.reason || '',
      requirements: applicationData.requirements || '',
      hasOtherPartners: applicationData.hasOtherPartners || false,
      otherPartners: applicationData.otherPartners || '',
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Nicht angemeldet",
          description: "Du musst angemeldet sein, um eine Bewerbung einzureichen.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      // Get the user's Discord ID from profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('discord_id')
        .eq('id', session.user.id)
        .maybeSingle();
        
      if (profileData && profileData.discord_id) {
        setUserDiscordId(profileData.discord_id);
        form.setValue('discordId', profileData.discord_id);
        updateApplicationData({ discordId: profileData.discord_id });
      }
      
      // Check if the user has already submitted a partner application
      const { data: existingApp } = await supabase
        .from('partner_applications')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (existingApp) {
        toast({
          title: "Bewerbung bereits eingereicht",
          description: "Du hast bereits eine Partnerschaftsbewerbung eingereicht. Überprüfe den Status im Profil-Dashboard.",
        });
        navigate('/profile');
        return;
      }
      
      setLoading(false);
    };

    checkAuth();
    window.scrollTo(0, 0);
  }, [navigate]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      // Update context with latest values
      updateApplicationData(values);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Nicht angemeldet",
          description: "Du musst angemeldet sein, um fortzufahren.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }
      
      // Submit the application to Supabase
      const { data, error } = await supabase
        .from('partner_applications')
        .insert({
          user_id: session.user.id,
          discord_id: values.discordId,
          discord_invite: values.discordInvite,
          reason: values.reason,
          requirements: values.requirements,
          has_other_partners: values.hasOtherPartners,
          other_partners: values.hasOtherPartners ? values.otherPartners : null,
          status: 'pending',
        });
        
      if (error) {
        console.error('Submit error:', error);
        toast({
          title: "Fehler beim Senden",
          description: "Deine Bewerbung konnte nicht gesendet werden. Bitte versuche es später erneut.",
          variant: "destructive"
        });
        return;
      }
      
      // Show success message
      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting partner application:', error);
      toast({
        title: "Fehler",
        description: "Es gab ein Problem beim Absenden deiner Bewerbung.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow py-10 flex items-center justify-center">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
              <CardTitle className="text-2xl font-bold">Bewerbung erfolgreich eingereicht!</CardTitle>
              <CardDescription>
                Deine Partnerschaftsbewerbung wurde erfolgreich gesendet und wird von unserem Team geprüft. Du wirst in Kürze zur Profilseite weitergeleitet.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-10 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">BerlinRP-VC Partnerschaftsbewerbung</CardTitle>
              <CardDescription>
                Fülle alle Felder sorgfältig aus, um dich als Partner zu bewerben
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

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="discordId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discord ID</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Deine Discord ID" 
                            {...field} 
                            disabled={userDiscordId !== ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Deine Discord ID wird für Kommunikation und Verification verwendet.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="discordInvite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discord Einladungslink</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://discord.gg/deinserver" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Ein gültiger Einladungslink zu deinem Discord Server.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warum möchtest du eine Partnerschaft mit BerlinRP-VC eingehen?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Beschreibe deine Gründe für eine Partnerschaft..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Erkläre, warum du eine Partnerschaft mit uns eingehen möchtest und wie beide Seiten davon profitieren würden.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Was sind deine Anforderungen in dieser Partnerschaft?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Beschreibe deine Erwartungen..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Welche Erwartungen hast du an uns als Partner? Was sollten wir berücksichtigen?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasOtherPartners"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Hast du Partnerschaften mit anderen Servern?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => {
                              field.onChange(value === "true");
                              // Reset otherPartners if "no" is selected
                              if (value === "false") {
                                form.setValue("otherPartners", "");
                              }
                            }}
                            defaultValue={field.value ? "true" : "false"}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="true" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Ja
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="false" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Nein
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("hasOtherPartners") && (
                    <FormField
                      control={form.control}
                      name="otherPartners"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mit welchen Servern hast du bereits Partnerschaften?</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Liste deine vorhandenen Partner auf..." 
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Bitte nenne die Server, mit denen du bereits Partnerschaften unterhältst.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/apply')}
                    >
                      Zurück
                    </Button>
                    <Button 
                      type="submit"
                      disabled={submitting}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Wird gesendet...
                        </>
                      ) : (
                        "Bewerbung absenden"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PartnerApplicationForm;
