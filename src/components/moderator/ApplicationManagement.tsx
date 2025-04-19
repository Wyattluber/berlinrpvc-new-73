
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewApplication, setViewApplication] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // First, fetch applications
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select('*')
        .eq('status', activeTab)
        .order('created_at', { ascending: false });

      if (appError) throw appError;
      
      // Now get user profile information for each application
      const applications = appData || [];
      
      if (applications.length > 0) {
        // Get unique user IDs
        const userIds = [...new Set(applications.map(app => app.user_id))];
        
        // Fetch profiles for these users
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);
          
        if (profilesError) throw profilesError;
        
        // Create a map of user_id to profile data
        const profilesMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
        
        // Merge profile data with applications
        const enrichedApplications = applications.map(app => ({
          ...app,
          username: profilesMap[app.user_id]?.username || 'Unbekannt',
          avatar_url: profilesMap[app.user_id]?.avatar_url || null
        }));
        
        setApplications(enrichedApplications);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Fehler',
        description: 'Bewerbungen konnten nicht geladen werden.',
        variant: 'destructive',
      });
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application) => {
    setViewApplication(application);
    setDialogOpen(true);
  };

  const handleApplicationAction = async (id, action) => {
    setProcessingAction(true);
    try {
      const newStatus = action === 'accept' ? 'accepted' : 'rejected';
      
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // If accepting, we need to add the user to the admin_users table as moderator
      if (action === 'accept') {
        const { data: applicationData } = await supabase
          .from('applications')
          .select('user_id')
          .eq('id', id)
          .single();
          
        if (applicationData) {
          const { error: adminError } = await supabase
            .from('admin_users')
            .insert({
              user_id: applicationData.user_id,
              role: 'moderator'
            });
            
          if (adminError) {
            console.error('Error adding user to admin_users:', adminError);
            toast({
              title: 'Fehler',
              description: 'Der Benutzer konnte nicht zur Moderatorenliste hinzugefügt werden.',
              variant: 'destructive',
            });
          }
        }
      }

      toast({
        title: action === 'accept' ? 'Bewerbung angenommen' : 'Bewerbung abgelehnt',
        description: `Die Bewerbung wurde erfolgreich ${action === 'accept' ? 'angenommen' : 'abgelehnt'}.`,
      });

      setDialogOpen(false);
      fetchApplications();
    } catch (error) {
      console.error('Error processing application:', error);
      toast({
        title: 'Fehler',
        description: 'Die Bewerbung konnte nicht bearbeitet werden.',
        variant: 'destructive',
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Ausstehend</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500">Angenommen</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Abgelehnt</Badge>;
      default:
        return <Badge>Unbekannt</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bewerbungen verwalten</CardTitle>
        <CardDescription>
          Überprüfe und verwalte eingehende Teammitglied-Bewerbungen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Ausstehend</TabsTrigger>
            <TabsTrigger value="accepted">Angenommen</TabsTrigger>
            <TabsTrigger value="rejected">Abgelehnt</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : applications.length === 0 ? (
              <Alert>
                <AlertTitle>Keine Bewerbungen</AlertTitle>
                <AlertDescription>
                  Es gibt derzeit keine {activeTab === 'pending' ? 'ausstehenden' : activeTab === 'accepted' ? 'angenommenen' : 'abgelehnten'} Bewerbungen.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Benutzer</TableHead>
                      <TableHead>Roblox Name</TableHead>
                      <TableHead>Discord ID</TableHead>
                      <TableHead>Alter</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>{app.username || 'Unbekannt'}</TableCell>
                        <TableCell>{app.roblox_username || 'N/A'}</TableCell>
                        <TableCell>{app.discord_id || 'N/A'}</TableCell>
                        <TableCell>{app.age || 'N/A'}</TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewApplication(app)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {viewApplication && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bewerbungsdetails</DialogTitle>
                <DialogDescription>
                  Bewerbung von {viewApplication.roblox_username || viewApplication.username || 'Unbekannt'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Persönliche Informationen</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Roblox Username:</div>
                    <div>{viewApplication.roblox_username || 'N/A'}</div>
                    <div className="font-medium">Roblox ID:</div>
                    <div>{viewApplication.roblox_id || 'N/A'}</div>
                    <div className="font-medium">Discord ID:</div>
                    <div>{viewApplication.discord_id || 'N/A'}</div>
                    <div className="font-medium">Alter:</div>
                    <div>{viewApplication.age || 'N/A'}</div>
                    <div className="font-medium">Aktivitätslevel:</div>
                    <div>{viewApplication.activity_level || 'N/A'}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Regelverständnis</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Mindestalter:</div>
                    <div>{viewApplication.server_age_understanding || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 py-2">
                <div>
                  <h4 className="font-medium text-sm mb-1">FRP Verständnis:</h4>
                  <div className="text-sm p-3 bg-gray-50 rounded-md">{viewApplication.frp_understanding || 'Keine Antwort'}</div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">VDM Verständnis:</h4>
                  <div className="text-sm p-3 bg-gray-50 rounded-md">{viewApplication.vdm_understanding || 'Keine Antwort'}</div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">RDM Verständnis:</h4>
                  <div className="text-sm p-3 bg-gray-50 rounded-md">{viewApplication.rdm_understanding || 'Keine Antwort'}</div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">Taschen RP Verständnis:</h4>
                  <div className="text-sm p-3 bg-gray-50 rounded-md">{viewApplication.taschen_rp_understanding || 'Keine Antwort'}</div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">Bodycam Verständnis:</h4>
                  <div className="text-sm p-3 bg-gray-50 rounded-md">{viewApplication.bodycam_understanding || 'Keine Antwort'}</div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">Situationshandhabung:</h4>
                  <div className="text-sm p-3 bg-gray-50 rounded-md">{viewApplication.situation_handling || 'Keine Antwort'}</div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">Umgang mit Regelverstoß eines Freundes:</h4>
                  <div className="text-sm p-3 bg-gray-50 rounded-md">{viewApplication.friend_rule_violation || 'Keine Antwort'}</div>
                </div>

                {viewApplication.admin_experience && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Administrative Erfahrung:</h4>
                    <div className="text-sm p-3 bg-gray-50 rounded-md">{viewApplication.admin_experience}</div>
                  </div>
                )}

                {viewApplication.other_servers && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Andere Server:</h4>
                    <div className="text-sm p-3 bg-gray-50 rounded-md">{viewApplication.other_servers}</div>
                  </div>
                )}

                {viewApplication.notes && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Anmerkungen:</h4>
                    <div className="text-sm p-3 bg-gray-50 rounded-md">{viewApplication.notes}</div>
                  </div>
                )}
              </div>

              {viewApplication.status === 'pending' && (
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => handleApplicationAction(viewApplication.id, 'reject')}
                    disabled={processingAction}
                  >
                    {processingAction ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                    Ablehnen
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => handleApplicationAction(viewApplication.id, 'accept')}
                    disabled={processingAction}
                  >
                    {processingAction ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                    Annehmen
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default ApplicationManagement;
