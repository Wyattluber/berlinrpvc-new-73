
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Loader2, Check, X, RefreshCw, Eye, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import ApplicationListDesktop from '@/components/applications/ApplicationListDesktop';
import ApplicationListMobile from '@/components/applications/ApplicationListMobile';

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    loadApplications();
  }, []);
  
  const loadApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          profiles:user_id (
            username
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setApplications(data || []);
    } catch (err) {
      console.error('Error loading applications:', err);
      toast({
        title: 'Fehler',
        description: 'Beim Laden der Bewerbungen ist ein Fehler aufgetreten.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setIsViewDialogOpen(true);
  };
  
  const handleStatusAction = (application, action: 'approve' | 'reject') => {
    setSelectedApplication(application);
    setActionType(action);
    setFeedback('');
    setIsActionDialogOpen(true);
  };
  
  const executeStatusAction = async () => {
    if (!selectedApplication || !actionType) return;
    
    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status: actionType === 'approve' ? 'approved' : 'rejected',
          feedback: feedback || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedApplication.id);
        
      if (error) throw error;
      
      // If approving a moderator, add the user to admin_users table with 'moderator' role
      if (actionType === 'approve') {
        const { error: adminError } = await supabase
          .from('admin_users')
          .upsert({
            user_id: selectedApplication.user_id,
            role: 'moderator',
          }, { onConflict: 'user_id' });
          
        if (adminError) {
          console.error('Error adding user as moderator:', adminError);
          toast({
            title: 'Hinweis',
            description: 'Bewerbung wurde angenommen, aber der Benutzer konnte nicht als Moderator hinzugefügt werden.',
            variant: 'destructive',
          });
        }
      }
      
      toast({
        title: 'Erfolgreich',
        description: `Die Bewerbung wurde erfolgreich ${actionType === 'approve' ? 'angenommen' : 'abgelehnt'}.`,
      });
      
      loadApplications();
      setIsActionDialogOpen(false);
    } catch (err) {
      console.error(`Error ${actionType}ing application:`, err);
      toast({
        title: 'Fehler',
        description: `Beim ${actionType === 'approve' ? 'Annehmen' : 'Ablehnen'} der Bewerbung ist ein Fehler aufgetreten.`,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Ausstehend</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">Angenommen</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">Abgelehnt</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };
  
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: de });
    } catch (error) {
      return 'Ungültiges Datum';
    }
  };
  
  const filteredApplications = applications.filter((app) => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Bewerbungen werden geladen...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bewerbungsverwaltung</CardTitle>
          <CardDescription>
            Verwalte und prüfe eingegangene Bewerbungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop version (hidden on mobile) */}
          <div className="hidden md:block">
            <ApplicationListDesktop
              filteredApplications={filteredApplications}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              loadApplications={loadApplications}
              handleViewApplication={handleViewApplication}
              handleStatusAction={handleStatusAction}
              getStatusBadge={getStatusBadge}
              formatDate={formatDate}
            />
          </div>
          
          {/* Mobile version (hidden on desktop) */}
          <div className="md:hidden">
            <ApplicationListMobile
              filteredApplications={filteredApplications}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              loadApplications={loadApplications}
              handleViewApplication={handleViewApplication}
              handleStatusAction={handleStatusAction}
              getStatusBadge={getStatusBadge}
              formatDate={formatDate}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* View Application Dialog */}
      {selectedApplication && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Bewerbung von {selectedApplication.profiles?.username || selectedApplication.roblox_username || "Unbekannt"}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <span>Status: {getStatusBadge(selectedApplication.status)}</span>
                <span>•</span>
                <span>Eingereicht am: {formatDate(selectedApplication.created_at)}</span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              <h3 className="text-lg font-medium">Persönliche Informationen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Alter</p>
                  <p>{selectedApplication.age}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Discord ID</p>
                  <p>{selectedApplication.discord_id || "Nicht angegeben"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Roblox Username</p>
                  <p>{selectedApplication.roblox_username || "Nicht angegeben"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Roblox ID</p>
                  <p>{selectedApplication.roblox_id || "Nicht angegeben"}</p>
                </div>
              </div>
              
              <h3 className="text-lg font-medium pt-2">Regelverständnis</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Was versteht man unter FRP?</p>
                  <p className="p-3 bg-gray-50 rounded-md border">{selectedApplication.frp_understanding}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Was versteht man unter VDM?</p>
                  <p className="p-3 bg-gray-50 rounded-md border">{selectedApplication.vdm_understanding}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Was versteht man unter RDM?</p>
                  <p className="p-3 bg-gray-50 rounded-md border">{selectedApplication.rdm_understanding}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Was versteht man unter Taschen RP?</p>
                  <p className="p-3 bg-gray-50 rounded-md border">{selectedApplication.taschen_rp_understanding}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Was versteht man unter einer Bodycamaufnahme?</p>
                  <p className="p-3 bg-gray-50 rounded-md border">{selectedApplication.bodycam_understanding}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Ein Freund verstößt gegen Regeln?</p>
                  <p className="p-3 bg-gray-50 rounded-md border">{selectedApplication.friend_rule_violation}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Server Mindestalter</p>
                  <p className="p-3 bg-gray-50 rounded-md border">{selectedApplication.server_age_understanding}</p>
                </div>
              </div>
              
              <h3 className="text-lg font-medium pt-2">Erfahrung & Motivation</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Warum Moderator werden?</p>
                  <p className="p-3 bg-gray-50 rounded-md border">{selectedApplication.situation_handling}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Erfahrung</p>
                  <p className="p-3 bg-gray-50 rounded-md border">{selectedApplication.admin_experience || "Keine Angabe"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Andere Server</p>
                  <p className="p-3 bg-gray-50 rounded-md border">{selectedApplication.other_servers || "Keine Angabe"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Anmerkungen</p>
                  <p className="p-3 bg-gray-50 rounded-md border">{selectedApplication.notes || "Keine Anmerkungen"}</p>
                </div>
              </div>
              
              {selectedApplication.feedback && (
                <div className="pt-2">
                  <h3 className="text-lg font-medium">Feedback</h3>
                  <div className="p-3 bg-gray-50 rounded-md border mt-2">
                    {selectedApplication.feedback}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Schließen
              </Button>
              
              {selectedApplication.status === 'pending' && (
                <>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleStatusAction(selectedApplication, 'reject');
                    }}
                  >
                    <X className="h-4 w-4 mr-1" /> Ablehnen
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleStatusAction(selectedApplication, 'approve');
                    }}
                  >
                    <Check className="h-4 w-4 mr-1" /> Annehmen
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Action Dialog (Approve/Reject) */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' 
                ? 'Bewerbung annehmen' 
                : 'Bewerbung ablehnen'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'Der Bewerber wird zum Moderator ernannt.'
                : 'Die Bewerbung wird abgelehnt und archiviert.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Optionales Feedback für den Bewerber..."
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              onClick={executeStatusAction}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : actionType === 'approve' ? (
                <Check className="h-4 w-4 mr-1" />
              ) : (
                <X className="h-4 w-4 mr-1" />
              )}
              {actionType === 'approve' ? 'Bestätigen' : 'Ablehnen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationManagement;
