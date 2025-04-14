import React from 'react';
import { useApplication } from '@/contexts/ApplicationContext';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';

// Define the form schema with Zod for the server rules understanding
const serverRulesSchema = z.object({
  frp_understanding: z.string().min(30, { message: "Bitte antworte mit mindestens 30 Zeichen." }),
  vdm_understanding: z.string().min(30, { message: "Bitte antworte mit mindestens 30 Zeichen." }),
  taschen_rp_understanding: z.string().min(30, { message: "Bitte antworte mit mindestens 30 Zeichen." }),
  bodycam_understanding: z.string().min(30, { message: "Bitte antworte mit mindestens 30 Zeichen." }),
  server_age_understanding: z.coerce.number({ 
    required_error: "Bitte gib das Mindestalter ein.",
    invalid_type_error: "Bitte gib eine Zahl ein." 
  }).min(1, { message: "Bitte gib eine gültige Zahl ein." }),
  friend_rule_violation: z.string().min(30, { message: "Bitte antworte mit mindestens 30 Zeichen." }),
});

type ServerRulesFormData = z.infer<typeof serverRulesSchema>;

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

const Step2RulesUnderstanding: React.FC<Step2Props> = ({ onNext, onBack }) => {
  const { applicationData, updateApplicationData } = useApplication();

  const form = useForm<ServerRulesFormData>({
    resolver: zodResolver(serverRulesSchema),
    defaultValues: {
      frp_understanding: applicationData.frpUnderstanding || '',
      vdm_understanding: applicationData.vdmUnderstanding || '',
      taschen_rp_understanding: applicationData.taschenRpUnderstanding || '',
      bodycam_understanding: applicationData.bodycamUnderstanding || '',
      server_age_understanding: applicationData.serverAgeUnderstanding || undefined,
      friend_rule_violation: applicationData.friendRuleViolation || '',
    },
  });

  const onSubmit = (data: ServerRulesFormData) => {
    updateApplicationData({
      frpUnderstanding: data.frp_understanding,
      vdmUnderstanding: data.vdm_understanding,
      taschenRpUnderstanding: data.taschen_rp_understanding,
      bodycamUnderstanding: data.bodycam_understanding,
      serverAgeUnderstanding: data.server_age_understanding,
      friendRuleViolation: data.friend_rule_violation,
    });
    
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="frp_understanding"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Was verstehst du unter Fear Roleplay (FRP)?</FormLabel>
              <FormControl>
                <Textarea placeholder="Erkläre dein Verständnis von Fear Roleplay..." {...field} rows={3} />
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
              <FormLabel>Was verstehst du unter Vehicle Deathmatch (VDM)?</FormLabel>
              <FormControl>
                <Textarea placeholder="Erkläre dein Verständnis von Vehicle Deathmatch..." {...field} rows={3} />
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
              <FormLabel>Was verstehst du unter Taschen RP?</FormLabel>
              <FormControl>
                <Textarea placeholder="Erkläre dein Verständnis von Taschen RP..." {...field} rows={3} />
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
              <FormLabel>Was ist der Sinn einer Bodycam?</FormLabel>
              <FormControl>
                <Textarea placeholder="Erkläre den Sinn einer Bodycam..." {...field} rows={3} />
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
              <FormLabel>Was ist unser Server Mindestalter?</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Gib das Mindestalter ein" {...field} />
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
              <FormLabel>Nenne ein Beispiel für einen Regelbruch, wenn ein Freund beteiligt ist.</FormLabel>
              <FormControl>
                <Textarea placeholder="Beschreibe ein Szenario..." {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button variant="secondary" onClick={onBack}>
            Zurück
          </Button>
          <Button type="submit">Weiter</Button>
        </div>
      </form>
    </Form>
  );
};

export default Step2RulesUnderstanding;
