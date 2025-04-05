
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getTeamSettings, updateTeamSettings } from '@/lib/admin/team';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoaderIcon } from 'lucide-react';

const defaultNotesText = "Team-Meeting findet im Discord Moderator-Stage-Kanal statt. Wer nicht kann meldet sich bitte ab.";

const TeamSettingsForm = () => {
  const [settings, setSettings] = useState({
    meeting_day: '',
    meeting_time: '',
    meeting_notes: defaultNotesText
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const teamSettings = await getTeamSettings();
        if (teamSettings) {
          setSettings({
            meeting_day: teamSettings.meeting_day || '',
            meeting_time: teamSettings.meeting_time || '',
            meeting_notes: teamSettings.meeting_notes || defaultNotesText
          });
        } else {
          // Set default values if no settings exist
          setSettings({
            meeting_day: '',
            meeting_time: '',
            meeting_notes: defaultNotesText
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: 'Fehler',
          description: 'Die Einstellungen konnten nicht geladen werden.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const result = await updateTeamSettings(settings);
      if (result.success) {
        toast({
          title: 'Erfolg',
          description: 'Die Einstellungen wurden gespeichert.'
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message || 'Die Einstellungen konnten nicht gespeichert werden.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Meetings</CardTitle>
        <CardDescription>
          Konfiguriere die Einstellungen für Team-Meetings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <LoaderIcon className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meeting_day">Meeting-Tag</Label>
                <Input
                  id="meeting_day"
                  type="date"
                  value={settings.meeting_day}
                  onChange={(e) => setSettings({...settings, meeting_day: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting_time">Meeting-Zeit</Label>
                <Input 
                  id="meeting_time" 
                  type="time" 
                  value={settings.meeting_time} 
                  onChange={(e) => setSettings({...settings, meeting_time: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting_notes">Notizen</Label>
              <Textarea 
                id="meeting_notes" 
                value={settings.meeting_notes} 
                onChange={(e) => setSettings({...settings, meeting_notes: e.target.value})}
                placeholder="Zusätzliche Informationen zu den Meetings..."
                rows={3}
              />
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={saving || loading}>
          {saving ? (
            <>
              <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
              Speichern...
            </>
          ) : 'Einstellungen speichern'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TeamSettingsForm;
