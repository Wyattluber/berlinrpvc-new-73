
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

const AccountDeletionRequest: React.FC = () => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Get current user ID
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Fehler",
          description: "Du musst angemeldet sein, um deinen Account zu löschen.",
          variant: "destructive"
        });
        return;
      }
      
      // Calculate scheduled deletion time (24 hours from now)
      const scheduledDeletion = new Date();
      scheduledDeletion.setHours(scheduledDeletion.getHours() + 24);
      
      // Insert deletion request
      const { error } = await supabase
        .from('account_deletion_requests')
        .insert({
          user_id: session.user.id,
          reason: reason.trim() || 'Keine Begründung angegeben',
          status: 'pending',
          scheduled_deletion: scheduledDeletion.toISOString()
        });
      
      if (error) throw error;
      
      toast({
        title: "Löschungsantrag gesendet",
        description: "Dein Antrag zur Löschung deines Accounts wurde gesendet. Dein Konto wird in 24 Stunden gelöscht."
      });
      
      // Log the user out
      await supabase.auth.signOut();
      
      // Redirect to login page
      navigate('/login');
    } catch (error: any) {
      console.error('Error submitting deletion request:', error);
      toast({
        title: "Fehler",
        description: error.message || "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setConfirmDialogOpen(false);
    }
  };

  return (
    <Card className="mt-6 border-red-100">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
          Konto löschen
        </CardTitle>
        <CardDescription>
          Wenn du dein Konto löschst, werden alle deine Daten unwiderruflich entfernt
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800 text-sm">
            <p className="font-medium mb-2">Wichtige Information:</p>
            <p>Die Löschung deines Kontos ist dauerhaft und kann nicht rückgängig gemacht werden. Alle deine Daten werden nach einer Wartezeit von 24 Stunden vollständig gelöscht.</p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="deletion-reason" className="text-sm font-medium">
              Grund für die Löschung (optional)
            </label>
            <Textarea
              id="deletion-reason"
              placeholder="Bitte teile uns mit, warum du dein Konto löschen möchtest..."
              className="min-h-[100px] border-gray-300"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          
          <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Konto löschen
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Willst du dein Konto wirklich löschen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Diese Aktion kann nicht rückgängig gemacht werden. Dein Konto und alle damit verbundenen Daten werden nach 24 Stunden dauerhaft gelöscht.
                  
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                    <p className="text-sm font-medium">Wichtig:</p>
                    <p className="text-sm">Du hast 24 Stunden Zeit, diese Entscheidung rückgängig zu machen, indem du dich wieder anmeldest und den Löschvorgang abbrichst.</p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button 
                    variant="destructive" 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Wird gelöscht...
                      </>
                    ) : (
                      "Ja, Konto löschen"
                    )}
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountDeletionRequest;
