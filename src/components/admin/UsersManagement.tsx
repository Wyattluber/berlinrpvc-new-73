
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info, PencilLine, Trash2, Check, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UserRoleManager from '@/components/UserRoleManager';

interface UsersManagementProps {
  adminUsers: any[];
  handleUpdateRole: (userId: string, role: string) => void;
  handleDeleteUser: (userId: string) => void;
}

const UsersManagement: React.FC<UsersManagementProps> = ({ 
  adminUsers, 
  handleUpdateRole, 
  handleDeleteUser 
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Benutzerverwaltung</h2>
      
      <UserRoleManager />
      
      <Card>
        <CardHeader>
          <CardTitle>Administratoren & Moderatoren</CardTitle>
          <CardDescription>
            Verwalte Benutzer mit administrativen Berechtigungen
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden">
          {adminUsers.length === 0 ? (
            <div className="p-4 text-center border rounded-md bg-muted/50">
              <Info className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Keine Admin-Benutzer gefunden.</p>
              <p className="text-xs mt-1 text-muted-foreground">Admin-Benutzer müssen direkt in der Datenbank hinzugefügt werden.</p>
            </div>
          ) : (
            <>
              {/* Desktop view */}
              <div className="hidden md:block overflow-x-auto">
                <div className="min-w-[700px]">
                  <div className="grid grid-cols-4 gap-4 mb-2 px-3 py-2 bg-muted/30 rounded font-medium text-sm">
                    <div>Benutzer</div>
                    <div>Login E-Mail</div>
                    <div>Rolle</div>
                    <div className="text-right">Aktionen</div>
                  </div>
                  
                  {adminUsers.map((user) => (
                    <div key={user.id} className="grid grid-cols-4 gap-4 items-center p-3 border rounded hover:bg-gray-50 mb-2">
                      <div className="text-sm font-medium truncate">{user.username || user.email || "Unbekannter Benutzer"}</div>
                      
                      <div className="text-sm truncate">{user.email || "Keine E-Mail"}</div>
                      
                      <div>
                        {editingUser === user.id ? (
                          <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="w-[180px] h-8">
                              <SelectValue placeholder="Rolle auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Administrator</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="member">Mitglied</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className={`text-sm px-2 py-1 rounded-full ${getRoleBadgeClass(user.role)}`}>
                            {getRoleLabel(user.role)}
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
              </div>
              
              {/* Mobile view */}
              <div className="md:hidden space-y-4">
                {adminUsers.map((user) => (
                  <Card key={user.id} className="mb-3">
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">{user.username || user.email || "Unbekannter Benutzer"}</CardTitle>
                      <CardDescription>{user.email || "Keine E-Mail"}</CardDescription>
                    </CardHeader>
                    <CardContent className="py-2">
                      {editingUser === user.id ? (
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Rolle auswählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="member">Mitglied</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span>Rolle:</span>
                          <span className={`text-sm px-2 py-1 rounded-full ${getRoleBadgeClass(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 py-3">
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
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
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

export default UsersManagement;
