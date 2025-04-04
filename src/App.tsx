
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, createContext } from "react";
import { supabase } from '@/integrations/supabase/client';
import { checkIsAdmin } from '@/lib/admin';
import Index from "./pages/Index";
import Apply from "./pages/Apply";
import Partners from "./pages/Partners";
import ApplicationForm from "./pages/ApplicationForm";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import SubServers from "./pages/SubServers";

// Create a context for admin status
export const AdminContext = createContext<boolean>(false);

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Check if user is admin
        checkIsAdmin().then(adminStatus => {
          setIsAdmin(adminStatus);
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event);
      setSession(session);
      
      if (session) {
        // Check if user is admin when session changes
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
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
      </AdminContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
