
import React, { useState, useEffect, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from './LoadingSpinner';

interface DataLoadingHandlerProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  children: ReactNode;
  loadingMessage?: string;
  retryCount?: number;
  noDataMessage?: string;
  showNoData?: boolean;
  ignoreAuthErrors?: boolean; // Add option to ignore auth errors
}

const DataLoadingHandler: React.FC<DataLoadingHandlerProps> = ({
  loading,
  error,
  onRetry,
  children,
  loadingMessage = "Daten werden geladen...",
  retryCount = 0,
  noDataMessage = "Keine Daten gefunden.",
  showNoData = false,
  ignoreAuthErrors = false // Default to false
}) => {
  const [hasAutoRetried, setHasAutoRetried] = useState(false);
  const [showError, setShowError] = useState(false);

  // Check if error is related to authentication
  const isAuthError = error?.toLowerCase().includes('auth') || 
                     error?.toLowerCase().includes('anmeld') || 
                     error?.toLowerCase().includes('login');

  // If we should ignore auth errors and this is an auth error, treat as if no error
  const effectiveError = ignoreAuthErrors && isAuthError ? null : error;

  useEffect(() => {
    // Auto-retry logic - only run once
    if (effectiveError && !hasAutoRetried && retryCount < 2) {
      setHasAutoRetried(true);
      const timer = setTimeout(() => {
        onRetry();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
    
    // Show error after short delay to avoid flashing
    if (effectiveError) {
      const timer = setTimeout(() => {
        setShowError(true);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setShowError(false);
    }
  }, [effectiveError, onRetry, hasAutoRetried, retryCount]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <LoadingSpinner 
          size="medium" 
          message={loadingMessage} 
          timeout={true}
          timeoutMs={3000} // Reduced from 5000 to improve responsiveness
        />
      </div>
    );
  }

  if (effectiveError && showError) {
    return (
      <Alert variant="destructive" className="mb-6 mx-auto max-w-2xl">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription className="flex justify-between items-center">
          <span>{effectiveError}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry} 
            className="ml-4 flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Neu laden
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (showNoData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{noDataMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default DataLoadingHandler;
