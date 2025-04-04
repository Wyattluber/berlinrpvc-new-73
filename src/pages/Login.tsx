
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Mail, Lock, Loader2, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '@/components/Navbar';

type PasswordRequirement = {
  name: string;
  regex: RegExp;
  met: boolean;
};

const Login = () => {
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Register state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    { name: "Mindestens 8 Zeichen", regex: /.{8,}/, met: false },
    { name: "Mindestens ein Buchstabe", regex: /[a-zA-Z]/, met: false },
    { name: "Mindestens eine Nummer", regex: /[0-9]/, met: false }
  ]);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Update password requirements when password changes
  useEffect(() => {
    setPasswordRequirements(prev => 
      prev.map(req => ({
        ...req,
        met: req.regex.test(registerPassword)
      }))
    );
  }, [registerPassword]);
  
  // Check if all password requirements are met
  const allRequirementsMet = passwordRequirements.every(req => req.met);
  
  // Check if passwords match
  const passwordsMatch = registerPassword === confirmPassword && confirmPassword !== '';
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoginLoading(true);
      setLoginError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
      });
      
      if (error) {
        console.error("Email login error:", error);
        let errorMsg = "Login fehlgeschlagen";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMsg = "Ungültige Anmeldedaten. Bitte überprüfe deine E-Mail und dein Passwort.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMsg = "Deine E-Mail-Adresse wurde noch nicht bestätigt. Bitte überprüfe dein E-Mail-Postfach.";
        }
        
        setLoginError(errorMsg);
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
      setLoginLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allRequirementsMet) {
      setRegisterError("Dein Passwort erfüllt nicht alle Anforderungen.");
      return;
    }
    
    if (!passwordsMatch) {
      setRegisterError("Die Passwörter stimmen nicht überein.");
      return;
    }
    
    try {
      setRegisterLoading(true);
      setRegisterError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword
      });
      
      if (error) {
        console.error("Registration error:", error);
        let errorMsg = "Registrierung fehlgeschlagen";
        
        if (error.message.includes("already registered")) {
          errorMsg = "Diese E-Mail-Adresse ist bereits registriert.";
        }
        
        setRegisterError(errorMsg);
        throw error;
      }
      
      if (data) {
        toast({
          title: "Registrierung erfolgreich",
          description: "Bitte überprüfe dein E-Mail-Postfach, um deine E-Mail-Adresse zu bestätigen.",
        });
        
        // Clear form
        setRegisterEmail('');
        setRegisterPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setRegisterLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-8 px-4">
        <Tabs defaultValue="login" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login" className="text-base">Anmelden</TabsTrigger>
            <TabsTrigger value="register" className="text-base">Registrieren</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="w-full">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Anmelden</CardTitle>
                <CardDescription className="text-center">Gib deine E-Mail und dein Passwort ein, um dich anzumelden</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {loginError && (
                  <Alert variant="destructive">
                    <AlertTitle>Fehler</AlertTitle>
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="login-email">E-Mail</Label>
                  <Input
                    id="login-email"
                    placeholder="me@example.com"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={loginLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="login-password">Passwort</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={loginLoading}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <Button 
                  onClick={handleEmailLogin} 
                  disabled={loginLoading} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Bitte warten...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Anmelden
                    </>
                  )}
                </Button>
              </CardContent>
              <CardFooter className="flex justify-center border-t p-4">
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                  Passwort vergessen?
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card className="w-full">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Registrieren</CardTitle>
                <CardDescription className="text-center">Erstelle ein neues Konto</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {registerError && (
                  <Alert variant="destructive">
                    <AlertTitle>Fehler</AlertTitle>
                    <AlertDescription>{registerError}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="register-email">E-Mail</Label>
                  <Input
                    id="register-email"
                    placeholder="me@example.com"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    disabled={registerLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="register-password">Passwort</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      disabled={registerLoading}
                      className={allRequirementsMet ? "border-green-500" : registerPassword ? "border-red-500" : ""}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Passwort-Anforderungen</Label>
                  <div className="space-y-1 text-sm">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {req.met ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className={req.met ? "text-green-700" : "text-red-700"}>
                          {req.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                  <Input
                    id="confirm-password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={registerLoading}
                    className={passwordsMatch && confirmPassword ? "border-green-500" : confirmPassword ? "border-red-500" : ""}
                  />
                  {confirmPassword && !passwordsMatch && (
                    <span className="text-red-500 text-sm mt-1">Die Passwörter stimmen nicht überein</span>
                  )}
                </div>
                
                <Button 
                  onClick={handleRegister} 
                  disabled={registerLoading || !allRequirementsMet || !passwordsMatch} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white"
                >
                  {registerLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Bitte warten...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Registrieren
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 text-center">
          <Button variant="outline" className="text-blue-600" asChild>
            <Link to="/">Zurück zur Startseite</Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default Login;
