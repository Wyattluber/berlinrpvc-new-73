import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkIsAdmin } from '@/lib/admin';
import { toast } from '@/hooks/use-toast';
import { fetchAdminUsers, getCachedUserCount, updateAdminUser, deleteAdminUser, updateTeamSettings, getTeamSettings } from '@/lib/adminService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LoaderIcon, Users, FileText, Settings, LayoutDashboard, 
  UserCog, ShieldCheck, BellRing, ChevronRight, Trash2, PencilLine,
  Activity, BarChart3, UserPlus, Server, Share, Info, X, Check
} from 'lucide-react';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarInset,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import ServerStats from '@/components/ServerStats';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import NewsManagement from '@/components/NewsManagement';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Application = {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
};

const userActivityData = [
  { name: 'Mon', users: 4 },
  { name: 'Tue', users: 3 },
  { name: 'Wed', users: 7 },
  { name: 'Thu', users: 5 },
  { name: 'Fri', users: 8 },
  { name: 'Sat', users: 12 },
  { name: 'Sun', users: 10 },
];

const applicationStatusData = [
  { name: 'Angenommen', value: 15, color: '#4ade80' },
  { name: 'Abgelehnt', value: 8, color: '#f87171' },
  { name: 'Ausstehend', value: 12, color: '#60a5fa' },
];

const COLORS = ['#4ade80', '#f87171', '#60a5fa'];

const DashboardOverview = ({ userCount, adminUsers }: { userCount: number, adminUsers: any[] }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Dashboard Übersicht</h2>
    
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Benutzer gesamt
          </CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userCount}</div>
          <p className="text-xs text-muted-foreground">Registrierte Benutzer</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Admin-Benutzer
          </CardTitle>
          <ShieldCheck className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{adminUsers.length}</div>
          <p className="text-xs text-muted-foreground">Team Mitglieder</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Neue Bewerbungen
          </CardTitle>
          <FileText className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">Letzte 7 Tage</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Server Aktivität
          </CardTitle>
          <Activity className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">89%</div>
          <p className="text-xs text-muted-foreground">Serverauslastung</p>
        </CardContent>
      </Card>
    </div>
    
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-3">Server Statistiken</h3>
      <ServerStats isAdmin={true} />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Benutzeraktivität</CardTitle>
          <CardDescription>Tägliche aktive Benutzer (letzte Woche)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bewerbungsstatus</CardTitle>
          <CardDescription>Verteilung der Bewerbungen nach Status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={applicationStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {applicationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
    
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Letzte Aktivitäten</CardTitle>
        <CardDescription>Die neuesten Ereignisse im System</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { icon: UserPlus, text: "Neuer Benutzer registriert: Max Mustermann", time: "Vor 2 Stunden" },
            { icon: FileText, text: "Neue Bewerbung eingegangen: Lisa Schmidt", time: "Vor 5 Stunden" },
            { icon: BarChart3, text: "Täglicher Statistikbericht generiert", time: "Vor 12 Stunden" },
            { icon: ShieldCheck, text: "Sicherheitsaudit abgeschlossen", time: "Vor 1 Tag" },
            { icon: Settings, text: "Systemeinstellungen aktualisiert", time: "Vor 2 Tagen" }
          ].map((activity, i) => (
            <div key={i} className="flex items-start space-x-4 p-2 hover:bg-gray-50 rounded-md">
              <div className="bg-blue-100 p-2 rounded-full">
                <activity.icon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.text}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">Alle Aktivitäten anzeigen</Button>
      </CardFooter>
    </Card>
  </div>
);

const UsersManagement = ({ adminUsers, handleUpdateRole, handleDeleteUser }: { 
  adminUsers: any[], 
  handleUpdateRole: (userId: string, role: string) => void,
  handleDeleteUser: (userId: string) => void
}) => {
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const startEditing = (userId: string, currentRole: string) => {
    setEditingUser(userId);
    setSelectedRole(currentRole);
  };

  const saveChanges = async (userId: string) => {
    await handleUpdateRole(userId, selectedRole);
    setEditingUser(null);
  };

  const cancelEditing = () => {
    setEditingUser(null);
  };

  const confirmDelete = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (userToDelete) {
      await handleDeleteUser(userToDelete);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Benutzerverwaltung</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Administratoren & Moderatoren</CardTitle>
          <CardDescription>
            Verwalte Benutzer mit administrativen Berechtigungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adminUsers.length === 0 ? (
            <div className="p-4 text-center border rounded-md bg-muted/50">
              <Info className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Keine Admin-Benutzer gefunden.</p>
              <p className="text-xs mt-1 text-muted-foreground">Admin-Benutzer müssen direkt in der Datenbank hinzugefügt werden.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-4 mb-2 px-3 py-2 bg-muted/30 rounded font-medium text-sm">
                <div>E-Mail</div>
                <div>Rolle</div>
                <div className="text-right">Aktionen</div>
              </div>
              
              {adminUsers.map((user) => (
                <div key={user.id} className="grid grid-cols-3 gap-4 items-center p-3 border rounded hover:bg-gray-50">
                  <div className="text-sm font-medium truncate">{user.email || "Kein E-Mail"}</div>
                  
                  <div>
                    {editingUser === user.id ? (
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="w-[180px] h-8">
                          <SelectValue placeholder="Rolle auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrator' : 'Moderator'}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    {editingUser === user.id ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => saveChanges(user.id)}>
                          <Check className="h-4 w-4 mr-1" /> Speichern
                        </Button>
                        <Button variant="ghost" size="sm" onClick={cancelEditing}>
                          <X className="h-4 w-4 mr-1" /> Abbrechen
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => startEditing(user.id, user.role)}>
                          <PencilLine className="h-4 w-4 mr-1" /> Bearbeiten
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => confirmDelete(user.id)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Löschen
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Hinweis: Neue Admin-Benutzer können nur durch bestehende Administratoren hinzugefügt werden.
          </p>
        </CardFooter>
      </Card>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Benutzer löschen</DialogTitle>
            <DialogDescription>
              Möchtest du wirklich diesen Admin-Benutzer löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Abbrechen</Button>
            <Button variant="destructive" onClick={executeDelete}>
              Ja, löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ApplicationsManagement = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Bewerbungsverwaltung</h2>
    <Card>
      <CardHeader>
        <CardTitle>Bewerbungen verwalten</CardTitle>
        <CardDescription>
          Verwalte und überprüfe eingehende Bewerbungen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Bewerbungsübersicht wird geladen...</p>
      </CardContent>
    </Card>
  </div>
);

const TeamSettings = () => {
  const [settings, setSettings] = useState({
    meeting_day: '',
    meeting_time: '',
    meeting_frequency: '',
    meeting_location: '',
    meeting_notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const teamSettings = await getTeamSettings();
        if (teamSettings) {
          setSettings({
            meeting_day: teamSettings.meeting_day || '',
            meeting_time: teamSettings.meeting_time || '',
            meeting_frequency: teamSettings.meeting_frequency || '',
            meeting_location: teamSettings.meeting_location || '',
            meeting_notes: teamSettings.meeting_notes || ''
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: 'Fehler',
          description: 'Die Einstellungen konnten nicht geladen werden.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const result = await updateTeamSettings(settings);
      if (result.success) {
        toast({
          title: 'Erfolg',
          description: 'Die Einstellungen wurden gespeichert.'
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message || 'Die Einstellungen konnten nicht gespeichert werden.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Teameinstellungen</h2>
      <Card>
        <CardHeader>
          <CardTitle>Team Meetings</CardTitle>
          <CardDescription>
            Konfiguriere die Einstellungen für Team-Meetings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <LoaderIcon className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meeting_day">Meeting-Tag</Label>
                  <Select 
                    value={settings.meeting_day} 
                    onValueChange={(value) => setSettings({...settings, meeting_day: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tag auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Montag</SelectItem>
                      <SelectItem value="tuesday">Dienstag</SelectItem>
                      <SelectItem value="wednesday">Mittwoch</SelectItem>
                      <SelectItem value="thursday">Donnerstag</SelectItem>
                      <SelectItem value="friday">Freitag</SelectItem>
                      <SelectItem value="saturday">Samstag</SelectItem>
                      <SelectItem value="sunday">Sonntag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting_time">Meeting-Zeit</Label>
                  <Input 
                    id="meeting_time" 
                    type="time" 
                    value={settings.meeting_time} 
                    onChange={(e) => setSettings({...settings, meeting_time: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting_frequency">Meeting-Häufigkeit</Label>
                  <Select 
                    value={settings.meeting_frequency} 
                    onValueChange={(value) => setSettings({...settings, meeting_frequency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Häufigkeit auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Wöchentlich</SelectItem>
                      <SelectItem value="biweekly">Zweiwöchentlich</SelectItem>
                      <SelectItem value="monthly">Monatlich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting_location">Meeting-Ort</Label>
                  <Input 
                    id="meeting_location" 
                    value={settings.meeting_location} 
                    onChange={(e) => setSettings({...settings, meeting_location: e.target.value})}
                    placeholder="Discord, TeamSpeak, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting_notes">Notizen</Label>
                <Textarea 
                  id="meeting_notes" 
                  value={settings.meeting_notes} 
                  onChange={(e) => setSettings({...settings, meeting_notes: e.target.value})}
                  placeholder="Zusätzliche Informationen zu den Meetings..."
                  rows={3}
                />
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={saving || loading}>
            {saving ? (
              <>
                <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                Speichern...
              </>
            ) : 'Einstellungen speichern'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const SecuritySettings = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Sicherheitseinstellungen</h2>
    <Card>
      <CardHeader>
        <CardTitle>Administratorzugriff</CardTitle>
        <CardDescription>
          Verwalte Zugriffsrechte und Sicherheitseinstellungen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="two-factor">Zwei-Faktor-Authentifizierung</Label>
          <div className="flex justify-between items-center border p-3 rounded">
            <div>
              <p className="font-medium">2FA für Admin-Zugänge</p>
              <p className="text-sm text-muted-foreground">Erhöhte Sicherheit für Administratoren</p>
            </div>
            <Button variant="outline">Konfigurieren</Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="access-logs">Zugriffsprotokoll</Label>
          <div className="border p-3 rounded">
            <p className="font-medium">Letzte Zugriffsversuche</p>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Keine Zugriffsversuche protokolliert.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const AccountDetails = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Kontoverwaltung</h2>
    <Card>
      <CardHeader>
        <CardTitle>Kontoinformationen</CardTitle>
        <CardDescription>
          Verwalte die Details deines Administrator-Kontos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-email">E-Mail-Adresse</Label>
          <Input id="admin-email" disabled value="admin@example.com" />
          <p className="text-xs text-muted-foreground">Die E-Mail-Adresse kann nicht geändert werden.</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="admin-role">Rolle</Label>
          <Input id="admin-role" disabled value="Administrator" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="admin-since">Administrator seit</Label>
          <Input id="admin-since" disabled value="01.01.2024" />
        </div>
      </CardContent>
    </Card>
  </div>
);

const NotificationSettings = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Benachrichtigungen</h2>
    <Card>
      <CardHeader>
        <CardTitle>Benachrichtigungseinstellungen</CardTitle>
        <CardDescription>
          Verwalte, wie und wann du benachrichtigt wirst
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Neue Bewerbungen</Label>
          <div className="flex justify-between items-center border p-3 rounded">
            <div>
              <p className="font-medium">Benachrichtigung bei neuen Bewerbungen</p>
              <p className="text-sm text-muted-foreground">E-Mail und Browser-Benachrichtigungen</p>
            </div>
            <Button variant="outline">Aktivieren</Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Sicherheitsbenachrichtigungen</Label>
          <div className="flex justify-between items-center border p-3 rounded">
            <div>
              <p className="font-medium">Wichtige Sicherheitswarnungen</p>
              <p className="text-sm text-muted-foreground">Sofortige Benachrichtigung bei verdächtigen Aktivitäten</p>
            </div>
            <Button variant="outline">Aktivieren</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
        
        if (adminStatus) {
          const users = await fetchAdminUsers();
          setAdminUsers(users);
          
          const count = await getCachedUserCount();
          setUserCount(count);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking admin access:", error);
        setLoading(false);
        setIsAdmin(false);
      }
    };
    
    checkAccess();
  }, []);

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const result = await updateAdminUser(userId, role);
      
      if (result.success) {
        toast({
          title: "Erfolg",
          description: "Benutzerrolle erfolgreich aktualisiert."
        });
        
        setAdminUsers(prevUsers => prevUsers.map(user => 
          user.id === userId ? { ...user, role } : user
        ));
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Aktualisieren der Benutzerrolle.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const result = await deleteAdminUser(userId);
      
      if (result.success) {
        toast({
          title: "Erfolg",
          description: "Benutzer erfolgreich gelöscht."
        });
        
        setAdminUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Löschen des Benutzers.",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 w-full">
        <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (isAdmin === false) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Zugriff verweigert</CardTitle>
          <CardDescription>
            Du benötigst Administrator-Berechtigungen, um auf diesen Bereich zuzugreifen.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const menuItems = [
    { title: "Dashboard", id: "dashboard", icon: LayoutDashboard },
    { title: "Benutzer", id: "users", icon: Users },
    { title: "Bewerbungen", id: "applications", icon: FileText },
    { title: "Neuigkeiten", id: "news", icon: BellRing },
    { title: "Teameinstellungen", id: "team-settings", icon: Settings },
    { title: "Sicherheit", id: "security", icon: ShieldCheck },
    { title: "Kontoverwaltung", id: "account", icon: UserCog }
  ];
  
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview userCount={userCount} adminUsers={adminUsers} />;
      case 'users':
        return <UsersManagement adminUsers={adminUsers} handleUpdateRole={handleUpdateRole} handleDeleteUser={handleDeleteUser} />;
      case 'applications':
        return <ApplicationsManagement />;
      case 'news':
        return <NewsManagement />;
      case 'team-settings':
        return <TeamSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'account':
        return <AccountDetails />;
      default:
        return <DashboardOverview userCount={userCount} adminUsers={adminUsers} />;
    }
  };
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full h-[70vh] overflow-auto">
        <Sidebar>
          <SidebarHeader className="flex items-center justify-center py-4">
            <h2 className="text-xl font-bold">Admin Panel</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        onClick={() => setActiveSection(item.id)}
                        isActive={activeSection === item.id}
                        tooltip={item.title}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="bg-gray-50 overflow-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminPanel;
