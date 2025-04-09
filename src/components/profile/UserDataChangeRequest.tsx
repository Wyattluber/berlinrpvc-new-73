
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MessageSquareWarning, CheckCircle, Edit } from 'lucide-react';
import { requestIdChange } from '@/lib/admin/users';

interface UserDataChangeRequestProps {
  currentRobloxId: string | null;
  currentDiscordId?: string | null;
  userId: string;
}

export const UserDataChangeRequest: React.FC<UserDataChangeRequestProps> = ({
  currentRobloxId,
  userId
}) => {
  const [newRobloxId, setNewRobloxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Check for existing pending requests
  useEffect(() => {
    const checkPendingRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('id_change_requests')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'pending')
          .eq('field_name', 'roblox_id');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setPendingRequest(true);
        }
      } catch (error) {
        console.error('Error checking pending requests:', error);
      }
    };
    
    if (userId) {
      checkPendingRequests();
    }
  }, [userId]);

  const handleSubmit = async () => {
    if (!newRobloxId.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte gib einen Wert ein.',
        variant: 'destructive',
      });
      return;
    }

    // Current value check to avoid unnecessary requests
    if (currentRobloxId === newRobloxId) {
      toast({
        title: 'Information',
        description: 'Der neue Wert ist identisch mit dem aktuellen Wert.',
        variant: 'default',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const result = await requestIdChange(userId, 'roblox_id', newRobloxId);
      
      if (!result.success) throw new Error(result.message);
      
      toast({
        title: 'Änderungsantrag gesendet',
        description: 'Dein Antrag wurde erfolgreich gesendet und wird von einem Administrator überprüft.',
      });
      
      // Reset form and update pending status
      setNewRobloxId('');
      setPendingRequest(true);
      setSuccessMessage(true);
      setDialogOpen(false);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(false);
      }, 5000);
    } catch (error: any) {
      console.error(`Error submitting roblox_id change request:`, error);
      toast({
        title: 'Fehler',
        description: error.message || 'Beim Senden deines Antrags ist ein Fehler aufgetreten. Bitte versuche es später erneut.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render a small edit button that opens the dialog
  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            size="sm" 
            variant="ghost" 
            className="p-0 h-auto text-gray-500 hover:text-blue-600 hover:bg-transparent" 
            disabled={pendingRequest}
          >
            {pendingRequest ? (
              <span className="flex items-center text-amber-600">
                <MessageSquareWarning className="h-4 w-4" />
              </span>
            ) : successMessage ? (
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4" />
              </span>
            ) : (
              <Edit className="h-3.5 w-3.5" />
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Roblox ID ändern</DialogTitle>
            <DialogDescription>
              Beantrage eine Änderung deiner Roblox-ID. Die Änderung muss von einem Administrator genehmigt werden.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-roblox-id">Aktuelle Roblox ID</Label>
              <Input 
                id="current-roblox-id" 
                value={currentRobloxId || "Keine ID gesetzt"} 
                readOnly 
                className="bg-gray-100"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-roblox-id">Neue Roblox ID</Label>
              <Input 
                id="new-roblox-id" 
                value={newRobloxId} 
                onChange={(e) => setNewRobloxId(e.target.value)} 
                placeholder="Gib deine neue Roblox ID ein"
              />
              <p className="text-xs text-muted-foreground">
                Deine Roblox ID findest du in deinem Roblox-Profil. Gehe zu deinem Profil, und die ID ist die Nummer in der URL.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="secondary" 
              onClick={() => setDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !newRobloxId.trim()}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Änderung beantragen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserDataChangeRequest;
