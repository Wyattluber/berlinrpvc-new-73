
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoginLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Erfolgreich angemeldet",
        description: "Du wirst weitergeleitet...",
      });

      navigate('/profile');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: error.message || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSignupLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Registrierung erfolgreich",
        description: "Bitte überprüfe deine E-Mail für die Bestätigung.",
      });

      setActiveTab('login');
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
      toast({
        title: "Registrierung fehlgeschlagen",
        description: error.message || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
        variant: "destructive",
      });
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Willkommen zurück</CardTitle>
              <CardDescription className="text-center">
                Melde dich an oder registriere dich
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Anmelden</TabsTrigger>
                  <TabsTrigger value="signup">Registrieren</TabsTrigger>
                </TabsList>
                
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Fehler</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <TabsContent value="login">
                  <form onSubmit={handleLoginSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email-login">
                        E-Mail
                      </label>
                      <Input
                        id="email-login"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="beispiel@provider.de"
                        autoComplete="email"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password-login">
                        Passwort
                      </label>
                      <Input
                        id="password-login"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Dein Passwort"
                        autoComplete="current-password"
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={loginLoading}>
                      {loginLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Wird angemeldet...
                        </>
                      ) : (
                        "Anmelden"
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignupSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email-signup">
                        E-Mail
                      </label>
                      <Input
                        id="email-signup"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="beispiel@provider.de"
                        autoComplete="email"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password-signup">
                        Passwort
                      </label>
                      <Input
                        id="password-signup"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Sicheres Passwort erstellen"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={signupLoading}>
                      {signupLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Wird registriert...
                        </>
                      ) : (
                        "Registrieren"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex flex-col">
              <p className="mt-2 text-xs text-center text-gray-500">
                Durch die Anmeldung akzeptierst du unsere Nutzungsbedingungen.
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
