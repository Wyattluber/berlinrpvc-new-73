
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';
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

export const AccountDeletionRequest = () => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
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
            user_id: user.id,
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
        <p className="text-sm text-red-700 mb-4">
          Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten werden permanent gelöscht.
        </p>
      </CardContent>
      <CardFooter>
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Wird gesendet...' : 'Anfrage senden'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default AccountDeletionRequest;
