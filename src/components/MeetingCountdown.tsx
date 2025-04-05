
import React, { useState, useEffect } from 'react';
import { getTeamSettings } from '@/lib/admin/team';
import { Calendar, Clock, Users, MessageSquare } from 'lucide-react';

// Format meeting day in German
const formatMeetingDay = (day: string) => {
  const days: Record<string, string> = {
    'monday': 'Montag',
    'tuesday': 'Dienstag',
    'wednesday': 'Mittwoch',
    'thursday': 'Donnerstag',
    'friday': 'Freitag',
    'saturday': 'Samstag',
    'sunday': 'Sonntag'
  };
  return days[day.toLowerCase()] || day;
};

// Get next meeting date based on settings
const getNextMeetingDate = (dayOfWeek: string, timeString: string): Date | null => {
  try {
    if (!dayOfWeek || !timeString) return null;
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(dayOfWeek.toLowerCase());
    if (targetDay === -1) return null;
    
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate days until next meeting
    let daysUntil = targetDay - currentDay;
    if (daysUntil < 0) daysUntil += 7; // Next week
    
    // If it's the same day, check if the meeting time has passed
    if (daysUntil === 0) {
      const [hours, minutes] = timeString.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return null;
      
      const meetingTimeToday = new Date();
      meetingTimeToday.setHours(hours, minutes, 0, 0);
      
      if (now > meetingTimeToday) {
        daysUntil = 7; // Next week
      }
    }
    
    // Calculate next meeting date
    const nextMeeting = new Date();
    nextMeeting.setDate(now.getDate() + daysUntil);
    
    // Set meeting time
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    
    nextMeeting.setHours(hours, minutes, 0, 0);
    
    return nextMeeting;
  } catch (error) {
    console.error("Error calculating next meeting date:", error);
    return null;
  }
};

// Calculate time remaining until meeting
const getTimeRemaining = (meetingDate: Date) => {
  try {
    const now = new Date();
    const diff = meetingDate.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  } catch (error) {
    console.error("Error calculating time remaining:", error);
    return null;
  }
};

// Format the countdown text
const formatCountdown = (timeRemaining: { days: number; hours: number; minutes: number } | null) => {
  if (!timeRemaining) return 'Jetzt!';
  
  const { days, hours, minutes } = timeRemaining;
  
  if (days > 0) {
    return `in ${days} Tag${days !== 1 ? 'en' : ''} und ${hours} Stunde${hours !== 1 ? 'n' : ''}`;
  } else if (hours > 0) {
    return `in ${hours} Stunde${hours !== 1 ? 'n' : ''} und ${minutes} Minute${minutes !== 1 ? 'n' : ''}`;
  } else {
    return `in ${minutes} Minute${minutes !== 1 ? 'n' : ''}`;
  }
};

type MeetingCountdownProps = {
  className?: string;
}

const MeetingCountdown: React.FC<MeetingCountdownProps> = ({ className }) => {
  const [teamSettings, setTeamSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nextMeeting, setNextMeeting] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{ days: number; hours: number; minutes: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch team settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const settings = await getTeamSettings();
        setTeamSettings(settings);
        
        if (settings?.meeting_day && settings?.meeting_time) {
          const meetingDate = getNextMeetingDate(settings.meeting_day, settings.meeting_time);
          if (meetingDate) {
            setNextMeeting(meetingDate);
          } else {
            setError("Nächstes Meeting konnte nicht berechnet werden - ungültiges Format für Tag oder Zeit");
          }
        } else {
          setError("Keine Meeting-Daten angegeben");
        }
      } catch (error) {
        console.error('Error fetching team settings:', error);
        setError("Fehler beim Laden der Team-Einstellungen");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  // Update countdown timer
  useEffect(() => {
    if (!nextMeeting) return;
    
    const updateCountdown = () => {
      const remaining = getTimeRemaining(nextMeeting);
      setTimeRemaining(remaining);
    };
    
    // Initial update
    updateCountdown();
    
    // Update every minute
    const interval = setInterval(updateCountdown, 60000);
    
    return () => clearInterval(interval);
  }, [nextMeeting]);
  
  if (loading) {
    return <div className="text-center p-2">Lade Teammeetings...</div>;
  }
  
  if (error) {
    return (
      <div className={`space-y-1 ${className}`}>
        <p className="text-sm font-medium text-red-500">Fehler: {error}</p>
        <p className="text-xs text-gray-500">Teammeetings werden im Admin-Panel konfiguriert</p>
      </div>
    );
  }
  
  if (!teamSettings || !teamSettings.meeting_day || !teamSettings.meeting_time) {
    return (
      <div className={`space-y-1 ${className}`}>
        <p className="text-sm font-medium">Kein Teammeeting geplant</p>
        <p className="text-xs text-gray-500">Teammeetings werden im Admin-Panel konfiguriert</p>
      </div>
    );
  }
  
  const formattedDate = nextMeeting ? nextMeeting.toLocaleDateString('de-DE', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : 'Unbekannt';
  
  const formattedTime = nextMeeting ? nextMeeting.toLocaleTimeString('de-DE', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  }) : 'Unbekannt';
  
  return (
    <div className={`space-y-1 ${className}`}>
      <p className="text-sm font-semibold">
        Nächstes Meeting: {formattedDate}
      </p>
      <p className="text-sm">
        <span className="font-medium">{formatCountdown(timeRemaining)}</span>
      </p>
      <div className="space-y-1 mt-2">
        <p className="text-sm font-medium flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
          <span>{formatMeetingDay(teamSettings.meeting_day)}</span>
        </p>
        <p className="text-sm font-medium flex items-center">
          <Clock className="h-4 w-4 mr-2 text-blue-500" />
          <span>{teamSettings.meeting_time} Uhr</span>
        </p>
        <p className="text-sm font-medium flex items-center">
          <Users className="h-4 w-4 mr-2 text-blue-500" />
          <span>{teamSettings.meeting_frequency || 'Wöchentlich'}</span>
        </p>
        <p className="text-sm font-medium flex items-center">
          <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
          <span>{teamSettings.meeting_location || 'Discord'}</span>
        </p>
      </div>
      {teamSettings.meeting_notes && (
        <p className="text-xs text-gray-600 mt-1">
          {teamSettings.meeting_notes}
        </p>
      )}
    </div>
  );
};

export default MeetingCountdown;
