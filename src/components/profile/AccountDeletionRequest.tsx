
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, Check, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const AccountDeletionRequest = () => {
  const [open, setOpen] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Check if user has a pending deletion request
  useEffect(() => {
    const checkPendingRequest = async () => {
      try {
        setIsLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        setUserId(user.id);
        
        const { data, error } = await supabase
          .from('account_deletion_requests')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setPendingRequest(data);
          setHasPendingRequest(true);
        } else {
          setHasPendingRequest(false);
          setPendingRequest(null);
        }
      } catch (error) {
        console.error('Error checking pending deletion request:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkPendingRequest();
  }, []);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!userId) {
        toast({
          title: 'Fehler',
          description: 'Du musst angemeldet sein, um diese Aktion auszuführen.',
          variant: 'destructive',
        });
        return;
      }

      // Create account deletion request in the database
      const { error } = await supabase
        .from('account_deletion_requests')
        .insert([
          { 
            user_id: userId,
            reason,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast({
        title: 'Anfrage gesendet',
        description: 'Deine Anfrage zur Kontolöschung wurde erfolgreich gesendet und wird von unserem Team bearbeitet.',
      });
      
      setOpen(false);
      setReason('');
      setHasPendingRequest(true);
      
      // Refresh the pending request data
      const { data, error: fetchError } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (data) {
        setPendingRequest(data);
      }
    } catch (error) {
      console.error('Error submitting account deletion request:', error);
      toast({
        title: 'Fehler',
        description: 'Beim Senden deiner Anfrage ist ein Fehler aufgetreten. Bitte versuche es später erneut.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const cancelRequest = async () => {
    if (!pendingRequest || !userId) return;
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('account_deletion_requests')
        .delete()
        .eq('id', pendingRequest.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast({
        title: 'Anfrage zurückgezogen',
        description: 'Deine Anfrage zur Kontolöschung wurde erfolgreich zurückgezogen.',
      });
      
      setHasPendingRequest(false);
      setPendingRequest(null);
    } catch (error) {
      console.error('Error canceling deletion request:', error);
      toast({
        title: 'Fehler',
        description: 'Beim Zurückziehen deiner Anfrage ist ein Fehler aufgetreten. Bitte versuche es später erneut.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex justify-center items-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Konto löschen
        </CardTitle>
        <CardDescription className="text-red-700">
          Beantrage die Löschung deines Kontos und aller zugehörigen Daten
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasPendingRequest ? (
          <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
            <AlertTitle className="flex items-center font-medium">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Löschungsantrag ist ausstehend
            </AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-3">
                Dein Antrag auf Kontolöschung wird aktuell von unserem Team bearbeitet. Du wirst benachrichtigt, sobald der Antrag bearbeitet wurde.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-yellow-300 hover:bg-yellow-100 mt-1"
                onClick={cancelRequest}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
                Anfrage zurückziehen
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <p className="text-sm text-red-700 mb-4">
            Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten werden permanent gelöscht.
          </p>
        )}
      </CardContent>
      <CardFooter>
        {!hasPendingRequest && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                Kontolöschung beantragen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Kontolöschung beantragen</DialogTitle>
                <DialogDescription>
                  Bitte teile uns den Grund für die Löschung deines Kontos mit. Dies hilft uns, unseren Service zu verbessern.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Grund für die Kontolöschung</Label>
                  <Textarea
                    id="reason"
                    placeholder="Warum möchtest du dein Konto löschen?"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !reason.trim()}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Anfrage senden
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
};

export default AccountDeletionRequest;
