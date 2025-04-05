import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { LoaderIcon, Search, UserPlus } from 'lucide-react';
import { addAdminUserRole, findUserByEmailOrUsername } from '@/lib/admin/users';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';

const UserRoleManager = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState<'admin' | 'moderator' | 'member'>('moderator');
  const [isAdding, setIsAdding] = useState(false);

  const handleSearch = async () => {
    if (!userQuery) {
      toast({
        title: 'Fehler',
        description: 'Bitte gib eine Benutzer-ID oder einen Benutzernamen ein.',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    try {
      const result = await findUserByEmailOrUsername(userQuery);
      
      if (result.success) {
        setSearchResults(result.data || []);
        if (result.data.length === 0) {
          toast({
            title: 'Information',
            description: 'Keine Benutzer gefunden.',
          });
        }
      } else {
        toast({
          title: 'Fehler',
          description: result.message || 'Fehler bei der Benutzersuche',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error searching for users:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler bei der Benutzersuche.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleAddRole = async () => {
    if (!selectedUserId) {
      toast({
        title: 'Fehler',
        description: 'Bitte wähle einen Benutzer aus.',
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);
    try {
      const result = await addAdminUserRole(selectedUserId, role === 'member' ? 'moderator' : role as 'admin' | 'moderator');
      
      if (result.success) {
        toast({
          title: 'Erfolgreich',
          description: result.message || 'Benutzerrolle erfolgreich zugewiesen',
        });
        setShowDialog(false);
        setUserQuery('');
        setSearchResults([]);
        setSelectedUserId('');
      } else {
        toast({
          title: 'Fehler',
          description: result.message || 'Fehler beim Hinzufügen der Benutzerrolle',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adding user role:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Hinzufügen der Benutzerrolle.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserPlus className="mr-2 h-5 w-5" />
          Benutzerrollen zuweisen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Neue Benutzerrolle zuweisen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Benutzerrolle zuweisen</DialogTitle>
              <DialogDescription>
                Suche nach einer Benutzer-ID oder einem Benutzernamen und weise eine Rolle zu.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Benutzer-ID, Email oder Benutzername"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  size="icon" 
                  onClick={handleSearch} 
                  disabled={isSearching || !userQuery}
                >
                  {isSearching ? (
                    <LoaderIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="border rounded-md max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div 
                      key={user.id} 
                      className={`p-3 hover:bg-gray-100 cursor-pointer ${selectedUserId === user.id ? 'bg-blue-50' : ''}`}
                      onClick={() => handleSelectUser(user.id)}
                    >
                      <p className="font-medium text-sm">{user.username || 'Unbekannter Benutzer'}</p>
                      <p className="text-xs text-gray-500 mt-1">Email: {user.email || 'Keine Email'}</p>
                      <p className="text-xs text-gray-500 mt-1">ID: {user.id}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="space-y-2 mt-4">
                <Label>Rolle</Label>
                <div className="flex space-x-2">
                  <Button 
                    type="button"
                    variant={role === 'member' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setRole('member')}
                  >
                    Mitglied
                  </Button>
                  <Button 
                    type="button"
                    variant={role === 'moderator' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setRole('moderator')}
                  >
                    Moderator
                  </Button>
                  <Button 
                    type="button"
                    variant={role === 'admin' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setRole('admin')}
                  >
                    Administrator
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleAddRole}
                disabled={isAdding || !selectedUserId}
                className="ml-auto"
              >
                {isAdding ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  'Rolle zuweisen'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserRoleManager;
