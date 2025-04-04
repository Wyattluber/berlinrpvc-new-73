import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Lock, Loader2, Github } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setErrorMessage(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Email login error:", error);
        let errorMsg = "Login fehlgeschlagen";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMsg = "Ungültige Anmeldedaten. Bitte überprüfe deine E-Mail und dein Passwort.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMsg = "Deine E-Mail-Adresse wurde noch nicht bestätigt. Bitte überprüfe dein E-Mail-Postfach.";
        }
        
        setErrorMessage(errorMsg);
        throw error;
      }
      
      if (data?.user) {
        toast({
          title: "Anmeldung erfolgreich",
          description: "Du wurdest erfolgreich angemeldet.",
        });
        
        navigate('/profile');
      }
    } catch (error) {
      console.error("Email login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    try {
      setLoading(true);
      setErrorMessage(null);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin + '/profile',
        },
      });
      
      if (error) {
        console.error(`OAuth login error with ${provider}:`, error);
        setErrorMessage(`Anmeldung mit ${provider} fehlgeschlagen: ${error.message}`);
        throw error;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error(`OAuth login error with ${provider}:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Anmelden</CardTitle>
          <CardDescription>Gib deine E-Mail und dein Passwort ein, um dich anzumelden</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertTitle>Fehler</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              placeholder="me@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button onClick={handleEmailLogin} disabled={loading} className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bitte warten...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Mit E-Mail anmelden
              </>
            )}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Oder
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={() => handleOAuthLogin('github')} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bitte warten...
              </>
            ) : (
              <>
                <Github className="mr-2 h-4 w-4" />
                Mit GitHub anmelden
              </>
            )}
          </Button>
          {/* Removed Google login button since the icon is not available */}
        </CardContent>
        <div className="px-6 py-4 text-sm text-muted-foreground">
          <Link to="/forgot-password" className="hover:text-blue-500">Passwort vergessen?</Link>
        </div>
      </Card>
      <div className="mt-6 text-sm text-muted-foreground">
        Noch kein Konto? <Link to="/register" className="text-blue-500 hover:underline">Registrieren</Link>
      </div>
    </div>
  );
};

export default Login;
