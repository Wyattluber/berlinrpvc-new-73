
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoaderIcon } from 'lucide-react';

interface ApplicationStatusDialogProps {
  showStatusDialog: boolean;
  setShowStatusDialog: (show: boolean) => void;
  statusAction: 'approve' | 'reject' | 'waitlist' | 'delete' | null;
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
  const getStatusTitle = () => {
    switch (statusAction) {
      case 'approve':
        return 'Bewerbung annehmen';
      case 'reject':
        return 'Bewerbung ablehnen';
      case 'waitlist':
        return 'Auf Warteliste setzen';
      case 'delete':
        return 'Bewerbung löschen';
      default:
        return 'Status aktualisieren';
    }
  };

  const getStatusDescription = () => {
    switch (statusAction) {
      case 'approve':
        return 'Die Bewerbung wird angenommen. Du kannst optional Anmerkungen hinzufügen, die der Bewerber sehen wird.';
      case 'reject':
        return 'Die Bewerbung wird abgelehnt. Du kannst optional Anmerkungen hinzufügen, die der Bewerber sehen wird.';
      case 'waitlist':
        return 'Die Bewerbung wird auf die Warteliste gesetzt. Du kannst optional Anmerkungen hinzufügen, die der Bewerber sehen wird.';
      case 'delete':
        return 'Die Bewerbung wird gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.';
      default:
        return 'Der Status der Bewerbung wird aktualisiert.';
    }
  };

  const getStatusButtonText = () => {
    switch (statusAction) {
      case 'approve':
        return 'Annehmen';
      case 'reject':
        return 'Ablehnen';
      case 'waitlist':
        return 'Auf Warteliste setzen';
      case 'delete':
        return 'Löschen';
      default:
        return 'Aktualisieren';
    }
  };

  const getStatusButtonClass = () => {
    switch (statusAction) {
      case 'approve':
        return 'bg-green-600 hover:bg-green-700';
      case 'reject':
        return 'bg-destructive hover:bg-destructive/90';
      case 'waitlist':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'delete':
        return 'bg-gray-600 hover:bg-gray-700';
      default:
        return '';
    }
  };

  return (
    <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getStatusTitle()}</DialogTitle>
          <DialogDescription>
            {getStatusDescription()}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Anmerkungen (optional)"
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setShowStatusDialog(false)}
            disabled={updatingStatus}
          >
            Abbrechen
          </Button>
          <Button 
            variant="default"
            onClick={handleStatusSubmit}
            disabled={updatingStatus}
            className={getStatusButtonClass()}
          >
            {updatingStatus ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" /> Verarbeite...
              </>
            ) : (
              getStatusButtonText()
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationStatusDialog;
