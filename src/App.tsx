
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, createContext } from "react";
import { supabase } from '@/integrations/supabase/client';
import { checkIsAdmin, checkIsModerator, getUserRole } from '@/lib/admin';
import Index from "./pages/Index";
import Apply from "./pages/Apply";
import Partners from "./pages/Partners";
import ApplicationForm from "./pages/ApplicationForm";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import SubServers from "./pages/SubServers";
import AdminPanel from "./pages/AdminPanel";

// Create contexts for user roles
export const AdminContext = createContext<boolean>(false);
export const ModeratorContext = createContext<boolean>(false);
export const UserRoleContext = createContext<string | null>(null);

const queryClient = new QueryClient();

// Error boundary component
class ErrorFallback extends React.Component<{ children: React.ReactNode }> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: any, info: { componentStack: string }) {
    console.error("App error:", error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-xl font-bold text-red-700">Something went wrong</h2>
          <p className="text-red-600">{this.state.error?.message || "Unknown error"}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = "/";
            }}
          >
            Go to Home
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isModerator, setIsModerator] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session ? "Logged in" : "Not logged in");
      setSession(session);
      if (session) {
        // Check user roles
        checkIsAdmin().then(adminStatus => {
          console.log("Admin status:", adminStatus);
          setIsAdmin(adminStatus);
        });
        
        checkIsModerator().then(moderatorStatus => {
          console.log("Moderator status:", moderatorStatus);
          setIsModerator(moderatorStatus);
        });
        
        getUserRole().then(role => {
          console.log("User role:", role);
          setUserRole(role);
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event);
      setSession(session);
      
      if (session) {
        // Check user roles when session changes
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
        
        const moderatorStatus = await checkIsModerator();
        setIsModerator(moderatorStatus);
        
        const role = await getUserRole();
        setUserRole(role);
      } else {
        setIsAdmin(false);
        setIsModerator(false);
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    // Show a loading spinner for better UX
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AdminContext.Provider value={isAdmin}>
        <ModeratorContext.Provider value={isModerator}>
          <UserRoleContext.Provider value={userRole}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <ErrorFallback>
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/apply" element={<Apply />} />
                    <Route path="/partners" element={<Partners />} />
                    <Route path="/apply/form" element={<ApplicationForm />} />
                    <Route 
                      path="/login" 
                      element={session ? <Navigate to="/profile" /> : <Login />} 
                    />
                    <Route 
                      path="/profile" 
                      element={session ? <Profile /> : <Navigate to="/login" />} 
                    />
                    <Route 
                      path="/admin" 
                      element={session && isAdmin ? <AdminPanel /> : <Navigate to="/profile" />} 
                    />
                    <Route path="/subservers" element={<SubServers />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </ErrorFallback>
            </TooltipProvider>
          </UserRoleContext.Provider>
        </ModeratorContext.Provider>
      </AdminContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
