
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, ChevronsRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { addMonths } from 'date-fns';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface PartnershipRenewalDialogProps {
  partnerApplication: any;
  isExpired: boolean;
  onRenewalSubmitted: (updatedApplication: any) => void;
}

const PartnershipRenewalDialog = ({ partnerApplication, isExpired, onRenewalSubmitted }: PartnershipRenewalDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "Bitte gib einen Grund an",
        description: "Bitte erkläre warum du die Partnerschaft verlängern möchtest.",
        variant: "destructive",
      });
      return;
    }

    setConfirmOpen(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create a new application as a renewal
      const { data, error } = await supabase
        .from('partner_applications')
        .update({
          status: 'pending',
          reason: reason,
          is_renewal: true,
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', partnerApplication.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Anfrage gesendet",
        description: "Deine Verlängerungsanfrage wurde erfolgreich gesendet!",
      });

      setOpen(false);
      setConfirmOpen(false);
      onRenewalSubmitted(data);
    } catch (error) {
      console.error('Error submitting renewal:', error);
      toast({
        title: "Fehler",
        description: "Beim Senden deiner Anfrage ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestedNewDate = addMonths(new Date(), 1);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            {isExpired ? 'Partnerschaft erneuern' : 'Partnerschaft verlängern'}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isExpired ? 'Partnerschaft erneuern' : 'Partnerschaft verlängern'}
            </DialogTitle>
            <DialogDescription>
              Reiche eine Anfrage ein, um deine Partnerschaft zu {isExpired ? 'erneuern' : 'verlängern'}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Neues vorgeschlagenes Ablaufdatum</p>
                <p className="text-sm text-gray-500">
                  {format(suggestedNewDate, 'PPP', { locale: de })}
                </p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Grund für die Verlängerung</label>
              <Textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Warum möchtest du die Partnerschaft verlängern?"
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              Anfrage senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bestätigung</DialogTitle>
            <DialogDescription>
              Bist du sicher, dass du die Verlängerungsanfrage senden möchtest?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm">
              Durch das Absenden dieser Anfrage wird deine Partnerschaft als "In Bearbeitung" markiert, 
              bis das Team deine Anfrage geprüft hat.
            </p>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              type="button" 
              onClick={confirmSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                'Bestätigen'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PartnershipRenewalDialog;
