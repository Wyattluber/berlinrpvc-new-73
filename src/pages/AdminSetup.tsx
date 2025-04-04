
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { grantAdminPrivileges } from '@/lib/admin';

const AdminSetup = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fixed admin credentials 
  const adminEmail = "info@berlinrpvc.de";
  const specificUserId = "3ea1fee3-d6fa-4004-8a79-a41551f0b846";

  useEffect(() => {
    // Check if admin account already exists
    const checkExistingAccount = async () => {
      try {
        // Check if user with this ID exists in admin_users table
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', specificUserId)
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
      console.log("Setting specific user as admin with ID:", specificUserId);
      
      const result = await grantAdminPrivileges(specificUserId, adminEmail);
      console.log("Admin account setup result:", result);
      
      if (!result.success) {
        throw new Error(result.message || "Failed to set up admin account");
      }
      
      setIsSuccess(true);
      toast({
        title: "Admin-Konto eingerichtet",
        description: result.message || "Das Admin-Konto wurde erfolgreich eingerichtet!",
        variant: "default"
      });
      
      // Force refresh authentication status
      await supabase.auth.refreshSession();
      
      // Redirect to admin panel automatically after success
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err: any) {
      console.error("Error setting up admin account:", err);
      setError(err.message || "Fehler bei der Einrichtung des Admin-Kontos");
      toast({
        title: "Fehler",
        description: err.message || "Fehler bei der Einrichtung des Admin-Kontos",
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
                Das Admin-Konto mit der ID {specificUserId} wurde erfolgreich eingerichtet.
                Du kannst jetzt den Admin-Bereich nutzen.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-semibold">Admin E-Mail:</p>
                <p className="mt-1 p-2 border rounded-md bg-gray-50">{adminEmail}</p>
              </div>
              <div>
                <p className="font-semibold">Admin User ID:</p>
                <p className="mt-1 p-2 border rounded-md bg-gray-50 text-xs break-all">{specificUserId}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {isSuccess ? (
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700" 
              onClick={() => navigate('/admin')}
            >
              Zur Admin-Seite
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
