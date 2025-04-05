
import React from 'react';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, 
  DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Check, X, Eye } from 'lucide-react';

interface Application {
  id: string;
  user_id: string;
  discord_id: string;
  discord_username?: string;
  roblox_id: string;
  roblox_username: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  notes: string | null;
  username?: string | null;
  [key: string]: any;
}

interface ApplicationViewDialogProps {
  showViewDialog: boolean;
  setShowViewDialog: (show: boolean) => void;
  selectedApplication: Application | null;
  handleStatusAction: (application: Application, action: 'approve' | 'reject') => void;
  getStatusBadge: (status: string) => JSX.Element;
  formatDate: (dateString: string) => string;
}

const ApplicationViewDialog: React.FC<ApplicationViewDialogProps> = ({
  showViewDialog,
  setShowViewDialog,
  selectedApplication,
  handleStatusAction,
  getStatusBadge,
  formatDate
}) => {
  if (!selectedApplication) return null;

  return (
    <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bewerbungsdetails</DialogTitle>
          <DialogDescription>
            Bewerbung von {selectedApplication?.username || "Unbekannter Benutzer"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">Benutzer</Label>
                    <p className="text-sm">{selectedApplication.username || "Unbekannter Benutzer"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Discord ID</Label>
                    <p className="text-sm">{selectedApplication.discord_id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Roblox Benutzername</Label>
                    <p className="text-sm">{selectedApplication.roblox_username}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Roblox ID</Label>
                    <p className="text-sm">{selectedApplication.roblox_id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Alter</Label>
                    <p className="text-sm">{selectedApplication.age} Jahre</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Eingereicht am</Label>
                    <p className="text-sm">{formatDate(selectedApplication.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <p className="mt-1">{getStatusBadge(selectedApplication.status)}</p>
                  </div>
                  
                  {selectedApplication.updated_at !== selectedApplication.created_at && (
                    <div>
                      <Label className="text-sm font-medium">Aktualisiert am</Label>
                      <p className="text-sm">{formatDate(selectedApplication.updated_at)}</p>
                    </div>
                  )}
                  
                  {selectedApplication.notes && (
                    <div>
                      <Label className="text-sm font-medium">Notizen</Label>
                      <p className="text-sm whitespace-pre-wrap">{selectedApplication.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-2">
            <Card>
              <CardContent className="pt-4">
                <Label className="text-sm font-medium">Aktivitätslevel (1-10)</Label>
                <p className="text-sm">{selectedApplication.activity_level}/10</p>
              </CardContent>
            </Card>
            
            {Object.entries(selectedApplication).map(([key, value]) => {
              // Only show text questions and answers
              if (
                typeof value === 'string' && 
                !['id', 'user_id', 'discord_id', 'roblox_id', 'username', 'roblox_username', 
                 'created_at', 'updated_at', 'status', 'notes'].includes(key) &&
                key.includes('understanding') || key.includes('handling')
              ) {
                const label = key
                  .replace(/_/g, ' ')
                  .replace(/understanding/g, 'Verständnis')
                  .replace(/handling/g, 'Umgang')
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
                  
                return (
                  <Card key={key}>
                    <CardContent className="pt-4">
                      <Label className="text-sm font-medium">{label}</Label>
                      <p className="text-sm whitespace-pre-wrap">{value}</p>
                    </CardContent>
                  </Card>
                );
              }
              return null;
            })}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowViewDialog(false)}>
            Schließen
          </Button>
          
          {selectedApplication?.status === 'pending' && (
            <>
              <Button 
                variant="default" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setShowViewDialog(false);
                  handleStatusAction(selectedApplication, 'approve');
                }}
              >
                <Check className="h-4 w-4 mr-1" /> Annehmen
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  setShowViewDialog(false);
                  handleStatusAction(selectedApplication, 'reject');
                }}
              >
                <X className="h-4 w-4 mr-1" /> Ablehnen
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationViewDialog;
