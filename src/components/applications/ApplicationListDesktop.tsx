
import React from 'react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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

interface ApplicationListDesktopProps {
  filteredApplications: Application[];
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  loadApplications: () => Promise<void>;
  handleViewApplication: (application: Application) => void;
  handleStatusAction: (application: Application, action: 'approve' | 'reject') => void;
  getStatusBadge: (status: string) => JSX.Element;
  formatDate: (dateString: string) => string;
}

const ApplicationListDesktop: React.FC<ApplicationListDesktopProps> = ({
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
    <div className="overflow-hidden w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 max-w-xs">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9">
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
        >
          <RefreshCw className="h-4 w-4 mr-1" /> Aktualisieren
        </Button>
      </div>

      <div className="overflow-x-auto w-full">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Benutzer</TableHead>
              <TableHead className="w-[120px]">Discord</TableHead>
              <TableHead className="w-[120px]">Roblox</TableHead>
              <TableHead className="w-[150px]">Datum</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[200px] text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Keine Bewerbungen gefunden.
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">
                    {application.username || "Unbekannter Benutzer"}
                  </TableCell>
                  <TableCell>{application.discord_id}</TableCell>
                  <TableCell>{application.roblox_username}</TableCell>
                  <TableCell>{formatDate(application.created_at)}</TableCell>
                  <TableCell>{getStatusBadge(application.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewApplication(application)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> Details
                      </Button>
                      
                      {application.status === 'pending' && (
                        <>
                          <Button 
                            variant="default" 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusAction(application, 'approve')}
                          >
                            <Check className="h-4 w-4 mr-1" /> Annehmen
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleStatusAction(application, 'reject')}
                          >
                            <X className="h-4 w-4 mr-1" /> Ablehnen
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ApplicationListDesktop;
