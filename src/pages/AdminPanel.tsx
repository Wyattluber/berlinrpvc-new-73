import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUserId, setEditUserId] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [open, setOpen] = React.useState(false)

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Use the profiles table or admin_users table instead of auth.users
      const { data, error } = await supabase
        .from('admin_users')
        .select('*');

      if (error) {
        throw error;
      }

      setUsers(data || []);
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
    setEditUsername(user.username);
    setEditEmail(user.email);
    setOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ username: editUsername, email: editEmail })
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

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Admin Panel</h1>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <Table>
          <TableCaption>A list of your registered users.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <Edit className="h-4 w-4 mr-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(user)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(user.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Edit User</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input id="username" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
