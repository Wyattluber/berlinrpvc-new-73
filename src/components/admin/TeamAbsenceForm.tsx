
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2 } from 'lucide-react';

interface TeamAbsenceFormProps {
  userId: string;
  onSuccess?: () => void;
}

const TeamAbsenceForm: React.FC<TeamAbsenceFormProps> = ({ userId, onSuccess }) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast({
        title: "Fehler",
        description: "Bitte wähle ein Datum aus, an dem du abwesend sein wirst.",
        variant: "destructive"
      });
      return;
    }
    
    if (!reason.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib einen Grund für deine Abwesenheit an.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format the date to ensure midnight in the user's local timezone
      const formattedDate = new Date(date);
      
      const { error } = await supabase
        .from('team_absences')
        .insert({
          user_id: userId,
          end_date: formattedDate.toISOString(),
          reason,
          status: 'pending'
        });
        
      if (error) throw error;
      
      toast({
        title: "Abmeldung erfolgreich",
        description: "Deine Abmeldung wurde erfolgreich eingereicht."
      });
      
      setDate(undefined);
      setReason('');
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error submitting absence:', error);
      toast({
        title: "Fehler",
        description: "Es gab ein Problem beim Einreichen deiner Abmeldung: " + (error.message || "Unbekannter Fehler"),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Abwesend am:</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP', { locale: de }) : <span>Datum auswählen</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              disabled={(date) => date < new Date()}
              className={cn("p-3 pointer-events-auto")}
              locale={de}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Grund:</label>
        <Textarea 
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Gib einen Grund für deine Abwesenheit an..."
          rows={3}
        />
      </div>
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Abmelden...
          </>
        ) : "Vom Team-Meeting abmelden"}
      </Button>
    </form>
  );
};

export default TeamAbsenceForm;
