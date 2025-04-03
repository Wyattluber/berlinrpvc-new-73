import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Mail, KeyRound, AlertTriangle, ExternalLink, User, UserPlus, Shield, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { checkAdminAccount } from '@/utils/adminUtils';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
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
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  // Admin login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  
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
    
    try {
      // Validation
      if (registerPassword !== confirmPassword) {
        setRegisterError("Passwörter stimmen nicht überein");
        return;
      }
      
      if (registerPassword.length < 6) {
        setRegisterError("Das Passwort muss mindestens 6 Zeichen lang sein");
        return;
      }
      
      setIsLoading(true);
      setRegisterError(null);
      
      // Create user with email and password
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            username: username,
          },
          emailRedirectTo: `${window.location.origin}/profile`
        }
      });
      
      if (error) throw error;

      toast({
        title: "Registrierung erfolgreich",
        description: "Dein Account wurde erstellt. Bitte bestätige deine E-Mail Adresse.",
      });
      
      // Switch to login tab after successful registration
      document.getElementById('login-tab')?.click();
      
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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setAdminError(null);
      
      // For debugging
      console.log("Admin login attempt with:", adminEmail);
      
      if (!showOtpInput) {
        // First step: Standard authentication with email/password
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword
        });
        
        if (error) {
          console.error("Admin auth error:", error);
          throw error;
        }
        
        if (!data.user) {
          throw new Error("Authentifizierung fehlgeschlagen");
        }
        
        console.log("User authenticated, checking if admin:", data.user.id);
        
        // Check if user is an admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', data.user.id);
        
        if (adminError) {
          console.error("Admin check error:", adminError);
          throw adminError;
        }
        
        if (!adminData || adminData.length === 0) {
          console.error("Not an admin:", data.user.id);
          throw new Error("Du hast keine Administrator-Berechtigungen");
        }
        
        console.log("Admin verified, showing 2FA input");
        
        // If authentication successful, show OTP input
        setShowOtpInput(true);
        toast({
          title: "Bitte 2FA Code eingeben",
          description: "Ein zweiter Faktor ist für Admin-Logins erforderlich.",
        });
      } else {
        // Second step: Verify OTP
        console.log("Verifying 2FA code:", otpCode);
        
        // For testing, accept any 6-digit code
        // In production, implement real 2FA
        if (otpCode.length === 6) {
          console.log("2FA verified, redirecting to admin");
          
          toast({
            title: "Admin Login erfolgreich",
            description: "Du wurdest als Administrator authentifiziert.",
          });
          
          navigate('/admin');
        } else {
          throw new Error("Ungültiger 2FA Code");
        }
      }
    } catch (error: any) {
      console.error("Admin login error:", error);
      setAdminError(error.message || "Admin-Anmeldung fehlgeschlagen.");
      
      // Reset OTP view if there was an error during the second step
      if (showOtpInput) {
        setShowOtpInput(false);
      }
      
      toast({
        title: "Admin-Anmeldefehler",
        description: error.message || "Admin-Anmeldung fehlgeschlagen.",
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
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Zugang</CardTitle>
            <CardDescription className="text-gray-500">
              Melde dich an oder erstelle einen Account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loginError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Anmeldeproblem</AlertTitle>
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger id="login-tab" value="login" className="flex items-center gap-1">
                  <User size={16} />
                  <span>Login</span>
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-1">
                  <UserPlus size={16} />
                  <span>Registrieren</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-1">
                  <Shield size={16} />
                  <span>Admin</span>
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
                      <Label htmlFor="password">Passwort</Label>
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
                      {isLoading ? 
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : 
                        'Anmelden'
                      }
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
              
              {/* Admin Tab */}
              <TabsContent value="admin" className="space-y-4">
                {adminError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Admin-Anmeldeproblem</AlertTitle>
                    <AlertDescription>{adminError}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {!showOtpInput ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="admin-email">Admin E-Mail</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="admin-email"
                            type="email" 
                            placeholder="admin@email.de"
                            className="pl-10"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="admin-password">Admin Passwort</Label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="admin-password"
                            type={showAdminPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            required
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-0 top-0 h-10 w-10 text-gray-400 hover:text-gray-500"
                            onClick={() => setShowAdminPassword(!showAdminPassword)}
                          >
                            {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-lg font-medium">Zwei-Faktor-Authentifizierung</h3>
                        <p className="text-sm text-gray-500">
                          Bitte gib deinen 2FA Code ein, um fortzufahren
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="otp">Einmalcode</Label>
                        <div className="flex justify-center">
                          <InputOTP maxLength={6} onComplete={(value) => setOtpCode(value)}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        <div className="text-center text-xs text-gray-500 mt-2">
                          <p>Für Test-Zwecke: Beliebiger 6-stelliger Code</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-indigo-800 to-purple-800 hover:from-indigo-900 hover:to-purple-900"
                    disabled={isLoading || (showOtpInput && otpCode.length !== 6)}
                  >
                    {isLoading ? 
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : 
                      showOtpInput ? 'Verifizieren' : 'Als Admin anmelden'
                    }
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
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
