
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const partnershipFormSchema = z.object({
  discord_id: z.string().min(1, { message: "Discord ID ist erforderlich" }),
  discord_invite: z.string()
    .min(1, { message: "Discord Einladungslink ist erforderlich" })
    .regex(/^[a-zA-Z0-9]+$/, { 
      message: "Bitte nur den Einladungscode eingeben (z.B. 'abcdef123')" 
    }),
  reason: z.string().min(20, { message: "Bitte gib mindestens 20 Zeichen an" }),
  requirements: z.string().min(10, { message: "Bitte gib mindestens 10 Zeichen an" }),
  has_other_partners: z.enum(["true", "false"]),
  other_partners: z.string().optional(),
});

type PartnershipFormValues = z.infer<typeof partnershipFormSchema>;

const PartnershipRequestForm = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [userDiscordId, setUserDiscordId] = useState('');

  const form = useForm<PartnershipFormValues>({
    resolver: zodResolver(partnershipFormSchema),
    defaultValues: {
      discord_id: '',
      discord_invite: '',
      reason: '',
      requirements: '',
      has_other_partners: 'false',
      other_partners: '',
    },
  });

  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!session) return;

      setLoading(true);
      try {
        // Check if user has already submitted a partnership application
        const { data, error } = await supabase
          .from('partner_applications')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setExistingApplication(data);
        }

        // Get user discord ID from profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('discord_id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (profileData?.discord_id) {
          setUserDiscordId(profileData.discord_id);
          form.setValue('discord_id', profileData.discord_id);
        }
      } catch (error) {
        console.error('Error checking existing application:', error);
        toast({
          title: 'Fehler',
          description: 'Daten konnten nicht geladen werden.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    checkExistingApplication();
  }, [session, form]);

  const onSubmit = async (values: PartnershipFormValues) => {
    if (!session) {
      toast({
        title: 'Nicht angemeldet',
        description: 'Du musst angemeldet sein, um eine Partnerschaftsanfrage zu stellen.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Convert string to boolean for database storage
      const hasOtherPartnersBoolean = values.has_other_partners === 'true';
      
      // Prepare the data to be inserted
      const partnershipData = {
        user_id: session.user.id,
        discord_id: values.discord_id,
        discord_invite: values.discord_invite,
        reason: values.reason,
        requirements: values.requirements,
        has_other_partners: hasOtherPartnersBoolean,
        other_partners: hasOtherPartnersBoolean ? values.other_partners : null,
        status: 'pending'
      };

      const { error } = await supabase
        .from('partner_applications')
        .insert([partnershipData]);

      if (error) throw error;

      toast({
        title: 'Erfolgreich eingereicht',
        description: 'Deine Partnerschaftsanfrage wurde erfolgreich eingereicht.',
      });
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting partnership request:', error);
      toast({
        title: 'Fehler',
        description: 'Deine Partnerschaftsanfrage konnte nicht eingereicht werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Lade Formular...</span>
      </div>
    );
  }

  if (submitted || existingApplication) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Partnerschaftsanfrage</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Anfrage eingereicht</h3>
          <p className="text-gray-600 mb-4">
            Deine Partnerschaftsanfrage wurde erfolgreich eingereicht und wird von unserem Team überprüft.
            Du kannst den Status deiner Anfrage in deinem Profil einsehen.
          </p>
          
          {existingApplication && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg w-full">
              <h4 className="font-semibold mb-1">Status: <span className={
                existingApplication.status === 'approved' ? 'text-green-600' : 
                existingApplication.status === 'rejected' ? 'text-red-600' : 
                'text-yellow-600'
              }>
                {existingApplication.status === 'approved' ? 'Angenommen' : 
                existingApplication.status === 'rejected' ? 'Abgelehnt' : 
                'In Bearbeitung'}
              </span></h4>
              <p className="text-sm text-gray-500">Eingereicht am: {new Date(existingApplication.created_at).toLocaleDateString('de-DE')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Partnerschaft mit BerlinRP-VC</CardTitle>
        <CardDescription className="text-center">
          Fülle das Formular aus, um eine Partnerschaft mit unserem Server zu beantragen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="discord_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discord ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Deine Discord ID" 
                      {...field} 
                      disabled={!!userDiscordId}
                    />
                  </FormControl>
                  <FormDescription>
                    {userDiscordId ? "Aus deinem Profil übernommen" : "Deine Discord-Benutzer ID"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discord_invite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discord Einladungscode</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <div className="bg-gray-100 flex items-center px-3 rounded-l-md border border-r-0 border-input">
                        https://discord.gg/
                      </div>
                      <Input 
                        className="rounded-l-none" 
                        placeholder="abcdef123" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Nur den Einladungscode eingeben, der nach "discord.gg/" folgt
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
                      placeholder="Beschreibe warum du eine Partnerschaft mit uns möchtest..." 
                      {...field} 
                      rows={4}
                    />
                  </FormControl>
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
                      placeholder="Beschreibe deine Erwartungen und Anforderungen..." 
                      {...field} 
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="has_other_partners"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hast du Partnerschaften mit anderen Servern?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="true" />
                        </FormControl>
                        <FormLabel className="font-normal">Ja</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="false" />
                        </FormControl>
                        <FormLabel className="font-normal">Nein</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('has_other_partners') === 'true' && (
              <FormField
                control={form.control}
                name="other_partners"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mit welchen Servern hast du Partnerschaften?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Liste die Server auf, mit denen du bereits Partnerschaften hast..." 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird eingereicht...
                </>
              ) : "Partnerschaftsanfrage einreichen"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PartnershipRequestForm;
