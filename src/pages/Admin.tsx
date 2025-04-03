
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

// Example user data (would come from API/database in real app)
const initialUsers = [
  { id: '1', name: 'Max Mustermann', email: 'max@example.com', discordId: 'max#1234', role: 'user' },
  { id: '2', name: 'Anna Schmidt', email: 'anna@example.com', discordId: 'anna#5678', role: 'moderator' },
  { id: '3', name: 'Tom Meyer', email: 'tom@example.com', discordId: 'tom#9101', role: 'user' },
  { id: '4', name: 'Lisa Bauer', email: 'lisa@example.com', discordId: 'lisa#1121', role: 'user' }
];

type User = {
  id: string;
  name: string;
  email: string;
  discordId: string;
  role: string;
};

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in and has admin role
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(storedUser);
    if (userData.role !== 'admin') {
      toast({
        title: "Zugriff verweigert",
        description: "Du hast keine Berechtigung für diese Seite.",
        variant: "destructive"
      });
      navigate('/profile');
    }
  }, [navigate]);
  
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

  const handleScheduleMeeting = () => {
    toast({
      title: "Termin gespeichert",
      description: "Das Team-Meeting wurde für Samstag, 19:00 Uhr geplant.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* User Management Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Benutzer verwalten</CardTitle>
                <CardDescription>
                  Benutzerrollen und Berechtigungen verwalten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Discord ID</TableHead>
                      <TableHead>Rolle</TableHead>
                      <TableHead>Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.discordId}</TableCell>
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
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700">
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {/* Team Meetings Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Team-Meetings</CardTitle>
                <CardDescription>
                  Meetings planen und Teilnehmer verwalten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-2">Nächstes Meeting</h3>
                  <p>Samstag, 19:00 Uhr</p>
                  <p className="text-sm text-gray-600 mt-1">Teamstage</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Meeting planen</h3>
                  <p className="text-sm text-gray-600">
                    Standardmäßig finden die Meetings jeden Samstag um 19:00 Uhr statt. 
                    Klicke auf den Button, um diesen Termin zu bestätigen.
                  </p>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700"
                  onClick={handleScheduleMeeting}
                >
                  Meeting für Samstag bestätigen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
