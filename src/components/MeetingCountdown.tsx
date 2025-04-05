
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TeamSettings {
  meeting_day: string;
  meeting_time: string;
  meeting_frequency: string;
  meeting_notes: string;
  meeting_location: string;
}

const MeetingCountdown = () => {
  const [settings, setSettings] = useState<TeamSettings | null>(null);
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [nextMeetingDate, setNextMeetingDate] = useState<Date | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
          .maybeSingle();
        
        setIsAdmin(!!adminData);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('team_settings')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (error) throw error;
        if (data) {
          console.log("Fetched team settings:", data);
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching team settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!settings) return;
    
    console.log("Calculating next meeting with settings:", settings);
    
    const calculateNextMeeting = () => {
      const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
      const targetDay = weekdays.indexOf(settings.meeting_day);
      
      console.log("Target day index:", targetDay, "from day name:", settings.meeting_day);
      
      if (targetDay === -1) {
        console.error("Invalid meeting day:", settings.meeting_day);
        return null;
      }
      
      const now = new Date();
      const [hours, minutes] = settings.meeting_time.split(':').map(Number);
      
      console.log("Parsed meeting time:", hours, ":", minutes);
      
      // Calculate days until next meeting
      let daysUntil = (targetDay + 7 - now.getDay()) % 7;
      if (daysUntil === 0) {
        // If it's the same day, check if the meeting time has already passed
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        if (currentHour > hours || (currentHour === hours && currentMinute >= minutes)) {
          // Meeting time today has passed, so next meeting is in 7 days
          daysUntil = 7;
        }
      }
      
      console.log("Days until next meeting:", daysUntil);
      
      // Create date for next meeting
      const nextMeeting = new Date(now);
      nextMeeting.setDate(now.getDate() + daysUntil);
      nextMeeting.setHours(hours, minutes, 0, 0);
      
      console.log("Next meeting date calculated:", nextMeeting);
      
      return nextMeeting;
    };
    
    const updateCountdown = () => {
      const nextMeeting = calculateNextMeeting();
      if (!nextMeeting) {
        console.error("Could not calculate next meeting date");
        setCountdown(null);
        return;
      }
      
      setNextMeetingDate(nextMeeting);
      
      const now = new Date();
      const timeDiff = nextMeeting.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      setCountdown({ days, hours, minutes, seconds });
    };
    
    // Initial update
    updateCountdown();
    
    // Set up interval
    const intervalId = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(intervalId);
  }, [settings]);

  const formatMeetingDate = (date: Date | null) => {
    if (!date) return 'Datum unbekannt';
    
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ', ' + date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + ' Uhr';
  };

  if (!isAdmin) {
    return null; // Only show to admins and moderators
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team-Meeting</CardTitle>
          <CardDescription>Lädt...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team-Meeting</CardTitle>
          <CardDescription>Keine Meeting-Einstellungen gefunden</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-500" />
          Team-Meeting
        </CardTitle>
        <CardDescription>
          {settings.meeting_frequency}: {settings.meeting_day} um {settings.meeting_time} Uhr
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <div className="font-medium text-sm text-muted-foreground mb-1">Nächstes Meeting:</div>
          <div className="font-medium mb-3">{formatMeetingDate(nextMeetingDate)}</div>
          
          {countdown ? (
            <div className="grid grid-cols-4 gap-1 text-center">
              <div className="bg-gray-100 rounded p-2">
                <div className="text-lg font-semibold">{countdown.days}</div>
                <div className="text-xs text-muted-foreground">Tage</div>
              </div>
              <div className="bg-gray-100 rounded p-2">
                <div className="text-lg font-semibold">{countdown.hours}</div>
                <div className="text-xs text-muted-foreground">Std</div>
              </div>
              <div className="bg-gray-100 rounded p-2">
                <div className="text-lg font-semibold">{countdown.minutes}</div>
                <div className="text-xs text-muted-foreground">Min</div>
              </div>
              <div className="bg-gray-100 rounded p-2">
                <div className="text-lg font-semibold">{countdown.seconds}</div>
                <div className="text-xs text-muted-foreground">Sek</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-center p-4 bg-gray-100 rounded">
              Countdown konnte nicht berechnet werden
            </div>
          )}
        </div>
        
        <div className="flex items-start mt-3 text-sm">
          <Clock className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
          <div>
            <span className="font-medium">Ort:</span> {settings.meeting_location}
            {settings.meeting_notes && (
              <p className="mt-1 text-muted-foreground text-xs">{settings.meeting_notes}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MeetingCountdown;
