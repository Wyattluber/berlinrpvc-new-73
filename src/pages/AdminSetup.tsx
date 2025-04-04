
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { createAdminAccount, checkAdminAccount, makeUserAdmin } from '@/utils/adminUtils';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';

const AdminSetup = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Updated admin credentials as requested
  const adminEmail = "info@berlinrpvc.de";
  const adminPassword = "Wasserwoo123";

  useEffect(() => {
    // Check if the admin account already exists
    const checkExistingAccount = async () => {
      try {
        // Check if user with this email exists in admin_users table
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', adminEmail)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          console.log("Admin account exists:", data);
          setIsSuccess(true);
          toast({
            title: "Admin-Konto existiert bereits",
            description: "Das Admin-Konto ist bereits eingerichtet.",
          });
        } else {
          console.log("Admin account does not exist yet");
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
      console.log("Creating admin account with email:", adminEmail);
      
      // First check if a user with this email already exists (but not as admin)
      const { data: { user } } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      }).catch(() => ({ data: { user: null } }));

      if (user) {
        console.log("User exists but may not be an admin, making them admin:", user.id);
        // Make existing user an admin
        await makeUserAdmin(user.id, adminEmail);
        setIsSuccess(true);
        toast({
          title: "Admin-Konto aktualisiert",
          description: "Das Benutzerkonto wurde zum Admin-Konto hochgestuft.",
        });
      } else {
        // Check if a user with this email already exists in admin_users
        const { data: existingAdmins } = await supabase
          .from('admin_users')
          .select('email')
          .eq('email', adminEmail);
        
        if (existingAdmins && existingAdmins.length > 0) {
          console.log("Admin user already exists, signing in instead");
          
          // Try to sign in with the credentials
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: adminEmail,
            password: adminPassword
          });
          
          if (signInError) throw signInError;
          
          setIsSuccess(true);
          toast({
            title: "Admin-Konto existiert bereits",
            description: "Erfolgreich als Administrator angemeldet!",
            variant: "default"
          });
        } else {
          // Create a new admin account
          const result = await createAdminAccount(adminEmail, adminPassword);
          console.log("Admin account creation result:", result);
          
          setIsSuccess(true);
          toast({
            title: "Admin-Konto erstellt",
            description: "Das Admin-Konto wurde erfolgreich eingerichtet!",
            variant: "default"
          });
        }
      }
    } catch (err: any) {
      console.error("Error handling admin account:", err);
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
      <Card className="w-full max-w-md shadow-lg">
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
                Das Admin-Konto mit der E-Mail {adminEmail} wurde erfolgreich eingerichtet.
                Du kannst dich jetzt mit diesen Zugangsdaten im Login-Bereich einloggen.
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
