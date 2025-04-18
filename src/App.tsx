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
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import SubServers from "./pages/SubServers";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import CancelDeletion from "./pages/CancelDeletion";
import ClothingStore from "./pages/ClothingStore";
import AdminDashboard from "./pages/AdminDashboard";
import ModeratorPanel from "./pages/ModeratorPanel";
import ModeratorApplication from "./pages/ModeratorApplication";
import DiscordManagerApplication from "./pages/DiscordManagerApplication";
import { ApplicationProvider } from "@/contexts/ApplicationContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppLoadingErrorManager = () => {
  const { loading, loadingError, resetAuth, session } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
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
            path="/cancel-deletion" 
            element={
              <ProtectedRoute>
                <CancelDeletion />
              </ProtectedRoute>
            } 
          />
          <Route path="/subservers" element={<SubServers />} />
          <Route path="/clothingstore" element={<ClothingStore />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="/account-deletion/cancel/:token" element={<CancelDeletion />} />
          <Route path="/moderator/application" element={<ModeratorApplication />} />
          <Route path="/discord-manager/application" element={<DiscordManagerApplication />} />
          <Route 
            path="/moderator/panel" 
            element={
              <ProtectedRoute>
                <ModeratorPanel />
              </ProtectedRoute>
            } 
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
