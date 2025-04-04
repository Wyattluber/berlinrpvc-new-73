
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Mail, KeyRound, AlertTriangle, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'login-register' | 'reset-password'>('login-register');
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Register state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Reset password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

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

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationSuccess(false);
    
    try {
      if (registerPassword !== confirmPassword) {
        setRegisterError("Passwörter stimmen nicht überein");
        return;
      }
      
      if (registerPassword.length < 8 || 
          !/[a-zA-Z]/.test(registerPassword) || 
          !/[0-9]/.test(registerPassword)) {
        setRegisterError("Das Passwort muss mindestens 8 Zeichen lang sein und mindestens einen Buchstaben und eine Ziffer enthalten");
        return;
      }
      
      setIsLoading(true);
      setRegisterError(null);
      
      const { error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            username: username
          },
          emailRedirectTo: `${window.location.origin}/profile`
        }
      });
      
      if (error) throw error;

      setRegistrationSuccess(true);
      
      setRegisterEmail('');
      setRegisterPassword('');
      setConfirmPassword('');
      setUsername('');
      
      toast({
        title: "Registrierung erfolgreich",
        description: "Dein Account wurde erfolgreich erstellt. Bitte bestätige deine E-Mail Adresse.",
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      setRegisterError(error.message || "Es gab ein Problem bei der Registrierung.");
      
      toast({
        title: "Registrierungsfehler",
        description: error.message || "Es gab ein Problem bei der Registrierung.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setResetError(null);
      setResetSuccess(false);
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/profile?reset_password=true`,
      });
      
      if (error) throw error;
      
      setResetSuccess(true);
      
      toast({
        title: "E-Mail gesendet",
        description: "Eine E-Mail zum Zurücksetzen deines Passworts wurde gesendet.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      setResetError(error.message || "Es gab ein Problem beim Zurücksetzen des Passworts.");
      
      toast({
        title: "Fehler",
        description: error.message || "Es gab ein Problem beim Zurücksetzen des Passworts.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-12 bg-gradient-to-b from-indigo-50 to-purple-50">
        <Card className="w-full max-w-md shadow-lg border-t-4 border-t-indigo-600 animate-fade-in">
          <CardHeader className="space-y-1 text-center">
            {activeView === 'login-register' ? (
              <>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Zugang</CardTitle>
                <CardDescription className="text-gray-500">
                  Melde dich an oder erstelle einen Account
                </CardDescription>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center">
                  <Button 
                    variant="ghost" 
                    className="absolute left-4 top-4" 
                    onClick={() => setActiveView('login-register')}
                  >
                    <ArrowLeft size={16} className="mr-1" /> Zurück
                  </Button>
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Passwort zurücksetzen
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Gib deine E-Mail Adresse ein, um ein neues Passwort zu setzen
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            {activeView === 'login-register' ? (
              <>
                {loginError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Anmeldeproblem</AlertTitle>
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
                
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="login" className="flex items-center gap-1">
                      <span>Login</span>
                    </TabsTrigger>
                    <TabsTrigger value="register" className="flex items-center gap-1">
                      <span>Registrieren</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">E-Mail</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="email"
                            type="email" 
                            placeholder="deine@email.de"
                            className="pl-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="password">Passwort</Label>
                          <Button 
                            type="button" 
                            variant="link" 
                            className="h-auto p-0 text-xs text-blue-600"
                            onClick={() => setActiveView('reset-password')}
                          >
                            Passwort vergessen?
                          </Button>
                        </div>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-0 top-0 h-10 w-10 text-gray-400 hover:text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                          'Anmelden'
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register" className="space-y-4">
                    {registerError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Registrierungsproblem</AlertTitle>
                        <AlertDescription>{registerError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {registrationSuccess && (
                      <Alert className="mb-4 bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Registrierung erfolgreich!</AlertTitle>
                        <AlertDescription className="text-green-700">
                          Dein Account wurde erfolgreich erstellt. Bitte überprüfe deine E-Mails und bestätige deine E-Mail-Adresse.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <form onSubmit={handleRegistration} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Benutzername</Label>
                        <Input 
                          id="username"
                          type="text" 
                          placeholder="Dein Benutzername"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-email">E-Mail</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="register-email"
                            type="email" 
                            placeholder="deine@email.de"
                            className="pl-10"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Passwort</Label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="register-password"
                            type={showRegisterPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            required
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-0 top-0 h-10 w-10 text-gray-400 hover:text-gray-500"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          >
                            {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-0 top-0 h-10 w-10 text-gray-400 hover:text-gray-500"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        disabled={isLoading}
                      >
                        {isLoading ? 
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : 
                          'Registrieren'
                        }
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="space-y-4">
                {resetError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Fehler</AlertTitle>
                    <AlertDescription>{resetError}</AlertDescription>
                  </Alert>
                )}
                
                {resetSuccess && (
                  <Alert className="mb-4 bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">E-Mail gesendet!</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Eine E-Mail mit Anweisungen zum Zurücksetzen deines Passworts wurde an deine E-Mail-Adresse gesendet.
                    </AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">E-Mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        id="reset-email"
                        type="email" 
                        placeholder="deine@email.de"
                        className="pl-10"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      'Passwort zurücksetzen'
                    )}
                  </Button>
                </form>
              </div>
            )}
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
