
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const absenceFormSchema = z.object({
  startDate: z.date({
    required_error: "Bitte wähle ein Datum für den Beginn deiner Abwesenheit.",
  }),
  endDate: z.date({
    required_error: "Bitte wähle ein Datum für das Ende deiner Abwesenheit.",
  }).refine(date => date >= new Date(), {
    message: "Das Enddatum muss in der Zukunft liegen.",
  }),
  reason: z.string().min(10, {
    message: "Bitte gib einen Grund mit mindestens 10 Zeichen an.",
  }),
}).refine(data => data.startDate <= data.endDate, {
  message: "Das Startdatum muss vor oder gleich dem Enddatum sein.",
  path: ["endDate"],
});

type AbsenceFormValues = z.infer<typeof absenceFormSchema>;

interface TeamAbsenceFormProps {
  userId: string;
  onSuccess?: () => void;
}

const TeamAbsenceForm: React.FC<TeamAbsenceFormProps> = ({ userId, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<AbsenceFormValues>({
    resolver: zodResolver(absenceFormSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
      reason: '',
    },
  });

  const onSubmit = async (values: AbsenceFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('team_absences')
        .insert({
          user_id: userId,
          start_date: values.startDate.toISOString(),
          end_date: values.endDate.toISOString(),
          reason: values.reason,
          status: 'pending'
        });

      if (error) throw error;
      
      toast({
        title: "Abwesenheit eingereicht",
        description: "Deine Abwesenheit wurde erfolgreich eingereicht.",
      });
      
      form.reset({
        startDate: new Date(),
        endDate: new Date(),
        reason: '',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting absence:', error);
      toast({
        title: "Fehler",
        description: "Deine Abwesenheit konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Beginn der Abwesenheit</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: de })
                        ) : (
                          <span>Datum auswählen</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ende der Abwesenheit</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: de })
                        ) : (
                          <span>Datum auswählen</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grund für die Abwesenheit</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Bitte gib einen Grund für deine Abwesenheit an..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird gespeichert...
            </>
          ) : (
            'Abwesenheit einreichen'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default TeamAbsenceForm;
