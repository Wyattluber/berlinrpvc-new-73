
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { de } from "date-fns/locale";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitTeamAbsence } from '@/lib/admin/team';

interface TeamAbsenceFormProps {
  userId: string;
}

const formSchema = z.object({
  startDate: z.date({
    required_error: "Ein Startdatum ist erforderlich.",
  }),
  endDate: z.date({
    required_error: "Ein Enddatum ist erforderlich.",
  }).refine(date => date >= new Date(), {
    message: "Das Enddatum muss in der Zukunft liegen.",
  }),
  reason: z.string().min(5, {
    message: "Der Grund muss mindestens 5 Zeichen lang sein.",
  }),
});

const TeamAbsenceForm: React.FC<TeamAbsenceFormProps> = ({ userId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
      reason: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await submitTeamAbsence(userId, values.startDate, values.endDate, values.reason);
      if (result.success) {
        toast({
          title: "Erfolgreich",
          description: "Abwesenheit eingereicht!",
        });
        form.reset();
      } else {
        toast({
          title: "Fehler",
          description: result.message || "Es gab ein Problem beim Einreichen der Abwesenheit.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting absence:", error);
      toast({
        title: "Fehler",
        description: "Es gab ein Problem beim Einreichen der Abwesenheit.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Startdatum</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
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
                    locale={de}
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Wähle das Startdatum deiner Abwesenheit.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Enddatum</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
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
                    locale={de}
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Wähle das Enddatum deiner Abwesenheit.
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
              <FormLabel>Grund</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ich kann an diesem Tag nicht, weil..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Bitte gib einen kurzen Grund für deine Abwesenheit an.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              Einreichen...
            </>
          ) : (
            "Abwesenheit einreichen"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default TeamAbsenceForm;
