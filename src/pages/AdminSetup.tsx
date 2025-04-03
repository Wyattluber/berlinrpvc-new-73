
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { createAdminAccount, checkAdminAccount } from '@/utils/adminUtils';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AdminSetup = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Hardcoded admin credentials as requested
  const adminEmail = "info@berlinrpvc.de";
  const adminPassword = "GrueneSau1.6";

  useEffect(() => {
    // Check if the admin account already exists
    const checkExistingAccount = async () => {
      try {
        const { exists } = await checkAdminAccount(adminEmail);
        if (exists) {
          setIsSuccess(true);
          toast({
            title: "Admin-Konto existiert bereits",
            description: "Das Admin-Konto ist bereits eingerichtet.",
          });
        }
      } catch (err) {
        console.error("Error checking admin account:", err);
      }
    };
    
    checkExistingAccount();
  }, []);

  const handleCreateAdmin = async () => {
    setIsCreating(true);
    setError(null);
    
    try {
      await createAdminAccount(adminEmail, adminPassword);
      setIsSuccess(true);
      toast({
        title: "Admin-Konto erstellt",
        description: "Das Admin-Konto wurde erfolgreich eingerichtet!",
      });
    } catch (err: any) {
      setError(err.message || "Fehler bei der Erstellung des Admin-Kontos");
      toast({
        title: "Fehler",
        description: err.message || "Fehler bei der Erstellung des Admin-Kontos",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin-Konto Einrichtung</CardTitle>
          <CardDescription>
            Erstelle das Hauptadmin-Konto für BerlinRPVC.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fehler</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isSuccess ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Admin-Konto eingerichtet</AlertTitle>
              <AlertDescription className="text-green-700">
                Das Admin-Konto mit der E-Mail {adminEmail} wurde erfolgreich erstellt.
                Du kannst dich jetzt mit diesen Zugangsdaten einloggen.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-semibold">Admin E-Mail:</p>
                <p className="mt-1 p-2 border rounded-md bg-gray-50">{adminEmail}</p>
              </div>
              <div>
                <p className="font-semibold">Admin Passwort:</p>
                <p className="mt-1 p-2 border rounded-md bg-gray-50">••••••••••••</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {isSuccess ? (
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700" 
              onClick={() => navigate('/login')}
            >
              Zur Anmeldeseite
            </Button>
          ) : (
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700" 
              onClick={handleCreateAdmin}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird eingerichtet...
                </>
              ) : (
                "Admin-Konto erstellen"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminSetup;
