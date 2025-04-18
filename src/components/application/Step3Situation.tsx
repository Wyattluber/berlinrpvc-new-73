
import React, { useState } from 'react';
import { useApplication } from '@/contexts/ApplicationContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Define the form schema with Zod
const step3Schema = z.object({
  situation_handling: z.string().min(30, { message: "Bitte gib eine ausführlichere Antwort (mindestens 30 Zeichen)." }),
  bodycam_understanding: z.string().min(30, { message: "Bitte gib eine ausführlichere Antwort (mindestens 30 Zeichen)." }),
  friend_rule_violation: z.string().min(30, { message: "Bitte gib eine ausführlichere Antwort (mindestens 30 Zeichen)." }),
  other_server_names: z.string().optional(),
  other_server_invites: z.string().optional(),
  admin_experience: z.string().optional(),
  notes: z.string().optional(),
  accept_terms: z.boolean().refine(val => val === true, {
    message: "Du musst den Bedingungen zustimmen, um fortzufahren.",
  }),
});

type Step3FormData = z.infer<typeof step3Schema>;

interface Step3Props {
  onBack: () => void;
}

const Step3Situation: React.FC<Step3Props> = ({ onBack }) => {
  const { applicationData, updateApplicationData } = useApplication();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      situation_handling: applicationData.situationHandling || '',
      bodycam_understanding: applicationData.bodycamUnderstanding || '',
      friend_rule_violation: applicationData.friendRuleViolation || '',
      other_server_names: applicationData.otherServerNames || '',
      other_server_invites: applicationData.otherServerInvites || '',
      admin_experience: applicationData.adminExperience || '',
      notes: applicationData.notes || '',
      accept_terms: applicationData.acceptTerms || false,
    },
  });

  const onSubmit = async (data: Step3FormData) => {
    setIsSubmitting(true);

    try {
      updateApplicationData({
        situationHandling: data.situation_handling,
        bodycamUnderstanding: data.bodycam_understanding,
        friendRuleViolation: data.friend_rule_violation,
        otherServerNames: data.other_server_names || '',
        otherServerInvites: data.other_server_invites || '',
        adminExperience: data.admin_experience || '',
        notes: data.notes || '',
        acceptTerms: data.accept_terms,
      });
      
      // Submit application to database
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Du musst angemeldet sein, um eine Bewerbung einzureichen.");
      }
      
      // Format the server invite link
      const serverInvite = data.other_server_invites 
        ? data.other_server_invites.startsWith('http://discord.gg/') || data.other_server_invites.startsWith('https://discord.gg/')
          ? data.other_server_invites
          : `http://discord.gg/${data.other_server_invites}`
        : '';
      
      // Submit the application to Supabase
      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          roblox_username: applicationData.robloxUsername,
          roblox_id: applicationData.robloxId,
          discord_id: applicationData.discordId,
          age: Number(applicationData.age),
          activity_level: applicationData.activityLevel,
          frp_understanding: applicationData.frpUnderstanding,
          vdm_understanding: applicationData.vdmUnderstanding,
          rdm_understanding: applicationData.rdmUnderstanding,
          taschen_rp_understanding: applicationData.taschenRpUnderstanding,
          server_age_understanding: applicationData.serverAgeUnderstanding,
          situation_handling: data.situation_handling,
          bodycam_understanding: data.bodycam_understanding,
          friend_rule_violation: data.friend_rule_violation,
          other_servers: `${data.other_server_names || ''} - ${serverInvite}`,
          admin_experience: data.admin_experience || null,
          notes: data.notes || null,
          status: 'pending' // Set initial status
        });

      if (error) throw error;
      
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
      toast({
        title: "Fehler",
        description: error.message || "Es gab ein Problem beim Einreichen der Bewerbung.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to determine if text is copied from somewhere
  const checkForCopiedText = (text: string, minLength: number = 30) => {
    // This is a simplified check - you might want to expand on this based on your needs
    if (text.length >= minLength) {
      // Check for common patterns in copied text
      if (text.includes("Kopiert") || text.includes("copied") || 
          /[^\w\s,.!?-]/.test(text) || // Check for unusual characters
          text.split('\n').length > 3) { // Multiple line breaks often indicate copied text
        return "Dieser Text könnte kopiert sein. Bitte gib deine eigene Antwort.";
      }
    }
    return null;
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="situation_handling"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Es passiert eine Situation, die nicht im Regelwerk abgedeckt ist. Wie gehst du vor?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Beschreibe, wie du diese Situation handhaben würdest..."
                      className="min-h-24 resize-y"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        const warning = checkForCopiedText(e.target.value);
                        if (warning) {
                          form.setError('situation_handling', { message: warning });
                        }
                      }}
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
                  <FormLabel>Was verstehen wir unter der Bodycam Pflicht?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Erkläre den Zweck und die Regeln der Bodycam..."
                      className="min-h-20 resize-y"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        const warning = checkForCopiedText(e.target.value);
                        if (warning) {
                          form.setError('bodycam_understanding', { message: warning });
                        }
                      }}
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
                  <FormLabel>Ein Freund von dir verstößt gegen die Regeln. Was machst du?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Beschreibe, wie du in dieser Situation reagieren würdest..."
                      className="min-h-24 resize-y"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        const warning = checkForCopiedText(e.target.value);
                        if (warning) {
                          form.setError('friend_rule_violation', { message: warning });
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="other_server_names"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bist du bereits auf anderen RP Discord-Servern aktiv?</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Name des Servers" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Gib den Namen des Servers an
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="other_server_invites"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Server-Einladungslink</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-gray-100 text-gray-500 text-sm">
                          http://discord.gg/
                        </span>
                        <Input 
                          placeholder="invite-code" 
                          className="rounded-l-none"
                          value={field.value?.replace('http://discord.gg/', '')}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Optional: Gib nur den Einladungscode ein
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="admin_experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hast du schon Erfahrung im Administrativen Bereich? Wenn ja, welche?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Beschreibe deine bisherigen Erfahrungen (optional)..."
                      className="min-h-20 resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Teile uns deine bisherigen Erfahrungen mit
                  </FormDescription>
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
                      placeholder="Hast du noch Anmerkungen oder Fragen? (optional)"
                      className="min-h-20 resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Teile uns deine Gedanken, Anmerkungen oder Fragen mit
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="accept_terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6 p-4 border rounded-md bg-gray-50">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-normal">
                    <FormLabel className="font-medium">
                      Bestätigung
                    </FormLabel>
                    <FormDescription>
                      Deine Bewerbungsanfrage kann mehrere Tage in Anspruch nehmen, da unser Team ausgelastet sein könnte. Du bekommst Bescheid, sobald deine Bewerbung angenommen oder abgelehnt wurde.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          
          <div className="pt-4 flex gap-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={onBack}
              className="flex items-center gap-1"
              disabled={isSubmitting}
            >
              <ArrowLeft size={16} />
              Zurück
            </Button>
            
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Bewerbung wird eingereicht...
                </div>
              ) : (
                "Bewerbung einreichen"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default Step3Situation;
