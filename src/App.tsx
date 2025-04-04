
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { isUserAdmin } from '@/utils/adminUtils';
import Index from "./pages/Index";
import Apply from "./pages/Apply";
import Partners from "./pages/Partners";
import ApplicationForm from "./pages/ApplicationForm";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import SubServers from "./pages/SubServers";
import AdminSetup from "./pages/AdminSetup";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Function to check if user is admin
  const checkAdminStatus = async () => {
    const adminStatus = await isUserAdmin();
    console.log("Admin status checked:", adminStatus);
    setIsAdmin(adminStatus);
    return adminStatus;
  };

  useEffect(() => {
    // Check current auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      // Check if user is admin
      if (session?.user) {
        checkAdminStatus().then(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event);
      setSession(session);
      
      // Update admin status when auth changes
      if (session?.user) {
        await checkAdminStatus();
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
            <Route 
              path="/admin" 
              element={isAdmin ? <Admin /> : <Navigate to={session ? "/profile" : "/login"} />} 
            />
            <Route path="/subservers" element={<SubServers />} />
            <Route path="/admin-setup" element={<AdminSetup />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
