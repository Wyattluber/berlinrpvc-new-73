
import React, { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { submitTeamAbsence } from '@/lib/admin/team';
import { Loader2 } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamAbsenceFormProps {
  userId: string;
}

const TeamAbsenceForm: React.FC<TeamAbsenceFormProps> = ({ userId }) => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast({
        title: "Fehlende Daten",
        description: "Bitte wähle Start- und Enddatum aus.",
        variant: "destructive"
      });
      return;
    }
    
    if (startDate > endDate) {
      toast({
        title: "Ungültiger Zeitraum",
        description: "Das Startdatum muss vor dem Enddatum liegen.",
        variant: "destructive"
      });
      return;
    }
    
    if (!reason.trim()) {
      toast({
        title: "Fehlende Daten",
        description: "Bitte gib einen Grund für deine Abwesenheit an.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await submitTeamAbsence(userId, startDate, endDate, reason);
      
      if (result.success) {
        toast({
          title: "Erfolgreich eingereicht",
          description: "Deine Abwesenheit wurde erfolgreich eingereicht und wird überprüft."
        });
        
        // Reset form
        setStartDate(undefined);
        setEndDate(undefined);
        setReason('');
      } else {
        toast({
          title: "Fehler",
          description: result.message || "Ein unerwarteter Fehler ist aufgetreten.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting absence:', error);
      toast({
        title: "Fehler",
        description: "Deine Abwesenheit konnte nicht eingereicht werden.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date">Startdatum</Label>
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                id="start-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP', { locale: de }) : <span>Datum auswählen</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  setStartDateOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="end-date">Enddatum</Label>
          <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
            <PopoverTrigger asChild>
              <Button
                id="end-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP', { locale: de }) : <span>Datum auswählen</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date);
                  setEndDateOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="absence-reason">Grund für die Abwesenheit</Label>
        <Textarea
          id="absence-reason"
          placeholder="Bitte gib den Grund für deine Abwesenheit an..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wird eingereicht...
          </>
        ) : (
          'Abwesenheit einreichen'
        )}
      </Button>
    </form>
  );
};

export default TeamAbsenceForm;
