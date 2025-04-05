
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Check, X, AlertTriangle, Trash2 } from 'lucide-react';

interface ApplicationViewDialogProps {
  showViewDialog: boolean;
  setShowViewDialog: (show: boolean) => void;
  selectedApplication: any;
  handleStatusAction: (application: any, action: 'approve' | 'reject' | 'waitlist' | 'delete') => void;
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bewerbungsdetails</DialogTitle>
          <DialogDescription>
            Bewerbung von {selectedApplication.username || "Unbekannter Benutzer"} - {formatDate(selectedApplication.created_at)}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="basic">Grundinformationen</TabsTrigger>
            <TabsTrigger value="details">Bewerbungsdetails</TabsTrigger>
          </TabsList>
          <TabsContent value="basic" className="space-y-4 mt-4">
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Status</h4>
                  <div>{getStatusBadge(selectedApplication.status)}</div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Datum</h4>
                  <p className="text-sm">{formatDate(selectedApplication.created_at)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Discord</h4>
                  <p className="text-sm">{selectedApplication.discord_id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Roblox</h4>
                  <p className="text-sm">{selectedApplication.roblox_username}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Alter</h4>
                  <p className="text-sm">{selectedApplication.age || "Nicht angegeben"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Aktivität</h4>
                  <p className="text-sm">{selectedApplication.activity_level || "Nicht angegeben"}/10</p>
                </div>
              </div>
            </Card>
            {selectedApplication.notes && (
              <Card className="p-4">
                <h4 className="text-sm font-semibold mb-2">Admin-Notizen</h4>
                <p className="text-sm whitespace-pre-wrap">{selectedApplication.notes}</p>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="details" className="mt-4">
            <Card className="p-4 space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-1">Erfahrung als Administrator</h4>
                <p className="text-sm whitespace-pre-wrap">{selectedApplication.admin_experience || "Keine Angabe"}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Andere Server</h4>
                <p className="text-sm whitespace-pre-wrap">{selectedApplication.other_servers || "Keine Angabe"}</p>
              </div>
              <div className="grid grid-cols-1 gap-4 mt-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Regelverständnis</h4>
                  <ul className="text-sm space-y-2">
                    <li>
                      <span className="font-medium">Freundschaftsregel:</span> {selectedApplication.friend_rule_violation}
                    </li>
                    <li>
                      <span className="font-medium">Bodycam:</span> {selectedApplication.bodycam_understanding}
                    </li>
                    <li>
                      <span className="font-medium">Situationshandhabung:</span> {selectedApplication.situation_handling}
                    </li>
                    <li>
                      <span className="font-medium">Server-Altersbegrenzung:</span> {selectedApplication.server_age_understanding}
                    </li>
                    <li>
                      <span className="font-medium">Taschen-RP:</span> {selectedApplication.taschen_rp_understanding}
                    </li>
                    <li>
                      <span className="font-medium">VDM:</span> {selectedApplication.vdm_understanding}
                    </li>
                    <li>
                      <span className="font-medium">FRP:</span> {selectedApplication.frp_understanding}
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
        <DialogFooter className="flex justify-between gap-2 sm:justify-between">
          <Button variant="outline" onClick={() => setShowViewDialog(false)}>Schließen</Button>
          {selectedApplication.status === 'pending' && (
            <div className="flex gap-2">
              <Button 
                variant="default" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleStatusAction(selectedApplication, 'approve')}
              >
                <Check className="h-4 w-4 mr-1" /> Annehmen
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleStatusAction(selectedApplication, 'reject')}
              >
                <X className="h-4 w-4 mr-1" /> Ablehnen
              </Button>
              <Button 
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => handleStatusAction(selectedApplication, 'waitlist')}
              >
                <AlertTriangle className="h-4 w-4 mr-1" /> Warteliste
              </Button>
              <Button 
                variant="secondary"
                onClick={() => handleStatusAction(selectedApplication, 'delete')}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Löschen
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationViewDialog;
