
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Mail, KeyRound, AlertTriangle, ExternalLink, User, UserPlus, Eye, EyeOff, CheckCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from '@/components/ui/checkbox';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'login-register' | 'reset-password'>('login-register');
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showDetailedError, setShowDetailedError] = useState(false);
  
  // Registration state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [discordId, setDiscordId] = useState('');
  const [skipDiscordId, setSkipDiscordId] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Password Reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  
  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    hasLetter: false,
    hasNumber: false
  });
  
  // Update password validation in real-time
  useEffect(() => {
    setPasswordValidation({
      length: registerPassword.length >= 8,
      hasLetter: /[a-zA-Z]/.test(registerPassword),
      hasNumber: /[0-9]/.test(registerPassword)
    });
  }, [registerPassword]);
  
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
      toast({
        title: "Discord Login deaktiviert",
        description: "Die Anmeldung mit Discord ist derzeit nicht verfügbar.",
        variant: "default"
      });
    } catch (error: any) {
      console.error("Discord login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setLoginError(null);
      
      const { error, data } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) throw error;

      // Check if user is admin
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      toast({
        title: "Erfolgreich angemeldet",
        description: adminData ? "Du wurdest als Administrator angemeldet." : "Willkommen zurück!",
      });
      
      // Redirect admin users directly to admin panel
      if (adminData) {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
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

  const validatePassword = () => {
    const isValid = 
      registerPassword.length >= 8 && 
      /[a-zA-Z]/.test(registerPassword) && 
      /[0-9]/.test(registerPassword);
      
    return isValid;
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationSuccess(false);
    
    try {
      // Validation
      if (registerPassword !== confirmPassword) {
        setRegisterError("Passwörter stimmen nicht überein");
        return;
      }
      
      if (!validatePassword()) {
        setRegisterError("Das Passwort muss mindestens 8 Zeichen lang sein und mindestens einen Buchstaben und eine Ziffer enthalten");
        return;
      }
      
      setIsLoading(true);
      setRegisterError(null);
      
      // Create user with email and password
      const userData = {
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            username: username,
            discord_id: skipDiscordId ? null : discordId
          },
          emailRedirectTo: `${window.location.origin}/profile`
        }
      };

      const { data, error } = await supabase.auth.signUp(userData);
      
      if (error) throw error;

      // Show success message with checkmark
      setRegistrationSuccess(true);
      
      // Clear form 
      setRegisterEmail('');
      setRegisterPassword('');
      setConfirmPassword('');
      setUsername('');
      setDiscordId('');
      setSkipDiscordId(false);
      
      toast({
        title: "Registrierung erfolgreich",
        description: "Dein Account wurde erfolgreich erstellt. Bitte bestätige deine E-Mail Adresse.",
        variant: "success"
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      
      if (error.message.includes('weak_password')) {
        setRegisterError("Das Passwort muss mindestens 8 Zeichen lang sein und mindestens einen Buchstaben und eine Ziffer enthalten");
      } else {
        setRegisterError(error.message || "Es gab ein Problem bei der Registrierung.");
      }
      
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
        variant: "default"
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
                    <TabsTrigger id="login-tab" value="login" className="flex items-center gap-1">
                      <User size={16} />
                      <span>Login</span>
                    </TabsTrigger>
                    <TabsTrigger value="register" className="flex items-center gap-1">
                      <UserPlus size={16} />
                      <span>Registrieren</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Login Tab */}
                  <TabsContent value="login" className="space-y-4">
                    <div className="grid gap-4">
                      <Button
                        variant="outline"
                        className="flex items-center gap-3 h-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 opacity-60 cursor-not-allowed"
                        onClick={handleDiscordLogin}
                        disabled={true}
                      >
                        <div className="relative">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M15.8 8.5a6 4.3 0 0 0 -7.6 0M14 11a1 1 0 1 0 2 0a1 1 0 0 0 -2 0M8 11a1 1 0 1 0 2 0a1 1 0 0 0 -2 0M12 14h.01"></path>
                            <path d="M8.5 16.5a8 5.3 0 0 0 7 0"></path>
                          </svg>
                          <AlertTriangle size={12} className="absolute -top-1 -right-1 text-amber-500" />
                        </div>
                        Mit Discord anmelden (Deaktiviert)
                      </Button>
                    
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Oder</span>
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-300"></span>
                        </div>
                      </div>
                    
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
                  </TabsContent>
                  
                  {/* Register Tab */}
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
                          Dein Account wurde erfolgreich erstellt. Bitte überprüfe deine E-Mails und bestätige deine E-Mail-Adresse, um deine Registrierung abzuschließen.
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
                        <Label htmlFor="discord-id">Discord ID</Label>
                        <div className="relative">
                          <Input 
                            id="discord-id"
                            type="text" 
                            placeholder="Deine Discord ID (z.B. 123456789012345678)"
                            value={discordId}
                            onChange={(e) => setDiscordId(e.target.value)}
                            disabled={skipDiscordId}
                          />
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Checkbox 
                            id="skip-discord" 
                            checked={skipDiscordId}
                            onCheckedChange={(checked) => {
                              if (checked === true) {
                                setDiscordId('');
                              }
                              setSkipDiscordId(checked === true);
                            }} 
                          />
                          <label
                            htmlFor="skip-discord"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Discord ID später hinzufügen
                          </label>
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
                        
                        {/* Password requirements indicator */}
                        <div className="text-xs space-y-1 mt-2">
                          <p className="font-semibold text-gray-600">Passwort muss:</p>
                          <div className="flex items-center gap-1">
                            <div className={`w-3 h-3 rounded-full ${passwordValidation.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className={passwordValidation.length ? 'text-green-600' : 'text-gray-500'}>Mindestens 8 Zeichen lang sein</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className={`w-3 h-3 rounded-full ${passwordValidation.hasLetter ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className={passwordValidation.hasLetter ? 'text-green-600' : 'text-gray-500'}>Mindestens einen Buchstaben enthalten</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className={`w-3 h-3 rounded-full ${passwordValidation.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className={passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}>Mindestens eine Ziffer enthalten</span>
                          </div>
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
                        
                        {/* Password match indicator */}
                        {confirmPassword && (
                          <div className="flex items-center gap-1 mt-1 text-xs">
                            <div className={`w-2 h-2 rounded-full ${confirmPassword === registerPassword ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className={confirmPassword === registerPassword ? 'text-green-600' : 'text-red-500'}>
                              {confirmPassword === registerPassword ? 'Passwörter stimmen überein' : 'Passwörter stimmen nicht überein'}
                            </span>
                          </div>
                        )}
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
              // Password Reset Form
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
                      <div className="flex items-center gap-2">
                        <RotateCcw size={16} />
                        <span>Passwort zurücksetzen</span>
                      </div>
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
