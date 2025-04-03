
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertCircle,
  User,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Application {
  id: string;
  user_id: string;
  discord_id: string;
  roblox_username: string;
  roblox_id: string;
  age: number;
  frp_understanding: string;
  vdm_understanding: string;
  taschen_rp_understanding: string;
  server_age_understanding: string;
  situation_handling: string;
  bodycam_understanding: string;
  friend_rule_violation: string;
  other_servers: string;
  admin_experience: string;
  activity_level: number;
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [viewApplicationDialog, setViewApplicationDialog] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      
      // Check Supabase authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      const { user } = session;
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!adminError && adminData) {
        setIsAdmin(true);
        await fetchApplications();
      } else {
        setIsAdmin(false);
        navigate('/profile');
        toast({
          title: "Zugriff verweigert",
          description: "Du hast keine Berechtigung für den Admin-Bereich.",
          variant: "destructive"
        });
      }
      
      setIsLoading(false);
    };
    
    checkAdminStatus();
  }, [navigate]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setApplications(data);
        setFilteredApplications(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Fehler",
        description: "Die Bewerbungen konnten nicht geladen werden.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (applications.length > 0) {
      let filtered = [...applications];
      
      // Apply status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(app => app.status === statusFilter);
      }
      
      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(app => 
          app.roblox_username.toLowerCase().includes(query) ||
          app.discord_id.toLowerCase().includes(query)
        );
      }
      
      setFilteredApplications(filtered);
    }
  }, [statusFilter, searchQuery, applications]);

  const viewApplication = (application: Application) => {
    setSelectedApplication(application);
    setViewApplicationDialog(true);
  };

  const handleAction = (application: Application, action: 'approve' | 'reject') => {
    setSelectedApplication(application);
    setActionType(action);
    setConfirmationDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedApplication || !actionType) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: actionType === 'approve' ? 'approved' : 'rejected' })
        .eq('id', selectedApplication.id);

      if (error) throw error;
      
      // Update local state
      const updatedApplications = applications.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, status: actionType === 'approve' ? 'approved' : 'rejected' } 
          : app
      );
      
      setApplications(updatedApplications);
      
      toast({
        title: actionType === 'approve' ? "Bewerbung genehmigt" : "Bewerbung abgelehnt",
        description: `Die Bewerbung von ${selectedApplication.roblox_username} wurde ${actionType === 'approve' ? 'genehmigt' : 'abgelehnt'}.`,
      });
      
      setConfirmationDialog(false);
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Fehler",
        description: "Die Bewerbung konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock size={14} />
            Ausstehend
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle size={14} />
            Genehmigt
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
            <XCircle size={14} />
            Abgelehnt
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <h2 className="text-xl font-semibold">Lade Admin-Bereich...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <Card className="shadow-lg border-t-4 border-blue-600">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl">Admin-Bereich</CardTitle>
                  <CardDescription>Verwalte Bewerbungen und Einstellungen</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fetchApplications()}
                  className="self-end"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Aktualisieren
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="applications">
                <TabsList className="mb-6">
                  <TabsTrigger value="applications">Bewerbungen</TabsTrigger>
                  <TabsTrigger value="settings">Einstellungen</TabsTrigger>
                </TabsList>
                
                <TabsContent value="applications">
                  {/* Filters and Search */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        placeholder="Suche nach Benutzername oder Discord ID"
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="w-full sm:w-48">
                      <Select 
                        value={statusFilter} 
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger>
                          <div className="flex items-center">
                            <Filter size={16} className="mr-2" />
                            <SelectValue placeholder="Filter" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle Status</SelectItem>
                          <SelectItem value="pending">Ausstehend</SelectItem>
                          <SelectItem value="approved">Genehmigt</SelectItem>
                          <SelectItem value="rejected">Abgelehnt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Applications table */}
                  {filteredApplications.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Bewerber</TableHead>
                            <TableHead>Discord ID</TableHead>
                            <TableHead>Datum</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aktionen</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredApplications.map((application) => (
                            <TableRow key={application.id}>
                              <TableCell className="font-medium">{application.roblox_username}</TableCell>
                              <TableCell>{application.discord_id}</TableCell>
                              <TableCell>{formatDate(application.created_at)}</TableCell>
                              <TableCell>
                                {getStatusBadge(application.status)}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => viewApplication(application)}
                                  >
                                    <Eye size={16} />
                                  </Button>
                                  
                                  {application.status === 'pending' && (
                                    <>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                        onClick={() => handleAction(application, 'approve')}
                                      >
                                        <CheckCircle size={16} />
                                      </Button>
                                      
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleAction(application, 'reject')}
                                      >
                                        <XCircle size={16} />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium">Keine Bewerbungen gefunden</h3>
                      <p className="text-sm text-gray-500 mt-2">
                        {searchQuery || statusFilter !== 'all' ? 
                          "Versuche es mit anderen Filterkriterien." : 
                          "Es wurden noch keine Bewerbungen eingereicht."}
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="settings">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Admin-Einstellungen</h3>
                    <p className="text-sm text-gray-500">
                      Hier kannst du in Zukunft weitere Einstellungen für den Admin-Bereich vornehmen.
                    </p>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Server-Statistiken</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-blue-600 font-medium">Offene Bewerbungen</div>
                            <div className="text-2xl font-bold mt-1">
                              {applications.filter(app => app.status === 'pending').length}
                            </div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-green-600 font-medium">Genehmigte Bewerbungen</div>
                            <div className="text-2xl font-bold mt-1">
                              {applications.filter(app => app.status === 'approved').length}
                            </div>
                          </div>
                          <div className="bg-red-50 p-4 rounded-lg">
                            <div className="text-red-600 font-medium">Abgelehnte Bewerbungen</div>
                            <div className="text-2xl font-bold mt-1">
                              {applications.filter(app => app.status === 'rejected').length}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />

      {/* View Application Dialog */}
      <AlertDialog open={viewApplicationDialog} onOpenChange={setViewApplicationDialog}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <User className="mr-2" /> Bewerbung von {selectedApplication?.roblox_username}
            </AlertDialogTitle>
          </AlertDialogHeader>
          
          {selectedApplication && (
            <div className="max-h-[60vh] overflow-y-auto mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Eingereicht am</div>
                  <div className="mt-1">{formatDate(selectedApplication.created_at)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Discord ID</div>
                  <div className="mt-1">{selectedApplication.discord_id}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Roblox Benutzername</div>
                  <div className="mt-1">{selectedApplication.roblox_username}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Roblox ID</div>
                  <div className="mt-1">{selectedApplication.roblox_id}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Alter</div>
                  <div className="mt-1">{selectedApplication.age} Jahre</div>
                </div>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">RP Verständnis</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-gray-500">Was versteht man unter FRP?</Label>
                        <p className="mt-1 border p-2 rounded-md">{selectedApplication.frp_understanding}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Was versteht man unter VDM?</Label>
                        <p className="mt-1 border p-2 rounded-md">{selectedApplication.vdm_understanding}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Was versteht man unter Taschen RP?</Label>
                        <p className="mt-1 border p-2 rounded-md">{selectedApplication.taschen_rp_understanding}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Was ist unser Server Mindestalter?</Label>
                        <p className="mt-1 border p-2 rounded-md">{selectedApplication.server_age_understanding}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Situativen Fragen</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-gray-500">Es passiert eine Situation, die nicht im Regelwerk abgedeckt ist. Wie gehst du vor?</Label>
                        <p className="mt-1 border p-2 rounded-md">{selectedApplication.situation_handling}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Was verstehen wir unter der Bodycam Pflicht?</Label>
                        <p className="mt-1 border p-2 rounded-md">{selectedApplication.bodycam_understanding}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Ein Freund von dir verstößt gegen die Regeln. Was machst du?</Label>
                        <p className="mt-1 border p-2 rounded-md">{selectedApplication.friend_rule_violation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Erfahrung & Aktivität</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-gray-500">Bist du bereits auf anderen RP Discord-Servern aktiv?</Label>
                        <p className="mt-1 border p-2 rounded-md">
                          {selectedApplication.other_servers || "Nicht angegeben"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Hast du schon Erfahrung im Administrativen Bereich?</Label>
                        <p className="mt-1 border p-2 rounded-md">
                          {selectedApplication.admin_experience || "Nicht angegeben"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Wie aktiv bist du?</Label>
                        <div className="mt-1 border p-2 rounded-md flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${(selectedApplication.activity_level / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{selectedApplication.activity_level}/10</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {selectedApplication.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Anmerkungen</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="border p-2 rounded-md">{selectedApplication.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
          
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel>Schließen</AlertDialogCancel>
            
            {selectedApplication && selectedApplication.status === 'pending' && (
              <>
                <AlertDialogAction 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    setViewApplicationDialog(false);
                    handleAction(selectedApplication, 'approve');
                  }}
                >
                  Genehmigen
                </AlertDialogAction>
                
                <AlertDialogAction 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    setViewApplicationDialog(false);
                    handleAction(selectedApplication, 'reject');
                  }}
                >
                  Ablehnen
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Confirm Action Dialog */}
      <AlertDialog open={confirmationDialog} onOpenChange={setConfirmationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Bewerbung genehmigen?' : 'Bewerbung ablehnen?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bist du sicher, dass du die Bewerbung von <strong>{selectedApplication?.roblox_username}</strong> {actionType === 'approve' ? 'genehmigen' : 'ablehnen'} möchtest?
              {actionType === 'reject' && (
                <span className="block mt-2 text-red-600">
                  Diese Aktion kann nicht rückgängig gemacht werden.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAction}
              className={actionType === 'approve' ? 
                'bg-green-600 hover:bg-green-700 text-white' : 
                'bg-red-600 hover:bg-red-700 text-white'}
            >
              {actionType === 'approve' ? 'Genehmigen' : 'Ablehnen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
