
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MessageSquareWarning, Pencil } from 'lucide-react';
import { requestIdChange } from '@/lib/admin/users';

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
  const [showDiscordForm, setShowDiscordForm] = useState(false);
  const [showRobloxForm, setShowRobloxForm] = useState(false);
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
          
          // If there are pending requests, disable the edit forms
          if (hasDiscordRequest) setShowDiscordForm(false);
          if (hasRobloxRequest) setShowRobloxForm(false);
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
      
      const result = await requestIdChange(userId, fieldName, newValue);
      
      if (!result.success) throw new Error(result.message);
      
      toast({
        title: 'Änderungsantrag gesendet',
        description: 'Dein Antrag wurde erfolgreich gesendet und wird von einem Administrator überprüft.',
      });
      
      // Reset form and update pending status
      if (fieldName === 'discord_id') {
        setNewDiscordId('');
        setShowDiscordForm(false);
        setPendingRequests(prev => ({ ...prev, discord: true }));
      } else {
        setNewRobloxId('');
        setShowRobloxForm(false);
        setPendingRequests(prev => ({ ...prev, roblox: true }));
      }
    } catch (error: any) {
      console.error(`Error submitting ${fieldName} change request:`, error);
      toast({
        title: 'Fehler',
        description: error.message || 'Beim Senden deines Antrags ist ein Fehler aufgetreten. Bitte versuche es später erneut.',
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
          <div className="flex items-center justify-between">
            <Label htmlFor="discord-id">Discord ID</Label>
            {!pendingRequests.discord && !showDiscordForm && (
              <Button 
                onClick={() => setShowDiscordForm(true)}
                size="sm"
                variant="ghost"
                className="h-7 px-2"
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Ändern
              </Button>
            )}
          </div>
          
          {showDiscordForm ? (
            <div className="flex items-center gap-2">
              <Input
                id="discord-id"
                placeholder={currentDiscordId || "Keine Discord ID gesetzt"}
                value={newDiscordId}
                onChange={(e) => setNewDiscordId(e.target.value)}
                disabled={isSubmitting}
              />
              <Button 
                onClick={() => handleSubmit('discord_id', newDiscordId)}
                disabled={isSubmitting || !newDiscordId.trim()}
                size="sm"
                variant="outline"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Beantragen"}
              </Button>
              <Button
                onClick={() => {
                  setShowDiscordForm(false);
                  setNewDiscordId('');
                }}
                size="sm"
                variant="ghost"
                disabled={isSubmitting}
              >
                Abbrechen
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                id="discord-id-display"
                value={currentDiscordId || "Keine Discord ID gesetzt"}
                disabled
                className="bg-gray-50"
              />
            </div>
          )}
          
          {pendingRequests.discord && (
            <div className="text-amber-600 flex items-center text-sm mt-1">
              <MessageSquareWarning className="h-4 w-4 mr-1" />
              Ein Änderungsantrag ist noch in Bearbeitung
            </div>
          )}
        </div>
        
        {/* Roblox ID Change Request */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="roblox-id">Roblox ID</Label>
            {!pendingRequests.roblox && !showRobloxForm && (
              <Button 
                onClick={() => setShowRobloxForm(true)}
                size="sm"
                variant="ghost"
                className="h-7 px-2"
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Ändern
              </Button>
            )}
          </div>
          
          {showRobloxForm ? (
            <div className="flex items-center gap-2">
              <Input
                id="roblox-id"
                placeholder={currentRobloxId || "Keine Roblox ID gesetzt"}
                value={newRobloxId}
                onChange={(e) => setNewRobloxId(e.target.value)}
                disabled={isSubmitting}
              />
              <Button 
                onClick={() => handleSubmit('roblox_id', newRobloxId)}
                disabled={isSubmitting || !newRobloxId.trim()}
                size="sm"
                variant="outline"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Beantragen"}
              </Button>
              <Button
                onClick={() => {
                  setShowRobloxForm(false);
                  setNewRobloxId('');
                }}
                size="sm"
                variant="ghost"
                disabled={isSubmitting}
              >
                Abbrechen
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                id="roblox-id-display"
                value={currentRobloxId || "Keine Roblox ID gesetzt"}
                disabled
                className="bg-gray-50"
              />
            </div>
          )}
          
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
