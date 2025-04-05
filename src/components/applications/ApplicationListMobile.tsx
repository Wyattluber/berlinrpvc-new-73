
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RefreshCw, Eye, Check, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface ApplicationListMobileProps {
  filteredApplications: Application[];
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  loadApplications: () => Promise<void>;
  handleViewApplication: (application: Application) => void;
  handleStatusAction: (application: Application, action: 'approve' | 'reject') => void;
  getStatusBadge: (status: string) => JSX.Element;
  formatDate: (dateString: string) => string;
}

const ApplicationListMobile: React.FC<ApplicationListMobileProps> = ({
  filteredApplications,
  statusFilter,
  setStatusFilter,
  loadApplications,
  handleViewApplication,
  handleStatusAction,
  getStatusBadge,
  formatDate
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 mr-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Nach Status filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle anzeigen</SelectItem>
              <SelectItem value="pending">Ausstehend</SelectItem>
              <SelectItem value="approved">Angenommen</SelectItem>
              <SelectItem value="rejected">Abgelehnt</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={loadApplications}
          className="flex-shrink-0"
        >
          <RefreshCw className="h-4 w-4 mr-1" /> Aktualisieren
        </Button>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="text-center p-8 border rounded-md">
          <p>Keine Bewerbungen gefunden.</p>
        </div>
      ) : (
        filteredApplications.map((application) => (
          <Card key={application.id} className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{application.username || "Unbekannter Benutzer"}</CardTitle>
                  <CardDescription className="text-xs">
                    {formatDate(application.created_at)}
                  </CardDescription>
                </div>
                <div>{getStatusBadge(application.status)}</div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Discord:</span>
                  <span className="text-right">{application.discord_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Roblox:</span>
                  <span className="text-right">{application.roblox_username}</span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewApplication(application)}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-1" /> Details
                </Button>
                
                {application.status === 'pending' && (
                  <div className="flex gap-2 w-full">
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 w-1/2"
                      onClick={() => handleStatusAction(application, 'approve')}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="w-1/2"
                      onClick={() => handleStatusAction(application, 'reject')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default ApplicationListMobile;
