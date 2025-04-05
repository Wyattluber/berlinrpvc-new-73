
import React, { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getTeamSettings } from '@/lib/adminService';

interface TeamAbsenceFormProps {
  userId: string;
  onSuccess?: () => void;
}

const TeamAbsenceForm: React.FC<TeamAbsenceFormProps> = ({ userId, onSuccess }) => {
  const [absenceDate, setAbsenceDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFutureAbsence, setIsFutureAbsence] = useState(true);
  const [nextMeetingDate, setNextMeetingDate] = useState<Date | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Fetch team meeting settings to suggest the next meeting date
  useEffect(() => {
    const fetchTeamSettings = async () => {
      setLoadingSettings(true);
      try {
        const settings = await getTeamSettings();
        if (settings && settings.meeting_day && settings.meeting_time) {
          const nextDate = calculateNextMeetingDate(settings.meeting_day, settings.meeting_time);
          setNextMeetingDate(nextDate);
          setAbsenceDate(nextDate); // Pre-select the next meeting date
        }
      } catch (error) {
        console.error('Error fetching team settings:', error);
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchTeamSettings();
  }, []);

  // Calculate the next meeting date based on day and time
  const calculateNextMeetingDate = (dayName: string, timeString: string): Date => {
    const daysOfWeek = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const targetDayIndex = daysOfWeek.indexOf(dayName);
    
    if (targetDayIndex === -1) return new Date(); // Default to today if day not found
    
    const today = new Date();
    const todayDayIndex = today.getDay();
    
    // Calculate days to add to get to the next occurrence of the target day
    let daysToAdd = targetDayIndex - todayDayIndex;
    if (daysToAdd <= 0) daysToAdd += 7; // If today or already passed this week
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysToAdd);
    
    // Set the time
    if (timeString) {
      const [hours, minutes] = timeString.split(':').map(Number);
      nextDate.setHours(hours || 0, minutes || 0, 0, 0);
    }
    
    return nextDate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!absenceDate) {
      toast({
        title: "Fehler",
        description: "Bitte wähle ein Datum für deine Abwesenheit.",
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
      // Format the date properly to ISO string
      const endDateIso = absenceDate.toISOString();
      
      const { error } = await supabase
        .from('team_absences')
        .insert({
          user_id: userId,
          end_date: endDateIso,
          reason,
          status: 'pending'
        });
        
      if (error) throw error;
      
      toast({
        title: "Abmeldung erfolgreich",
        description: "Deine Abmeldung wurde erfolgreich eingereicht."
      });
      
      setAbsenceDate(nextMeetingDate || undefined);
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

  // Determine the minimum date based on isFutureAbsence
  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isFutureAbsence ? today : undefined;
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {loadingSettings ? (
        <div className="flex justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="flex items-center space-x-2">
            <Switch
              id="future-absence"
              checked={isFutureAbsence}
              onCheckedChange={setIsFutureAbsence}
            />
            <Label htmlFor="future-absence">Nur zukünftige Daten erlauben</Label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Abwesenheit am:</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !absenceDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {absenceDate ? format(absenceDate, 'PPP', { locale: de }) : <span>Datum auswählen</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={absenceDate}
                  onSelect={setAbsenceDate}
                  initialFocus
                  fromDate={getMinDate()}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            
            {nextMeetingDate && (
              <p className="text-xs text-muted-foreground mt-1">
                Nächstes Team-Meeting: {format(nextMeetingDate, 'PPP', { locale: de })} um {format(nextMeetingDate, 'HH:mm', { locale: de })} Uhr
              </p>
            )}
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
        </>
      )}
    </form>
  );
};

export default TeamAbsenceForm;
