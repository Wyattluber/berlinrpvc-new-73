
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PencilLine, Check, X, Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

const UserRoleManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<{id: string, role: string} | null>(null);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // First, get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .order('username', { ascending: true });
      
      if (profilesError) throw profilesError;
      
      if (!profiles || profiles.length === 0) {
        setUsers([]);
        return;
      }
      
      // Get admin users to determine roles
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('user_id, role');
      
      if (adminError) throw adminError;
      
      // Get user emails (admin function)
      const userIds = profiles.map(profile => profile.id);
      const batchSize = 10; // Process in batches to avoid large payloads
      let allUsers: any[] = [];
      
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batchIds = userIds.slice(i, i + batchSize);
        const { data: batchUsers, error } = await supabase.functions.invoke('get_users_by_ids', {
          body: { user_ids: batchIds }
        });
        
        if (error) {
          console.error('Error fetching user batch:', error);
          continue;
        }
        
        if (batchUsers) {
          allUsers = [...allUsers, ...batchUsers];
        }
      }
      
      // Combine the data
      const combinedUsers = profiles.map(profile => {
        const adminUser = adminUsers?.find(admin => admin.user_id === profile.id);
        const authUser = allUsers.find(user => user.id === profile.id);
        
        return {
          id: profile.id,
          username: profile.username || 'Unbekannter Benutzer',
          email: authUser?.email || 'Keine E-Mail verfügbar',
          role: adminUser?.role || 'member'
        };
      });
      
      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Fehler beim Laden der Benutzer',
        description: 'Die Benutzerliste konnte nicht geladen werden.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const startEditing = (userId: string, currentRole: string) => {
    setEditingUserId(userId);
    setSelectedRole(currentRole);
  };
  
  const cancelEditing = () => {
    setEditingUserId(null);
  };
  
  const confirmRoleChange = (userId: string) => {
    setUserToUpdate({ id: userId, role: selectedRole });
    setConfirmDialogOpen(true);
  };
  
  const updateUserRole = async () => {
    if (!userToUpdate) return;
    
    try {
      setIsProcessing(true);
      
      if (userToUpdate.role === 'member') {
        // If changing to member, remove from admin_users
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('user_id', userToUpdate.id);
        
        if (error) throw error;
      } else {
        // Check if user already exists in admin_users
        const { data: existingUser, error: checkError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', userToUpdate.id)
          .maybeSingle();
        
        if (checkError) throw checkError;
        
        if (existingUser) {
          // Update existing role
          const { error } = await supabase
            .from('admin_users')
            .update({ role: userToUpdate.role })
            .eq('user_id', userToUpdate.id);
          
          if (error) throw error;
        } else {
          // Insert new admin user
          const { error } = await supabase
            .from('admin_users')
            .insert({ 
              user_id: userToUpdate.id, 
              role: userToUpdate.role 
            });
          
          if (error) throw error;
        }
      }
      
      toast({
        title: 'Rolle aktualisiert',
        description: 'Die Benutzerrolle wurde erfolgreich aktualisiert.'
      });
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userToUpdate.id ? { ...user, role: userToUpdate.role } : user
      ));
      
      setEditingUserId(null);
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Fehler',
        description: 'Die Benutzerrolle konnte nicht aktualisiert werden.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'moderator':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'moderator':
        return 'Moderator';
      default:
        return 'Mitglied';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Benutzerverwaltung</CardTitle>
        <CardDescription>
          Verwalte alle Benutzer und deren Rollen
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            Keine Benutzer gefunden.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benutzername</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {editingUserId === user.id ? (
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="member">Mitglied</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeClass(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingUserId === user.id ? (
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => confirmRoleChange(user.id)}
                            disabled={selectedRole === user.role}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Speichern
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelEditing}>
                            <X className="h-4 w-4 mr-1" />
                            Abbrechen
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => startEditing(user.id, user.role)}>
                          <PencilLine className="h-4 w-4 mr-1" />
                          Bearbeiten
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Administratoren haben vollen Zugriff auf alle Systeme, während Moderatoren eingeschränkte Rechte haben.
        </p>
      </CardFooter>
      
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-500" />
              Rollenänderung bestätigen
            </DialogTitle>
            <DialogDescription>
              Möchtest du die Rolle dieses Benutzers wirklich ändern?
            </DialogDescription>
          </DialogHeader>
          
          {userToUpdate && (
            <div className="py-4">
              <p className="mb-4">Die Rolle wird geändert in: <span className="font-medium">{getRoleLabel(userToUpdate.role)}</span></p>
              
              {userToUpdate.role === 'admin' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm mb-4">
                  <p className="font-semibold">Achtung:</p>
                  <p>Administratoren haben vollen Zugriff auf alle Funktionen und Daten.</p>
                </div>
              )}
              
              {userToUpdate.role === 'member' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
                  <p>Der Benutzer wird auf eine reguläre Mitgliedschaft zurückgestuft und verliert alle administrativen Rechte.</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} disabled={isProcessing}>
              Abbrechen
            </Button>
            <Button onClick={updateUserRole} disabled={isProcessing}>
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Rolle ändern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserRoleManager;
