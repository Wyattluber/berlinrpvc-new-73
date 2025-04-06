
import React from 'react';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, 
  DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Check, X, Eye } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
  age?: number;
  activity_level?: number;
  frp_understanding?: string;
  vdm_understanding?: string;
  taschen_rp_understanding?: string;
  server_age_understanding?: string;
  situation_handling?: string;
  bodycam_understanding?: string;
  friend_rule_violation?: string;
  other_servers?: string;
  admin_experience?: string;
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

  // List of standard fields to display in the detailed view
  const standardFields = [
    { key: 'frp_understanding', label: 'FRP Verständnis' },
    { key: 'vdm_understanding', label: 'VDM Verständnis' },
    { key: 'taschen_rp_understanding', label: 'Taschen RP Verständnis' },
    { key: 'server_age_understanding', label: 'Server-Alter Verständnis' },
    { key: 'situation_handling', label: 'Umgang mit Situationen' },
    { key: 'bodycam_understanding', label: 'Bodycam Verständnis' },
    { key: 'friend_rule_violation', label: 'Freund Regelverstoß' },
    { key: 'other_servers', label: 'Andere Server' },
    { key: 'admin_experience', label: 'Admin Erfahrung' }
  ];

  // Identify the keys we don't want to show as answers
  const excludedKeys = [
    'id', 'user_id', 'discord_id', 'roblox_id', 'username', 
    'roblox_username', 'created_at', 'updated_at', 'status', 'notes',
    'age', 'activity_level', 'discord_username'
  ];

  // Get all application fields that should be displayed as answers
  const getApplicationFields = () => {
    const allFields = [];
    
    // First add standard fields if they exist
    standardFields.forEach(({ key, label }) => {
      if (selectedApplication[key]) {
        allFields.push({ key, label });
      }
    });
    
    // Then add any other fields that aren't in the excluded list
    for (const [key, value] of Object.entries(selectedApplication)) {
      if (
        !excludedKeys.includes(key) && 
        !standardFields.some(field => field.key === key) &&
        typeof value === 'string' && 
        value.trim() !== ''
      ) {
        const label = key
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
          
        allFields.push({ key, label });
      }
    }
    
    return allFields;
  };

  const applicationFields = getApplicationFields();

  return (
    <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bewerbungsdetails</DialogTitle>
          <DialogDescription>
            Bewerbung von {selectedApplication?.username || selectedApplication?.roblox_username || "Unbekannter Benutzer"}
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
          
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4">
                <Label className="text-sm font-medium">Aktivitätslevel (1-10)</Label>
                <p className="text-sm">{selectedApplication.activity_level}/10</p>
              </CardContent>
            </Card>
            
            {/* Display all answers from the applicant */}
            {applicationFields.map(({ key, label }) => (
              <Card key={key}>
                <CardContent className="pt-4">
                  <Label className="text-sm font-medium">{label}</Label>
                  <p className="text-sm whitespace-pre-wrap mt-2">{selectedApplication[key]}</p>
                </CardContent>
              </Card>
            ))}
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
