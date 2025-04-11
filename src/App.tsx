
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import ErrorFallback from "./components/ErrorFallback";
import LoadingSpinner from "./components/LoadingSpinner";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

import Index from "./pages/Index";
import Apply from "./pages/Apply";
import Partners from "./pages/Partners";
import ApplicationForm from "./pages/ApplicationForm";
import PartnerApplicationForm from "./pages/PartnerApplicationForm";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import SubServers from "./pages/SubServers";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import CancelDeletion from "./pages/CancelDeletion";
import ModeratorPanel from "./pages/ModeratorPanel";
import { ApplicationProvider } from "@/contexts/ApplicationContext";
import { PartnerApplicationProvider } from "@/contexts/PartnerApplicationContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
    },
  },
});

const AppLoadingErrorManager = () => {
  const { loading, loadingError, resetAuth, session } = useAuth();

  // Function to handle manual reset when loading gets stuck
  const handleReset = () => {
    console.log("Manual reset triggered");
    resetAuth();
  };

  if (loading) {
    return <LoadingSpinner timeout={true} onReset={handleReset} />;
  }

  return (
    <>
      {loadingError && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 fixed top-0 left-0 right-0 z-50">
          <div className="flex items-center justify-between">
            <p>{loadingError}</p>
            <div className="flex space-x-2">
              <button 
                className="underline ml-2"
                onClick={() => resetAuth()}
              >
                Ausblenden
              </button>
              <button 
                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                onClick={resetAuth}
              >
                Zurücksetzen
              </button>
            </div>
          </div>
        </div>
      )}
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/apply/form" element={
            <ApplicationProvider>
              <ApplicationForm />
            </ApplicationProvider>
          } />
          <Route path="/apply/partner-form" element={
            <PartnerApplicationProvider>
              <PartnerApplicationForm />
            </PartnerApplicationProvider>
          } />
          <Route 
            path="/login" 
            element={session ? <Navigate to="/profile" /> : <Login />} 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/moderator" 
            element={
              <ProtectedRoute requireModerator>
                <ModeratorPanel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cancel-deletion" 
            element={
              <ProtectedRoute>
                <CancelDeletion />
              </ProtectedRoute>
            } 
          />
          <Route path="/subservers" element={<SubServers />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route 
            path="/admin/*" 
            element={<Navigate to="https://berlinrpvc-new-51.lovable.app/login" replace />} 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ErrorFallback>
            <AppLoadingErrorManager />
          </ErrorFallback>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

import './lib/auth';
