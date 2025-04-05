
import React from 'react';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, 
  DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, LoaderIcon } from 'lucide-react';

interface ApplicationStatusDialogProps {
  showStatusDialog: boolean;
  setShowStatusDialog: (show: boolean) => void;
  statusAction: 'approve' | 'reject' | null;
  statusNotes: string;
  setStatusNotes: (notes: string) => void;
  handleStatusSubmit: () => Promise<void>;
  updatingStatus: boolean;
}

const ApplicationStatusDialog: React.FC<ApplicationStatusDialogProps> = ({
  showStatusDialog,
  setShowStatusDialog,
  statusAction,
  statusNotes,
  setStatusNotes,
  handleStatusSubmit,
  updatingStatus
}) => {
  return (
    <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {statusAction === 'approve' ? 'Bewerbung annehmen' : 'Bewerbung ablehnen'}
          </DialogTitle>
          <DialogDescription>
            {statusAction === 'approve' 
              ? 'Bist du sicher, dass du diese Bewerbung annehmen möchtest?' 
              : 'Bitte gib einen Grund für die Ablehnung ein.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Label htmlFor="notes">Notizen</Label>
          <Textarea 
            id="notes" 
            value={statusNotes} 
            onChange={(e) => setStatusNotes(e.target.value)} 
            placeholder={statusAction === 'approve' 
              ? 'Optionale Notizen zur Bewerbung...' 
              : 'Grund für die Ablehnung...'}
            rows={5}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
            Abbrechen
          </Button>
          <Button 
            variant={statusAction === 'approve' ? 'default' : 'destructive'}
            className={statusAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
            onClick={handleStatusSubmit}
            disabled={updatingStatus || (statusAction === 'reject' && !statusNotes.trim())}
          >
            {updatingStatus ? (
              <>
                <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                Verarbeite...
              </>
            ) : (
              <>
                {statusAction === 'approve' ? (
                  <>
                    <Check className="h-4 w-4 mr-1" /> Annehmen
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-1" /> Ablehnen
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationStatusDialog;
