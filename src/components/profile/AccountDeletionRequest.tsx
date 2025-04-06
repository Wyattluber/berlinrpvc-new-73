
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, Loader2 } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const deletionSchema = z.object({
  reason: z.string().min(10, {
    message: "Bitte gib eine Begründung mit mindestens 10 Zeichen an.",
  }),
});

export const AccountDeletionRequest = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  
  const form = useForm<z.infer<typeof deletionSchema>>({
    resolver: zodResolver(deletionSchema),
    defaultValues: {
      reason: "",
    },
  });

  // Check if user already has a pending deletion request
  React.useEffect(() => {
    const checkPendingRequest = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        const { data, error } = await supabase
          .from('account_deletion_requests')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .maybeSingle();
        
        if (error) throw error;
        
        setHasPendingRequest(!!data);
      } catch (error) {
        console.error('Error checking pending deletion request:', error);
      }
    };
    
    checkPendingRequest();
  }, []);

  const handleSubmit = async (values: z.infer<typeof deletionSchema>) => {
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
            reason: values.reason,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast({
        title: 'Anfrage gesendet',
        description: 'Deine Anfrage zur Kontolöschung wurde erfolgreich gesendet und wird von unserem Team bearbeitet.',
      });
      
      setOpen(false);
      form.reset();
      setHasPendingRequest(true);
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
        
        {hasPendingRequest && (
          <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-md mt-2">
            <p className="text-yellow-800 text-sm font-medium">Du hast bereits eine Anfrage zur Kontolöschung gestellt. Diese wird derzeit bearbeitet.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive"
              disabled={hasPendingRequest}
            >
              {hasPendingRequest ? 'Anfrage ausstehend' : 'Kontolöschung beantragen'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kontolöschung beantragen</AlertDialogTitle>
              <AlertDialogDescription>
                Bitte teile uns den Grund für die Löschung deines Kontos mit. Dies hilft uns, unseren Service zu verbessern.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grund für die Kontolöschung</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Warum möchtest du dein Konto löschen?"
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        Deine Eingabe hilft uns, unseren Service zu verbessern.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <Button 
                    type="submit" 
                    variant="destructive"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Wird gesendet...
                      </>
                    ) : (
                      'Anfrage senden'
                    )}
                  </Button>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default AccountDeletionRequest;
