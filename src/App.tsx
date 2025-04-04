
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

// Create contexts for user roles
export const AdminContext = createContext<boolean>(false);
export const ModeratorContext = createContext<boolean>(false);
export const UserRoleContext = createContext<string | null>(null);

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isModerator, setIsModerator] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Check user roles
        checkIsAdmin().then(adminStatus => {
          setIsAdmin(adminStatus);
        });
        
        checkIsModerator().then(moderatorStatus => {
          setIsModerator(moderatorStatus);
        });
        
        getUserRole().then(role => {
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
    // You could add a loading spinner here if needed
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AdminContext.Provider value={isAdmin}>
        <ModeratorContext.Provider value={isModerator}>
          <UserRoleContext.Provider value={userRole}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
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
                  <Route path="/subservers" element={<SubServers />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </UserRoleContext.Provider>
        </ModeratorContext.Provider>
      </AdminContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
