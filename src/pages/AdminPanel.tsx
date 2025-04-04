
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '@/App';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { addAdmin, addModerator, removeUserRole, checkIsAdmin } from '@/lib/admin';
import { AlertCircle, CheckCircle, ShieldCheck, Shield, Loader2, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';

const AdminPanel = () => {
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAdminCheck, setLoadingAdminCheck] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const session = useContext(SessionContext);
  const navigate = useNavigate();

  // Load admin status and admin users list
  useEffect(() => {
    let isMounted = true;
    
    const checkAdminStatus = async () => {
      setLoadingAdminCheck(true);
      
      try {
        // Check if user is logged in
        if (!session?.user) {
          navigate('/login');
          toast({
            title: "Zugriff verweigert",
            description: "Du musst angemeldet sein, um auf diese Seite zuzugreifen.",
            variant: "destructive"
          });
          return;
        }

        // Check if user is an admin with the security definer function
        const adminStatus = await checkIsAdmin();
        
        if (isMounted) {
          setIsAdmin(adminStatus);
          
          if (!adminStatus) {
            navigate('/profile');
            toast({
              title: "Zugriff verweigert",
              description: "Du benötigst Admin-Rechte, um auf diese Seite zuzugreifen.",
              variant: "destructive"
            });
          } else {
            // If user is admin, fetch admin users list
            fetchAdminUsers();
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        if (isMounted) {
          setErrorMessage("Fehler beim Überprüfen des Admin-Status.");
        }
      } finally {
        if (isMounted) {
          setLoadingAdminCheck(false);
        }
      }
    };
    
    checkAdminStatus();
    
    return () => {
      isMounted = false;
    };
  }, [session, navigate]);

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setAdminUsers(data || []);
    } catch (error: any) {
      console.error("Error fetching admin users:", error);
    }
  };

  const handleAddAdmin = async () => {
    if (!userId.trim()) {
      setErrorMessage("Bitte gib eine Benutzer-ID ein.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await addAdmin(userId);
      if (result.success) {
        setSuccessMessage(result.message);
        toast({
          title: "Erfolgreich",
          description: result.message,
        });
        fetchAdminUsers(); // Refresh the admin users list
      } else {
        setErrorMessage(result.message);
        toast({
          title: "Fehler",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Ein unbekannter Fehler ist aufgetreten.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddModerator = async () => {
    if (!userId.trim()) {
      setErrorMessage("Bitte gib eine Benutzer-ID ein.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await addModerator(userId);
      if (result.success) {
        setSuccessMessage(result.message);
        toast({
          title: "Erfolgreich",
          description: result.message,
        });
        fetchAdminUsers(); // Refresh the admin users list
      } else {
        setErrorMessage(result.message);
        toast({
          title: "Fehler",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Ein unbekannter Fehler ist aufgetreten.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRole = async () => {
    if (!userId.trim()) {
      setErrorMessage("Bitte gib eine Benutzer-ID ein.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await removeUserRole(userId);
      if (result.success) {
        setSuccessMessage(result.message);
        toast({
          title: "Erfolgreich",
          description: result.message,
        });
        fetchAdminUsers(); // Refresh the admin users list
      } else {
        setErrorMessage(result.message);
        toast({
          title: "Fehler",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Ein unbekannter Fehler ist aufgetreten.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingAdminCheck) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-4" />
            <p className="text-gray-600">Überprüfe Admin-Rechte...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // User will be redirected in useEffect
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="text-red-500" />
                Admin-Panel
              </CardTitle>
              <CardDescription>
                Hier kannst du Benutzerrollen verwalten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {successMessage && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Erfolg</AlertTitle>
                  <AlertDescription className="text-green-700">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}
              
              {errorMessage && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Fehler</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Benutzer-ID
                </label>
                <Input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Gib die Benutzer-ID ein (z.B. 3ea1fee3-d6fa-4004-8a79-a41551f0b846)"
                />
                <p className="text-xs text-gray-500">
                  Die Benutzer-ID findest du im Profil des Benutzers oder in der Supabase-Konsole.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAddAdmin}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck size={16} />}
                  Als Admin hinzufügen
                </Button>
                
                <Button
                  onClick={handleAddModerator}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield size={16} />}
                  Als Moderator hinzufügen
                </Button>
                
                <Button
                  onClick={handleRemoveRole}
                  disabled={isLoading}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rolle entfernen"}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="text-blue-500" />
                Admin-Benutzer Liste
              </CardTitle>
              <CardDescription>
                Aktuelle Benutzer mit Admin- oder Moderator-Berechtigungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {adminUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Benutzer-ID</TableHead>
                      <TableHead>Rolle</TableHead>
                      <TableHead>Erstellt am</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-sm">{user.user_id}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role === 'admin' ? (
                              <>
                                <ShieldCheck className="mr-1 h-3 w-3" />
                                Admin
                              </>
                            ) : (
                              <>
                                <Shield className="mr-1 h-3 w-3" />
                                Moderator
                              </>
                            )}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleString('de-DE')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>Keine Admin-Benutzer gefunden</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium mb-2">Anleitung</h3>
            <ol className="space-y-2 text-sm text-gray-600 list-decimal pl-5">
              <li>Um einen Benutzer zum Admin zu machen, füge die Benutzer-ID in das Feld ein und klicke auf "Als Admin hinzufügen".</li>
              <li>Um einen Benutzer zum Moderator zu machen, füge die Benutzer-ID in das Feld ein und klicke auf "Als Moderator hinzufügen".</li>
              <li>Um eine Rolle zu entfernen, füge die Benutzer-ID in das Feld ein und klicke auf "Rolle entfernen".</li>
              <li>Admin-Benutzer haben volle Berechtigungen, um alle Daten zu verwalten.</li>
              <li>Moderator-Benutzer haben eingeschränkte Berechtigungen, um bestimmte Daten zu verwalten.</li>
            </ol>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminPanel;
