
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { getTotalUserCount } from '@/lib/admin';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Users, Loader2, LayoutDashboard, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUserId, setEditUserId] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [open, setOpen] = React.useState(false);
  const [userCount, setUserCount] = useState(0);
  const [usernames, setUsernames] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchUserCount();
  }, []);

  const fetchUserCount = async () => {
    try {
      const { data: { count }, error } = await supabase.rpc('get_auth_user_count');
      if (error) {
        console.error('Error fetching user count from RPC:', error);
        // Fallback to the previous method if RPC fails
        const countFallback = await getTotalUserCount();
        setUserCount(countFallback);
      } else {
        setUserCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching user count:', error);
    }
  };

  const fetchUsernames = async (userIds) => {
    if (!userIds.length) return;
    
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.error('Error fetching user details:', error);
        return;
      }
      
      const usernameMap = {};
      data?.users?.forEach(user => {
        usernameMap[user.id] = user.email || `User ${user.id.substring(0, 6)}`;
      });
      
      setUsernames(usernameMap);
    } catch (error) {
      console.error('Error in fetchUsernames:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*');

      if (error) {
        throw error;
      }

      setUsers(data || []);
      
      // Fetch usernames for all user IDs
      if (data && data.length > 0) {
        const userIds = data.map(user => user.user_id);
        fetchUsernames(userIds);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Benutzer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditUserId(user.id);
    setEditRole(user.role);
    setOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ role: editRole })
        .eq('id', editUserId);

      if (error) {
        throw error;
      }

      toast({
        title: "Erfolgreich",
        description: "Benutzer erfolgreich aktualisiert.",
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren des Benutzers.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bist du sicher, dass du diesen Benutzer löschen möchtest?")) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        toast({
          title: "Erfolgreich",
          description: "Benutzer erfolgreich gelöscht.",
        });
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Fehler",
          description: "Fehler beim Löschen des Benutzers.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const getUsernameById = (userId) => {
    return usernames[userId] || 'Unbekannter Benutzer';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto py-10 px-4">
          <Card className="mb-6">
            <CardHeader className="bg-blue-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl font-bold text-blue-900">Admin Panel</CardTitle>
                  <CardDescription>Verwaltung des Bayern RP Servers</CardDescription>
                </div>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <Link to="/admin/dashboard">
                        <Button variant="outline" className="flex items-center gap-2">
                          <LayoutDashboard size={16} />
                          Dashboard
                          <ArrowRight size={16} />
                        </Button>
                      </Link>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">Registrierte Benutzer</CardTitle>
                    <CardDescription>Gesamtzahl der registrierten Benutzer in Supabase</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-blue-600">{userCount}</div>
                  </CardContent>
                  <CardFooter className="text-sm text-gray-500">
                    Stand: {new Date().toLocaleString('de-DE')}
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">Admin-Benutzer</CardTitle>
                    <CardDescription>Benutzer mit Admin-Rechten</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-green-600">{users.length}</div>
                  </CardContent>
                  <CardFooter className="text-sm text-gray-500">
                    Teamverwaltung unten ansehen
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">Bewerbungen</CardTitle>
                    <CardDescription>Alle Bewerbungen verwalten</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <Link to="/admin/dashboard">
                        <Button className="w-full">Zu Bewerbungen</Button>
                      </Link>
                    </div>
                  </CardContent>
                  <CardFooter className="text-sm text-gray-500">
                    Verwaltung im Admin-Dashboard
                  </CardFooter>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Users className="mr-2 h-5 w-5 text-blue-500" />
                    Teamverwaltung
                  </CardTitle>
                  <CardDescription>
                    Admin-Benutzer mit speziellen Rechten verwalten
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                  ) : (
                    <Table>
                      <TableCaption>Admin-Benutzer mit speziellen Rechten.</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">ID</TableHead>
                          <TableHead>Benutzer</TableHead>
                          <TableHead>Benutzer ID</TableHead>
                          <TableHead>Rolle</TableHead>
                          <TableHead>Erstellt am</TableHead>
                          <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.id.substring(0, 6)}...</TableCell>
                            <TableCell className="flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-500" />
                              {getUsernameById(user.user_id)}
                            </TableCell>
                            <TableCell>{user.user_id.substring(0, 8)}...</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin' 
                                  ? 'bg-red-100 text-red-800' 
                                  : user.role === 'moderator' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role || 'admin'}
                              </span>
                            </TableCell>
                            <TableCell>{new Date(user.created_at).toLocaleString('de-DE')}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleEdit(user)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Bearbeiten
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleDelete(user.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Löschen
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Benutzer bearbeiten</DialogTitle>
            <DialogDescription>
              Änderungen am Benutzer vornehmen. Klicke auf Speichern, wenn du fertig bist.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rolle
              </Label>
              <Input 
                id="role" 
                value={editRole} 
                onChange={(e) => setEditRole(e.target.value)} 
                className="col-span-3" 
                placeholder="admin oder moderator"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} className="w-full">Änderungen speichern</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default AdminPanel;
