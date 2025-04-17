
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Calendar, ChevronsRight, Loader2 } from 'lucide-react';
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
import { addMonths, format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { DatePicker } from '@/components/ui/date-picker';

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
  const [expirationDate, setExpirationDate] = useState<Date>(addMonths(new Date(), 1));

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
      const { data, error } = await supabase
        .from('partner_applications')
        .update({
          status: 'pending',
          reason: reason,
          is_renewal: true,
          is_active: false,
          updated_at: new Date().toISOString(),
          expiration_date: expirationDate.toISOString() // Add the expiration date
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Gewünschtes Ablaufdatum</label>
              <DatePicker 
                date={expirationDate} 
                setDate={setExpirationDate} 
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Das Datum, zu dem die Partnerschaft enden soll.
              </p>
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
            <p className="text-sm mt-2">
              <span className="font-medium">Gewünschtes Ablaufdatum:</span> {format(expirationDate, 'PPP', { locale: de })}
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
