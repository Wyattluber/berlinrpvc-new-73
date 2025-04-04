
import React from 'react';
import { useApplication } from '@/contexts/ApplicationContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Define the form schema with Zod
const step2Schema = z.object({
  why_moderator: z.string().min(30, { message: "Bitte gib eine ausführlichere Antwort (mindestens 30 Zeichen)." }),
  frp_understanding: z.string().min(30, { message: "Bitte gib eine ausführlichere Antwort (mindestens 30 Zeichen)." }),
  vdm_understanding: z.string().min(30, { message: "Bitte gib eine ausführlichere Antwort (mindestens 30 Zeichen)." }),
  taschen_rp_understanding: z.string().min(30, { message: "Bitte gib eine ausführlichere Antwort (mindestens 30 Zeichen)." }),
  server_age_understanding: z.string().min(30, { message: "Bitte gib eine ausführlichere Antwort (mindestens 30 Zeichen)." }),
});

type Step2FormData = z.infer<typeof step2Schema>;

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

const Step2RulesUnderstanding: React.FC<Step2Props> = ({ onNext, onBack }) => {
  const { applicationData, updateApplicationData } = useApplication();

  const form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      why_moderator: applicationData.whyModerator || '',
      frp_understanding: applicationData.frpUnderstanding || '',
      vdm_understanding: applicationData.vdmUnderstanding || '',
      taschen_rp_understanding: applicationData.taschenRpUnderstanding || '',
      server_age_understanding: applicationData.serverAgeUnderstanding || '',
    },
  });

  const onSubmit = (data: Step2FormData) => {
    updateApplicationData({
      whyModerator: data.why_moderator,
      frpUnderstanding: data.frp_understanding,
      vdmUnderstanding: data.vdm_understanding,
      taschenRpUnderstanding: data.taschen_rp_understanding,
      serverAgeUnderstanding: data.server_age_understanding,
    });
    
    onNext();
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="why_moderator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warum möchtest du Moderator werden und welche Erfahrungen hast du schon gemacht?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Beschreibe deine Motivation und bisherige Erfahrungen..."
                      className="min-h-20 resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="frp_understanding"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Was versteht man unter FRP (Fail-Roleplay)?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Erkläre, was FRP ist und gib Beispiele..."
                      className="min-h-20 resize-y"
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
                  <FormLabel>Was versteht man unter VDM (Vehicle-Deathmatch)?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Erkläre, was VDM ist und gib Beispiele..."
                      className="min-h-20 resize-y"
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
                  <FormLabel>Was versteht man unter Taschen-RP?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Erkläre, was Taschen-RP ist und warum es verboten ist..."
                      className="min-h-20 resize-y"
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
                  <FormLabel>Was ist unser Server Mindestalter?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Erläutere die Altersregeln unseres Servers..."
                      className="min-h-20 resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
            >
              <ArrowLeft size={16} />
              Zurück
            </Button>
            
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700"
            >
              Weiter
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default Step2RulesUnderstanding;
