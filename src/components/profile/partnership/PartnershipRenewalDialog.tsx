
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface PartnershipRenewalDialogProps {
  partnerApplication: any;
  isExpired: boolean;
  onRenewalSubmitted: (updatedApplication: any) => void;
}

const PartnershipRenewalDialog = ({ 
  partnerApplication, 
  isExpired,
  onRenewalSubmitted
}: PartnershipRenewalDialogProps) => {
  const [renewalOpen, setRenewalOpen] = useState(false);
  const [renewalReason, setRenewalReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRenewalSubmit = async () => {
    if (!partnerApplication) return;
    
    if (renewalReason.trim().length < 10) {
      toast({
        title: "Fehler",
        description: "Bitte gib eine ausführlichere Begründung für deine Verlängerungsanfrage an.",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create a renewal application based on the original
      const { data, error } = await supabase
        .from('partner_applications')
        .update({
          is_renewal: true,
          reason: renewalReason,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', partnerApplication.id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Anfrage gesendet",
        description: "Deine Partnerschaftsverlängerung wurde beantragt und wird geprüft.",
      });
      
      if (data) {
        onRenewalSubmitted(data);
      }
      
      setRenewalOpen(false);
      setRenewalReason('');
      
    } catch (error) {
      console.error('Error submitting renewal:', error);
      toast({
        title: "Fehler",
        description: "Die Verlängerungsanfrage konnte nicht gesendet werden.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={renewalOpen} onOpenChange={setRenewalOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={isExpired ? "destructive" : "default"}
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {isExpired ? "Partnerschaft erneuern" : "Verlängerung beantragen"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partnerschaft verlängern</DialogTitle>
          <DialogDescription>
            Erkläre bitte, warum du deine Partnerschaft verlängern möchtest und was du dir von der weiteren Zusammenarbeit erhoffst.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Grund für die Verlängerung
            </label>
            <Textarea
              id="reason"
              placeholder="Gib hier deine Begründung ein..."
              className="min-h-[120px]"
              value={renewalReason}
              onChange={(e) => setRenewalReason(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setRenewalOpen(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleRenewalSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gesendet
              </>
            ) : (
              "Verlängerung beantragen"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PartnershipRenewalDialog;
