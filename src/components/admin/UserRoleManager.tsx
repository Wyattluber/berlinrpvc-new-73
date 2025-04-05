
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { LoaderIcon, Plus, UserX, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface User {
  id: string;
  email: string;
  username?: string;
  created_at?: string;
}

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
}

const UserRoleManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [adminUsers, setAdminUsers] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('moderator');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const loadAdminUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id, role');
      
      if (error) throw error;
      
      const userMap: {[key: string]: string} = {};
      if (data) {
        data.forEach(user => {
          userMap[user.user_id] = user.role;
        });
      }
      
      setAdminUsers(userMap);
    } catch (error) {
      console.error('Error loading admin users:', error);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      // Use the edge function to get all users
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Nicht angemeldet",
          description: "Du musst angemeldet sein, um diese Aktion auszuführen.",
          variant: "destructive"
        });
        return;
      }
      
      const response = await supabase.functions.invoke('get_users_by_ids', {
        body: { user_ids: [] },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (response.error) throw new Error(response.error.message);
      if (!response.data) throw new Error("Keine Daten erhalten");
      
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Laden der Benutzer",
        variant: "destructive"
      });
    } finally {
      setLoadingUsers(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      await loadAdminUsers();
      await loadUsers();
    };
    
    initializeData();
  }, [loadAdminUsers, loadUsers]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(users.filter(user => 
        (user.email && user.email.toLowerCase().includes(term)) || 
        (user.username && user.username.toLowerCase().includes(term))
      ));
    }
  }, [searchTerm, users]);

  const handleAddRole = async () => {
    if (!selectedUser || !selectedRole) return;
    
    try {
      // Check if user already has a role
      if (adminUsers[selectedUser]) {
        const { error } = await supabase
          .from('admin_users')
          .update({ role: selectedRole })
          .eq('user_id', selectedUser);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('admin_users')
          .insert({ user_id: selectedUser, role: selectedRole });
          
        if (error) throw error;
      }
      
      // Update local state
      setAdminUsers({
        ...adminUsers,
        [selectedUser]: selectedRole
      });
      
      toast({
        title: "Erfolg",
        description: `Die Rolle wurde erfolgreich aktualisiert.`
      });
      
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error adding role:', error);
      toast({
        title: "Fehler",
        description: error.message || "Die Rolle konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Update local state
      const newAdminUsers = { ...adminUsers };
      delete newAdminUsers[userId];
      setAdminUsers(newAdminUsers);
      
      toast({
        title: "Erfolg",
        description: "Die Rolle wurde erfolgreich entfernt."
      });
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast({
        title: "Fehler",
        description: error.message || "Die Rolle konnte nicht entfernt werden.",
        variant: "destructive"
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Administrator</span>;
      case 'moderator':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Moderator</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{role}</span>;
    }
  };

  const getFormattedDate = (dateString?: string) => {
    if (!dateString) return 'Unbekannt';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rollenverwaltung</CardTitle>
          <CardDescription>
            Füge Benutzer als Administratoren oder Moderatoren hinzu
          </CardDescription>
        </CardHeader>
        <CardContent className="h-48 flex items-center justify-center">
          <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rollenverwaltung</CardTitle>
        <CardDescription>
          Füge Benutzer als Administratoren oder Moderatoren hinzu
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4 space-x-2">
          <Input
            placeholder="Benutzer suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button 
            onClick={() => loadUsers()} 
            variant="outline"
            disabled={loadingUsers}
          >
            {loadingUsers ? <LoaderIcon className="h-4 w-4 animate-spin mr-1" /> : null}
            Aktualisieren
          </Button>
          <Button 
            onClick={() => setDialogOpen(true)}
            disabled={users.length === 0}
          >
            <Plus className="h-4 w-4 mr-1" /> Rolle hinzufügen
          </Button>
        </div>
        
        {filteredUsers.length === 0 ? (
          <div className="text-center p-6 border rounded-md bg-muted/20">
            <p className="text-muted-foreground">Keine Benutzer gefunden</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredUsers.map(user => (
                <Card key={user.id} className="shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {user.username || 'Kein Benutzername'}
                        </CardTitle>
                        <CardDescription className="text-xs truncate">
                          {user.email}
                        </CardDescription>
                      </div>
                      {adminUsers[user.id] && (
                        <div>{getRoleBadge(adminUsers[user.id])}</div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="text-xs text-muted-foreground mb-2">
                      Registriert: {getFormattedDate(user.created_at)}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-end">
                    {adminUsers[user.id] ? (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRemoveRole(user.id)}
                      >
                        <UserX className="h-4 w-4 mr-1" /> Rolle entfernen
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user.id);
                          setSelectedRole('moderator');
                          setDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Rolle zuweisen
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Administratoren haben vollen Zugriff auf alle Funktionen. Moderatoren können Bewerbungen verwalten und vom Team-Meeting abmelden.
        </p>
      </CardFooter>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rolle zuweisen</DialogTitle>
            <DialogDescription>
              Wähle einen Benutzer und eine Rolle aus.
            </DialogDescription>
          </DialogHeader>
          
          {!selectedUser && (
            <div className="my-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Benutzer</label>
                <Select value={selectedUser || ''} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Benutzer auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.username || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <div className="my-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rolle</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Rolle auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleAddRole}
              disabled={!selectedUser || !selectedRole}
            >
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserRoleManager;
