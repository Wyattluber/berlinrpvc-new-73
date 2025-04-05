
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const DiscordLinkManager = () => {
  const [currentLink, setCurrentLink] = useState('https://discord.gg/berlinrpvc');
  const [newLink, setNewLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchLink = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'discord_invite_link')
          .maybeSingle();

        if (error) throw error;
        
        if (data && data.value) {
          setCurrentLink(data.value);
        }
      } catch (error) {
        console.error('Error fetching Discord link:', error);
        toast({
          title: 'Fehler',
          description: 'Der Discord-Link konnte nicht geladen werden.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLink();
  }, []);

  const saveLink = async () => {
    if (!newLink.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte gib einen neuen Discord-Link ein.',
        variant: 'destructive',
      });
      return;
    }

    if (!newLink.includes('discord.gg/')) {
      toast({
        title: 'Fehler',
        description: 'Der Link muss ein gültiger Discord-Einladungslink sein (z.B. discord.gg/code).',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'discord_invite_link',
          value: newLink,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });
      
      if (error) throw error;
      
      setCurrentLink(newLink);
      setNewLink('');
      
      toast({
        title: 'Erfolg',
        description: 'Der Discord-Link wurde erfolgreich aktualisiert.',
      });
    } catch (error) {
      console.error('Error saving Discord link:', error);
      toast({
        title: 'Fehler',
        description: 'Der Discord-Link konnte nicht gespeichert werden.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <LinkIcon className="h-5 w-5 mr-2" />
          Discord-Einladungslink verwalten
        </CardTitle>
        <CardDescription>
          Ändere den Discord-Einladungslink, der auf der gesamten Website verwendet wird
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="current-link">Aktueller Link</Label>
              <div className="flex gap-2">
                <Input
                  id="current-link"
                  value={currentLink}
                  readOnly
                  className="bg-muted/50"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    navigator.clipboard.writeText(currentLink);
                    toast({
                      title: 'Kopiert',
                      description: 'Der Link wurde in die Zwischenablage kopiert.',
                    });
                  }}
                >
                  Kopieren
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 pt-4">
              <Label htmlFor="new-link">Neuer Link</Label>
              <div className="flex gap-2">
                <Input
                  id="new-link"
                  placeholder="https://discord.gg/neuercode"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  disabled={isSaving}
                />
                <Button 
                  type="button" 
                  onClick={saveLink} 
                  disabled={isSaving || !newLink.trim()}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Speichern
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              Hinweis: Dieser Link wird überall auf der Website verwendet, wo auf den Discord-Server verwiesen wird.
              Stelle sicher, dass der Link gültig ist und nicht abläuft.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DiscordLinkManager;
