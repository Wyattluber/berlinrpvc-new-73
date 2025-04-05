
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { LoaderIcon, CheckCircle, XCircle, Clock, Eye, Check, X, Filter, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fetchApplications, updateApplicationStatus } from '@/lib/adminService';
import { useIsMobile } from '@/hooks/use-mobile';
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

const ApplicationsList = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusAction, setStatusAction] = useState<'approve' | 'reject' | null>(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const isMobile = useIsMobile();

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === statusFilter));
    }
  }, [statusFilter, applications]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await fetchApplications();
      console.log('Loaded applications:', data);
      setApplications(data);
      setFilteredApplications(data);
    } catch (error) {
      console.error('Error loading applications', error);
      toast({
        title: 'Fehler',
        description: 'Die Bewerbungen konnten nicht geladen werden.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowViewDialog(true);
  };

  const handleStatusAction = (application: Application, action: 'approve' | 'reject') => {
    setSelectedApplication(application);
    setStatusAction(action);
    setStatusNotes('');
    setShowStatusDialog(true);
  };

  const handleStatusSubmit = async () => {
    if (!selectedApplication || !statusAction) return;

    setUpdatingStatus(true);
    try {
      const newStatus = statusAction === 'approve' ? 'approved' : 'rejected';
      await updateApplicationStatus(selectedApplication.id, newStatus, statusNotes);

      toast({
        title: 'Erfolg',
        description: `Die Bewerbung wurde erfolgreich ${statusAction === 'approve' ? 'angenommen' : 'abgelehnt'}.`
      });

      // Update local state
      setApplications(applications.map(app => 
        app.id === selectedApplication.id ? { ...app, status: newStatus, notes: statusNotes } : app
      ));

      setShowStatusDialog(false);
    } catch (error) {
      console.error('Error updating application status', error);
      toast({
        title: 'Fehler',
        description: 'Der Status konnte nicht aktualisiert werden.',
        variant: 'destructive'
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Angenommen</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Abgelehnt</span>;
      case 'pending':
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Ausstehend</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + 
           ' ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Render mobile card view for applications
  const renderMobileView = () => (
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

  // Render desktop table view for applications
  const renderDesktopView = () => (
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
      
      {/* View Application Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bewerbungsdetails</DialogTitle>
            <DialogDescription>
              Bewerbung von {selectedApplication?.username || "Unbekannter Benutzer"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
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
          )}
          
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
      
      {/* Status Update Dialog */}
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
    </div>
  );

  return (
    <>
      {isMobile ? renderMobileView() : renderDesktopView()}
    </>
  );
};

export default ApplicationsList;
