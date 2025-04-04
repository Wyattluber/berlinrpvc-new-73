import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '@/App';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { addAdmin, addModerator, removeUserRole } from '@/lib/admin';
import { AlertCircle, CheckCircle, ShieldCheck, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AdminPanel = () => {
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const session = useContext(SessionContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    if (!session) {
      navigate('/login');
      toast({
        title: "Zugriff verweigert",
        description: "Du musst angemeldet sein, um auf diese Seite zuzugreifen.",
        variant: "destructive"
      });
      return;
    }

    // For simplicity, we'll assume admin users have a specific email pattern
    // In a real app, you would check against roles in the database
    const userEmail = session.user?.email || '';
    const isAdminUser = userEmail.includes('admin') || userEmail.endsWith('@berlinrp.de');
    setIsAdmin(isAdminUser);

    if (!isAdminUser) {
      navigate('/profile');
      toast({
        title: "Zugriff verweigert",
        description: "Du benötigst Admin-Rechte, um auf diese Seite zuzugreifen.",
        variant: "destructive"
      });
    }
  }, [session, navigate]);

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

  if (!isAdmin) {
    return null; // Don't render anything if not admin
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
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
                  <ShieldCheck size={16} />
                  Als Admin hinzufügen
                </Button>
                
                <Button
                  onClick={handleAddModerator}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <Shield size={16} />
                  Als Moderator hinzufügen
                </Button>
                
                <Button
                  onClick={handleRemoveRole}
                  disabled={isLoading}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Rolle entfernen
                </Button>
              </div>
              
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-medium mb-2">Anleitung</h3>
                <ol className="space-y-2 text-sm text-gray-600 list-decimal pl-5">
                  <li>Um einen Benutzer zum Admin zu machen, füge die Benutzer-ID in das Feld ein und klicke auf "Als Admin hinzufügen".</li>
                  <li>Um einen Benutzer zum Moderator zu machen, füge die Benutzer-ID in das Feld ein und klicke auf "Als Moderator hinzufügen".</li>
                  <li>Um eine Rolle zu entfernen, füge die Benutzer-ID in das Feld ein und klicke auf "Rolle entfernen".</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminPanel;
