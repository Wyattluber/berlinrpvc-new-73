import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  BarChart, 
  Calendar, 
  Edit, 
  Trash, 
  CheckCircle2,
  XCircle,
  Clock,
  Plus
} from 'lucide-react';

// Example user data (would come from API/database in real app)
const initialUsers = [
  { id: '1', name: 'Admin', email: 'info@berlinrpvc.de', discordId: '123456789012345678', role: 'admin' },
  { id: '2', name: 'Anna Schmidt', email: 'anna@example.com', discordId: '234567890123456789', role: 'moderator' },
  { id: '3', name: 'Tom Meyer', email: 'tom@example.com', discordId: '345678901234567890', role: 'user' },
  { id: '4', name: 'Lisa Bauer', email: 'lisa@example.com', discordId: '456789012345678901', role: 'user' }
];

// Example applications data with properly typed status
const initialApplications = [
  { 
    id: '1', 
    name: 'Max Mustermann', 
    discordId: '123456789012345678', 
    submitted: '2025-04-01', 
    status: 'pending' as const,
    robloxUsername: 'MaxMuster',
    age: '16',
    whyModerator: 'Ich möchte dem Server helfen und habe bereits Erfahrung als Moderator auf anderen Servern...',
    frpExplanation: 'Fail Roleplay ist, wenn man nicht seiner Rolle entsprechend handelt...',
    vdmExplanation: 'Vehicle Deathmatch bedeutet, dass man mit einem Fahrzeug andere absichtlich tötet...',
    taschenRpExplanation: 'Taschen-RP bezieht sich auf das unrealistische Tragen vieler Gegenstände...',
    serverMinAge: '12',
    situationHandling: 'Ich würde das Team kontaktieren und nach einer Entscheidung fragen...',
    bodycamExplanation: 'Die Bodycam-Pflicht bedeutet, dass Polizisten ihre Interaktionen aufzeichnen müssen...',
    otherServers: [{ name: 'RP Example', link: 'https://discord.gg/example' }],
    adminExperience: 'Ja, ich war Administrator auf mehreren Discord-Servern mit über 500 Mitgliedern...',
    activity: 8,
    notes: 'Ich bin sehr motiviert und habe flexible Zeiten...'
  },
  { 
    id: '2', 
    name: 'Julia Weber', 
    discordId: '987654321098765432', 
    submitted: '2025-04-02', 
    status: 'accepted' as const,
    robloxUsername: 'JuliaW',
    age: '18',
    whyModerator: 'Ich bin sehr engagiert und möchte meine Fähigkeiten einbringen...',
    frpExplanation: 'Fail Roleplay bedeutet, dass man sich nicht realistisch verhält...',
    vdmExplanation: 'Vehicle Deathmatch ist eine Regelverstoß, bei dem...',
    taschenRpExplanation: 'Beim Taschen-RP versucht man, unrealistisch viele Items zu tragen...',
    serverMinAge: '12',
    situationHandling: 'In diesem Fall würde ich zunächst die Regeln prüfen und dann...',
    bodycamExplanation: 'Die Bodycam-Pflicht gilt für alle Beamten im Dienst und...',
    otherServers: [{ name: 'RP Unite', link: 'https://discord.gg/rpunite' }],
    adminExperience: 'Ja, ich habe bereits 2 Jahre Erfahrung als Moderator...',
    activity: 9,
    notes: 'Ich kann besonders am Wochenende aktiv sein...'
  },
  { 
    id: '3', 
    name: 'Felix Krause', 
    discordId: '567890123456789012', 
    submitted: '2025-04-01', 
    status: 'waitlisted' as const,
    robloxUsername: 'FelixK',
    age: '15',
    whyModerator: 'Ich spiele sehr gerne Roleplay und möchte dem Team helfen...',
    frpExplanation: 'FRP ist wenn man aus seiner Rolle fällt und nicht realistisch handelt...',
    vdmExplanation: 'VDM bedeutet, dass man mit einem Fahrzeug jemanden absichtlich überfährt...',
    taschenRpExplanation: 'Taschen-RP ist, wenn man zu viele Gegenstände mit sich führt...',
    serverMinAge: '12',
    situationHandling: 'Ich würde mir überlegen, was in dieser Situation am realistischsten wäre...',
    bodycamExplanation: 'Bei der Bodycam-Pflicht müssen alle Beamten ihre Kamera eingeschaltet haben...',
    otherServers: [],
    adminExperience: 'Nein, aber ich lerne schnell und bin motiviert...',
    activity: 7,
    notes: ''
  }
];

// Server stats data
const initialStats = {
  discordMembers: 179,
  partnerServers: 2,
  servers: 1,
  lastUpdated: '2025-04-03 14:30'
};

type User = {
  id: string;
  name: string;
  email: string;
  discordId: string;
  role: string;
};

type ServerStats = {
  discordMembers: number;
  partnerServers: number;
  servers: number;
  lastUpdated: string;
};

type OtherServer = {
  name: string;
  link: string;
};

type Application = {
  id: string;
  name: string;
  discordId: string;
  submitted: string;
  status: 'pending' | 'accepted' | 'rejected' | 'waitlisted';
  robloxUsername: string;
  age: string;
  whyModerator: string;
  frpExplanation: string;
  vdmExplanation: string;
  taschenRpExplanation: string;
  serverMinAge: string;
  situationHandling: string;
  bodycamExplanation: string;
  otherServers: OtherServer[];
  adminExperience: string;
  activity: number;
  notes: string;
};

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [stats, setStats] = useState<ServerStats>(initialStats);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [newDiscordId, setNewDiscordId] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [editingStats, setEditingStats] = useState(false);
  const [tempStats, setTempStats] = useState(initialStats);
  
  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(storedUser);
    if (userData.role === 'admin') {
      setIsAuthenticated(true);
    }
  }, [navigate]);
  
  const handleAuthenticate = () => {
    if (adminPassword === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
      
      // Update user role to admin in localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.role = 'admin';
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      toast({
        title: "Zugriff gewährt",
        description: "Du hast jetzt Administratorrechte.",
      });
    } else {
      setAuthError('Falsches Passwort');
    }
  };
  
  const handleRoleChange = (userId: string, newRole: string) => {
    setIsLoading(true);
    
    // In a real application, this would be an API call
    setTimeout(() => {
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: "Rolle aktualisiert",
        description: `Benutzerrolle wurde auf ${newRole} aktualisiert.`,
      });
      setIsLoading(false);
    }, 500);
  };

  const handleAddDiscordId = () => {
    if (!newDiscordId.trim() || !newUserName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib sowohl einen Namen als auch eine Discord ID ein.",
        variant: "destructive",
      });
      return;
    }
    
    // Simple validation for Discord ID
    const discordIdRegex = /^\d{17,19}$/;
    if (!discordIdRegex.test(newDiscordId.trim())) {
      toast({
        title: "Ungültige Discord ID",
        description: "Die Discord ID sollte aus 17-19 Ziffern bestehen.",
        variant: "destructive",
      });
      return;
    }
    
    const newId = (users.length + 1).toString();
    const newUser = {
      id: newId,
      name: newUserName,
      email: `${newUserName.toLowerCase().replace(/\s/g, '.')}@example.com`,
      discordId: newDiscordId,
      role: 'user'
    };
    
    setUsers([...users, newUser]);
    setNewDiscordId('');
    setNewUserName('');
    
    toast({
      title: "Discord ID hinzugefügt",
      description: `${newUserName} wurde mit der Discord ID ${newDiscordId} hinzugefügt.`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    
    toast({
      title: "Benutzer gelöscht",
      description: "Der Benutzer wurde erfolgreich gelöscht.",
    });
  };

  const handleApplicationStatusChange = (applicationId: string, newStatus: Application['status']) => {
    setApplications(applications.map(app => 
      app.id === applicationId ? { ...app, status: newStatus } : app
    ));
    
    const statusText = {
      'pending': 'Ausstehend',
      'accepted': 'Angenommen',
      'rejected': 'Abgelehnt',
      'waitlisted': 'Warteliste'
    }[newStatus];
    
    toast({
      title: "Status aktualisiert",
      description: `Bewerbungsstatus wurde auf "${statusText}" geändert.`,
    });
  };

  const handleSaveStats = () => {
    setStats({
      ...tempStats,
      lastUpdated: new Date().toLocaleString('de-DE')
    });
    
    setEditingStats(false);
    
    toast({
      title: "Statistiken aktualisiert",
      description: "Die Server-Statistiken wurden aktualisiert.",
    });
  };

  const getStatusBadgeClass = (status: Application['status']) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'waitlisted':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow py-12 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <CardTitle>Admin Zugang</CardTitle>
              <CardDescription className="text-blue-100">
                Bitte gib das Admin-Passwort ein, um fortzufahren
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="info@berlinrpvc.de"
                  defaultValue="info@berlinrpvc.de"
                  readOnly
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Passwort</Label>
                <Input 
                  id="adminPassword" 
                  type="password" 
                  placeholder="Admin-Passwort eingeben" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
                {authError && <p className="text-sm text-red-500">{authError}</p>}
                <p className="text-xs text-gray-500">
                  Das temporäre Admin-Passwort lautet: admin123
                </p>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700"
                onClick={handleAuthenticate}
              >
                Einloggen
              </Button>
            </CardContent>
          </Card>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <div className="flex justify-center">
              <TabsList className="mb-4">
                <TabsTrigger value="users" className="flex items-center gap-1">
                  <Users size={16} />
                  <span>Benutzer</span>
                </TabsTrigger>
                <TabsTrigger value="applications" className="flex items-center gap-1">
                  <CheckCircle2 size={16} />
                  <span>Bewerbungen</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-1">
                  <BarChart size={16} />
                  <span>Statistiken</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="users" className="space-y-6">
              <Card className="shadow-lg border-t-4 border-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield size={20} className="text-blue-600" />
                    Discord IDs verwalten
                  </CardTitle>
                  <CardDescription>
                    Hier kannst du Discord IDs und Benutzerrollen verwalten
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="userName">Benutzername</Label>
                        <Input 
                          id="userName" 
                          placeholder="Name des Benutzers" 
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discordId">Discord ID</Label>
                        <Input 
                          id="discordId" 
                          placeholder="z.B. 123456789012345678" 
                          value={newDiscordId}
                          onChange={(e) => setNewDiscordId(e.target.value)}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button 
                          onClick={handleAddDiscordId} 
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus size={16} className="mr-2" /> Hinzufügen
                        </Button>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Discord ID</TableHead>
                            <TableHead>Rolle</TableHead>
                            <TableHead className="text-right">Aktionen</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell className="font-mono text-sm">{user.discordId}</TableCell>
                              <TableCell>
                                <Select
                                  defaultValue={user.role}
                                  onValueChange={(value) => handleRoleChange(user.id, value)}
                                  disabled={isLoading}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Rolle" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">Benutzer</SelectItem>
                                    <SelectItem value="moderator">Moderator</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash size={16} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications" className="space-y-6">
              <Card className="shadow-lg border-t-4 border-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-green-600" />
                    Bewerbungen verwalten
                  </CardTitle>
                  <CardDescription>
                    Hier kannst du eingegangene Bewerbungen ansehen und verwalten
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Discord ID</TableHead>
                          <TableHead>Roblox</TableHead>
                          <TableHead>Alter</TableHead>
                          <TableHead>Eingereicht</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((application) => (
                          <TableRow key={application.id}>
                            <TableCell className="font-medium">{application.name}</TableCell>
                            <TableCell className="font-mono text-sm">{application.discordId}</TableCell>
                            <TableCell>{application.robloxUsername}</TableCell>
                            <TableCell>{application.age}</TableCell>
                            <TableCell>{application.submitted}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(application.status)}`}>
                                {{
                                  'pending': 'Ausstehend',
                                  'accepted': 'Angenommen',
                                  'rejected': 'Abgelehnt',
                                  'waitlisted': 'Warteliste'
                                }[application.status]}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleApplicationStatusChange(application.id, 'accepted')}
                                  className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                  title="Annehmen"
                                >
                                  <CheckCircle2 size={16} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleApplicationStatusChange(application.id, 'rejected')}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                  title="Ablehnen"
                                >
                                  <XCircle size={16} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleApplicationStatusChange(application.id, 'waitlisted')}
                                  className="text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                                  title="Warteliste"
                                >
                                  <Clock size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <Card className="shadow-lg border-t-4 border-purple-500">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart size={20} className="text-purple-600" />
                      Server Statistiken
                    </CardTitle>
                    <Button 
                      variant={editingStats ? "outline" : "default"}
                      onClick={() => editingStats ? handleSaveStats() : setEditingStats(true)}
                      className={editingStats ? "border-purple-500 text-purple-700" : "bg-purple-600 hover:bg-purple-700"}
                    >
                      {editingStats ? "Speichern" : (
                        <div className="flex items-center gap-1">
                          <Edit size={16} />
                          <span>Bearbeiten</span>
                        </div>
                      )}
                    </Button>
                  </div>
                  <CardDescription>
                    Hier kannst du die Server-Statistiken einsehen und bearbeiten
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-100 relative group">
                      <div className="absolute top-2 right-2">
                        <div className="text-gray-400 hover:text-gray-600 cursor-help group-hover:opacity-100 opacity-0 transition-opacity" title={`Zuletzt aktualisiert: ${stats.lastUpdated}`}>
                          ?
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <Users className="h-8 w-8 text-blue-600 mb-2" />
                        <h3 className="text-lg font-medium text-gray-700 mb-1">Discord Mitglieder</h3>
                        {editingStats ? (
                          <Input 
                            className="text-center text-2xl font-bold w-24"
                            type="number"
                            value={tempStats.discordMembers}
                            onChange={(e) => setTempStats({...tempStats, discordMembers: parseInt(e.target.value) || 0})}
                          />
                        ) : (
                          <p className="text-2xl font-bold">{stats.discordMembers}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border border-gray-100 relative group">
                      <div className="absolute top-2 right-2">
                        <div className="text-gray-400 hover:text-gray-600 cursor-help group-hover:opacity-100 opacity-0 transition-opacity" title={`Zuletzt aktualisiert: ${stats.lastUpdated}`}>
                          ?
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <Shield className="h-8 w-8 text-indigo-600 mb-2" />
                        <h3 className="text-lg font-medium text-gray-700 mb-1">Partner Server</h3>
                        {editingStats ? (
                          <Input 
                            className="text-center text-2xl font-bold w-24" 
                            type="number"
                            value={tempStats.partnerServers}
                            onChange={(e) => setTempStats({...tempStats, partnerServers: parseInt(e.target.value) || 0})}
                          />
                        ) : (
                          <p className="text-2xl font-bold">{stats.partnerServers}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border border-gray-100 relative group">
                      <div className="absolute top-2 right-2">
                        <div className="text-gray-400 hover:text-gray-600 cursor-help group-hover:opacity-100 opacity-0 transition-opacity" title={`Zuletzt aktualisiert: ${stats.lastUpdated}`}>
                          ?
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <Calendar className="h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="text-lg font-medium text-gray-700 mb-1">Server</h3>
                        {editingStats ? (
                          <Input 
                            className="text-center text-2xl font-bold w-24" 
                            type="number"
                            value={tempStats.servers}
                            onChange={(e) => setTempStats({...tempStats, servers: parseInt(e.target.value) || 0})}
                          />
                        ) : (
                          <p className="text-2xl font-bold">{stats.servers}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mt-6 text-center">
                    Statistiken zuletzt aktualisiert: {stats.lastUpdated}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
