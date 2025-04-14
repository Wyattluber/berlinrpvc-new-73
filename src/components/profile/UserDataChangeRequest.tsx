
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MessageSquareWarning, CheckCircle, AlertCircle } from 'lucide-react';
import { requestIdChange } from '@/lib/admin/users';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface UserDataChangeRequestProps {
  currentRobloxId: string | null;
  currentDiscordId?: string | null; 
  userId: string;
}

// Handle a more generic interface that works with how it's used in Profile.tsx
interface GenericUserDataChangeRequestProps {
  fieldName?: string;
  currentValue?: string;
  buttonText?: string;
  currentRobloxId?: string | null;
  currentDiscordId?: string | null;
  userId?: string;
}

// Validation for Discord ID and Roblox ID
const isValidDiscordId = (value: string) => /^\d{17,19}$/.test(value);
const isValidRobloxId = (value: string) => /^\d{1,10}$/.test(value);

export const UserDataChangeRequest: React.FC<GenericUserDataChangeRequestProps> = (props) => {
  // Handle both old and new prop formats
  const userId = props.userId || '';
  const fieldName = props.fieldName || 'roblox_id';
  const currentValue = props.currentValue || props.currentRobloxId || null;
  const buttonText = props.buttonText || 'ID ändern';
  
  const [newValue, setNewValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Check for existing pending requests
  React.useEffect(() => {
    const checkPendingRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('id_change_requests')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'pending')
          .eq('field_name', fieldName);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setPendingRequest(true);
        }
      } catch (error) {
        console.error(`Error checking pending requests for ${fieldName}:`, error);
      }
    };
    
    if (userId) {
      checkPendingRequests();
    }
  }, [userId, fieldName]);

  const validateInput = (value: string): boolean => {
    if (fieldName === 'discord_id') {
      if (!isValidDiscordId(value)) {
        setValidationError('Die Discord ID sollte aus 17-19 Ziffern bestehen.');
        return false;
      }
    } else if (fieldName === 'roblox_id') {
      if (!isValidRobloxId(value)) {
        setValidationError('Die Roblox ID sollte nur aus Zahlen bestehen (maximal 10 Ziffern).');
        return false;
      }
    }
    
    setValidationError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!newValue.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte gib einen Wert ein.',
        variant: 'destructive',
      });
      return;
    }

    // Validate input based on field type
    if (!validateInput(newValue)) {
      toast({
        title: 'Validierungsfehler',
        description: validationError || 'Ungültiger Wert für dieses Feld.',
        variant: 'destructive',
      });
      return;
    }

    // Current value check to avoid unnecessary requests
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
      setNewValue('');
      setPendingRequest(true);
      setSuccessMessage(true);
      setDialogOpen(false);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(false);
      }, 5000);
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

  // Get the field label based on the field name
  const getFieldLabel = () => {
    switch (fieldName) {
      case 'username':
        return 'Benutzername';
      case 'discord_id':
        return 'Discord ID';
      case 'roblox_id':
        return 'Roblox ID';
      default:
        return fieldName;
    }
  };

  // Render only the button that triggers the dialog
  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            size="sm" 
            variant="outline" 
            className="ml-2" 
            disabled={pendingRequest}
          >
            {pendingRequest ? (
              <span className="flex items-center text-amber-600">
                <MessageSquareWarning className="h-4 w-4 mr-1" />
                Antrag läuft
              </span>
            ) : successMessage ? (
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Gesendet
              </span>
            ) : (
              buttonText
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{getFieldLabel()} ändern</DialogTitle>
            <DialogDescription>
              Beantrage eine Änderung deines {getFieldLabel()}. Die Änderung muss von einem Administrator genehmigt werden.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-value">Aktueller {getFieldLabel()}</Label>
              <Input 
                id="current-value" 
                value={currentValue || "Nicht gesetzt"} 
                readOnly 
                className="bg-gray-100"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-value">Neuer {getFieldLabel()}</Label>
              <Input 
                id="new-value" 
                value={newValue} 
                onChange={(e) => setNewValue(e.target.value)} 
                placeholder={`Gib deinen neuen ${getFieldLabel()} ein`}
              />
              <p className="text-xs text-muted-foreground">
                {fieldName === 'roblox_id' ? 
                  'Deine Roblox ID findest du in deinem Roblox-Profil. Gehe zu deinem Profil, und die ID ist die Nummer in der URL.' : 
                  `Bitte gib deinen neuen ${getFieldLabel()} ein.`}
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
              disabled={isSubmitting || !newValue.trim()}
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
