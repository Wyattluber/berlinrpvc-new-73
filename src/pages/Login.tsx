
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session, resetAuth } = useAuth();
  const navigate = useNavigate();
  
  // If user is already logged in, redirect to profile
  useEffect(() => {
    if (session) {
      navigate('/profile');
    }
  }, [session, navigate]);

  const handleDiscordLogin = async () => {
    try {
      setLoginLoading(true);
      setError(null);
      
      // Proactively clear auth state before login
      localStorage.removeItem('supabase.auth.token');
      
      // Get the current domain for the redirect URL
      const origin = window.location.origin;
      const redirectUrl = `${origin}/profile`;
      
      console.log("Using redirect URL:", redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            // Request additional Discord permissions to access user data
            scope: 'identify email',
          }
        }
      });

      if (error) throw error;
      
      // We don't need to navigate here as OAuth will redirect the user
    } catch (error: any) {
      console.error('Discord login error:', error);
      setError(error.message || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
      toast({
        title: "Discord Login fehlgeschlagen",
        description: error.message || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
        variant: "destructive",
      });
      setLoginLoading(false);
    }
  };
  
  // Handle manual auth reset if needed
  const handleReset = async () => {
    await resetAuth();
    window.location.reload();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white mt-16">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-blue-100">
            <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-center text-blue-900">Willkommen zurück</CardTitle>
              <CardDescription className="text-center text-blue-700">
                Melde dich mit Discord an
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              {error && (
                <Alert variant="destructive" className="my-4 bg-red-50 text-red-800 border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="font-medium">Fehler</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 mb-4"
                onClick={handleDiscordLogin}
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird angemeldet...
                  </>
                ) : (
                  <>
                    <img src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" 
                      alt="Discord Logo" 
                      className="w-5 h-4 mr-2" 
                    />
                    Mit Discord anmelden
                  </>
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-600 mt-4">
                Die Anmeldung funktioniert für bestehende Benutzer und neue Benutzer gleichermaßen.
              </div>
              
              <div className="text-center mt-4">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="text-xs text-gray-500"
                >
                  Auth zurücksetzen
                </Button>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col bg-gradient-to-r from-blue-50 to-indigo-50 rounded-b-lg">
              <p className="mt-2 text-xs text-center text-gray-600">
                Durch die Anmeldung akzeptierst du unsere <a href="/datenschutz" className="text-blue-600 hover:underline">Datenschutzbedingungen</a>.
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
