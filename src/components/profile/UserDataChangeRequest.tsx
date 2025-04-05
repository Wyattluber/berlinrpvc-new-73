
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MessageSquareWarning } from 'lucide-react';

interface UserDataChangeRequestProps {
  currentDiscordId: string | null;
  currentRobloxId: string | null;
  userId: string;
}

export const UserDataChangeRequest: React.FC<UserDataChangeRequestProps> = ({
  currentDiscordId,
  currentRobloxId,
  userId
}) => {
  const [newDiscordId, setNewDiscordId] = useState('');
  const [newRobloxId, setNewRobloxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<{discord: boolean, roblox: boolean}>({
    discord: false,
    roblox: false
  });

  // Check for existing pending requests
  React.useEffect(() => {
    const checkPendingRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('id_change_requests')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'pending');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const hasDiscordRequest = data.some(req => req.field_name === 'discord_id');
          const hasRobloxRequest = data.some(req => req.field_name === 'roblox_id');
          
          setPendingRequests({
            discord: hasDiscordRequest,
            roblox: hasRobloxRequest
          });
        }
      } catch (error) {
        console.error('Error checking pending requests:', error);
      }
    };
    
    if (userId) {
      checkPendingRequests();
    }
  }, [userId]);

  const handleSubmit = async (fieldName: 'discord_id' | 'roblox_id', newValue: string) => {
    if (!newValue.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte gib einen Wert ein.',
        variant: 'destructive',
      });
      return;
    }

    // Current value check to avoid unnecessary requests
    const currentValue = fieldName === 'discord_id' ? currentDiscordId : currentRobloxId;
    if (currentValue === newValue) {
      toast({
        title: 'Information',
        description: 'Der neue Wert ist identisch mit dem aktuellen Wert.',
        variant: 'default',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('id_change_requests')
        .insert([
          { 
            user_id: userId,
            field_name: fieldName,
            new_value: newValue,
            status: 'pending'
          }
        ]);
      
      if (error) throw error;
      
      toast({
        title: 'Änderungsantrag gesendet',
        description: 'Dein Antrag wurde erfolgreich gesendet und wird von einem Administrator überprüft.',
      });
      
      // Reset form and update pending status
      if (fieldName === 'discord_id') {
        setNewDiscordId('');
        setPendingRequests(prev => ({ ...prev, discord: true }));
      } else {
        setNewRobloxId('');
        setPendingRequests(prev => ({ ...prev, roblox: true }));
      }
    } catch (error) {
      console.error(`Error submitting ${fieldName} change request:`, error);
      toast({
        title: 'Fehler',
        description: 'Beim Senden deines Antrags ist ein Fehler aufgetreten. Bitte versuche es später erneut.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>ID-Änderungsanträge</CardTitle>
        <CardDescription>
          Beantrage eine Änderung deiner Discord- oder Roblox-ID
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Discord ID Change Request */}
        <div className="space-y-2">
          <Label htmlFor="discord-id">Discord ID</Label>
          <div className="flex items-center gap-2">
            <Input
              id="discord-id"
              placeholder={currentDiscordId || "Keine Discord ID gesetzt"}
              value={newDiscordId}
              onChange={(e) => setNewDiscordId(e.target.value)}
              disabled={isSubmitting || pendingRequests.discord}
            />
            <Button 
              onClick={() => handleSubmit('discord_id', newDiscordId)}
              disabled={isSubmitting || pendingRequests.discord || !newDiscordId.trim()}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Beantragen"}
            </Button>
          </div>
          {pendingRequests.discord && (
            <div className="text-amber-600 flex items-center text-sm mt-1">
              <MessageSquareWarning className="h-4 w-4 mr-1" />
              Ein Änderungsantrag ist noch in Bearbeitung
            </div>
          )}
        </div>
        
        {/* Roblox ID Change Request */}
        <div className="space-y-2">
          <Label htmlFor="roblox-id">Roblox ID</Label>
          <div className="flex items-center gap-2">
            <Input
              id="roblox-id"
              placeholder={currentRobloxId || "Keine Roblox ID gesetzt"}
              value={newRobloxId}
              onChange={(e) => setNewRobloxId(e.target.value)}
              disabled={isSubmitting || pendingRequests.roblox}
            />
            <Button 
              onClick={() => handleSubmit('roblox_id', newRobloxId)}
              disabled={isSubmitting || pendingRequests.roblox || !newRobloxId.trim()}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Beantragen"}
            </Button>
          </div>
          {pendingRequests.roblox && (
            <div className="text-amber-600 flex items-center text-sm mt-1">
              <MessageSquareWarning className="h-4 w-4 mr-1" />
              Ein Änderungsantrag ist noch in Bearbeitung
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Hinweis: Änderungen an deinen IDs müssen von einem Administrator genehmigt werden, um Missbrauch zu verhindern.
      </CardFooter>
    </Card>
  );
};

export default UserDataChangeRequest;
