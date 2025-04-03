
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Mail, KeyRound, AlertTriangle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showDetailedError, setShowDetailedError] = useState(false);
  
  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/profile');
      }
    };
    
    // Check for error in URL parameters (from OAuth redirects)
    const url = new URL(window.location.href);
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    
    if (error) {
      const errorMsg = `Authentication error: ${errorDescription || error}`;
      setLoginError(errorMsg);
      console.error("OAuth error:", error, errorDescription);

      // Show more detailed error message for specific errors
      if (error.includes('discord') || errorDescription?.includes('discord')) {
        setShowDetailedError(true);
      }
    }
    
    checkSession();
  }, [navigate]);
  
  const handleDiscordLogin = async () => {
    try {
      setIsLoading(true);
      setLoginError(null);
      
      const redirectUrl = `${window.location.origin}/profile`;
      console.log("Redirect URL for Discord OAuth:", redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: redirectUrl,
          scopes: 'identify email'
        }
      });
      
      if (error) throw error;

    } catch (error: any) {
      console.error("Discord login error:", error);
      setLoginError(error.message || "Es gab ein Problem bei der Anmeldung mit Discord.");
      setShowDetailedError(true);
      
      toast({
        title: "Anmeldefehler",
        description: error.message || "Es gab ein Problem bei der Anmeldung mit Discord.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setLoginError(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) throw error;

      toast({
        title: "Erfolgreich angemeldet",
        description: "Willkommen zurück!",
      });
      
      navigate('/profile');
    } catch (error: any) {
      console.error("Email login error:", error);
      setLoginError(error.message || "E-Mail oder Passwort ist ungültig.");
      
      toast({
        title: "Anmeldefehler",
        description: error.message || "E-Mail oder Passwort ist ungültig.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setLoginError(null);
      
      // For now, we only support Discord login
      toast({
        title: "Hinweis",
        description: "Die Registrierung ist aktuell nur über Discord möglich.",
        variant: "default"
      });
      
      // Trigger Discord login
      await handleDiscordLogin();
      
    } catch (error: any) {
      console.error("Registration error:", error);
      setLoginError(error.message || "Es gab ein Problem bei der Registrierung.");
      
      toast({
        title: "Registrierungsfehler",
        description: error.message || "Es gab ein Problem bei der Registrierung.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-12 bg-gradient-to-b from-gray-50 to-white">
        <Card className="w-full max-w-md shadow-lg border-t-4 border-t-blue-600 animate-fade-in">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Zugang</CardTitle>
            <CardDescription>
              Melde dich mit deinem Discord-Account an
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {loginError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Anmeldeproblem</AlertTitle>
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-blue-700 text-sm mb-2">
              <p className="font-medium mb-1">Hinweis zur Discord-Anmeldung:</p>
              <p>Stelle sicher, dass in Supabase die richtigen URL-Konfigurationen eingestellt sind:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Site URL: {window.location.origin}</li>
                <li>Redirect URL: {window.location.origin}/profile</li>
              </ul>
            </div>

            {showDetailedError && (
              <Alert className="bg-amber-50 border-amber-200 text-amber-800 mb-4">
                <AlertTitle className="text-amber-800">Fehlerbehebung für Discord-Anmeldung:</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>1. Überprüfe in Supabase unter <strong>Authentication &gt; URL Configuration</strong>:</p>
                  <ul className="list-disc pl-5">
                    <li>Site URL: <code>{window.location.origin}</code></li>
                    <li>Redirect URLs: <code>{window.location.origin}/profile</code></li>
                  </ul>
                  
                  <p>2. Überprüfe in Supabase unter <strong>Authentication &gt; Providers &gt; Discord</strong>:</p>
                  <ul className="list-disc pl-5">
                    <li>Client ID und Client Secret korrekt eingetragen</li>
                    <li>"identify" und "email" Scopes aktiviert</li>
                  </ul>
                  
                  <p>3. Im Discord Developer Portal überprüfe:</p>
                  <ul className="list-disc pl-5">
                    <li>Redirect URL: <code>https://aaqhxeiesnphwhazvkck.supabase.co/auth/v1/callback</code></li>
                    <li>Scopes: identify, email</li>
                  </ul>
                  
                  <p>4. Bestätige, dass deine App im Discord Developer Portal aktiviert ist.</p>
                </AlertDescription>
              </Alert>
            )}

            <Button
              variant="outline"
              className="flex items-center gap-3 h-12"
              onClick={handleDiscordLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M15.8 8.5a6 4.3 0 0 0 -7.6 0M14 11a1 1 0 1 0 2 0a1 1 0 0 0 -2 0M8 11a1 1 0 1 0 2 0a1 1 0 0 0 -2 0M12 14h.01"></path>
                  <path d="M8.5 16.5a8 5.3 0 0 0 7 0"></path>
                </svg>
              )}
              Mit Discord anmelden
            </Button>

            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Oder</span>
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300"></span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-center text-sm text-gray-500">
                Die direkte Anmeldung ist aktuell nur für Administratoren verfügbar.
                <br />
                Bitte verwende Discord zur Anmeldung.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              Du musst angemeldet sein, um eine Bewerbung einzureichen
            </p>
          </CardFooter>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
