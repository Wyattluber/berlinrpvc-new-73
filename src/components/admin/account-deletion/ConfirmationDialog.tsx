
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RequestDetails } from './RequestDetails';
import { AccountDeletionRequest } from './types';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: AccountDeletionRequest | null;
  isApproving: boolean;
  isProcessing: boolean;
  onConfirm: (approved: boolean) => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  request,
  isApproving,
  isProcessing,
  onConfirm,
}) => {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {isApproving ? (
              <>
                <Shield className="h-5 w-5 mr-2 text-red-500" />
                Kontolöschung bestätigen
              </>
            ) : (
              'Kontolöschungsantrag ablehnen'
            )}
          </DialogTitle>
          <DialogDescription>
            {isApproving ? (
              'ACHTUNG: Dies ist eine irreversible Aktion, die Benutzerdaten werden unwiderruflich anonymisiert.'
            ) : (
              'Möchtest du diesen Kontolöschungsantrag ablehnen?'
            )}
          </DialogDescription>
        </DialogHeader>
        
        <RequestDetails request={request} isApproving={isApproving} />
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Abbrechen
          </Button>
          <Button 
            variant={isApproving ? "destructive" : "default"}
            onClick={() => onConfirm(isApproving)}
            disabled={isProcessing}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isApproving ? 'Konto löschen' : 'Antrag ablehnen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
