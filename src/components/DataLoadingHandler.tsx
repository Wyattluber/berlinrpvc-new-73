
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
}

const DataLoadingHandler: React.FC<DataLoadingHandlerProps> = ({
  loading,
  error,
  onRetry,
  children,
  loadingMessage = "Daten werden geladen...",
  retryCount = 0,
  noDataMessage = "Keine Daten gefunden.",
  showNoData = false
}) => {
  const [hasAutoRetried, setHasAutoRetried] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Auto-retry logic - only run once
    if (error && !hasAutoRetried && retryCount < 2) {
      setHasAutoRetried(true);
      const timer = setTimeout(() => {
        onRetry();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
    
    // Show error after short delay to avoid flashing
    if (error) {
      const timer = setTimeout(() => {
        setShowError(true);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setShowError(false);
    }
  }, [error, onRetry, hasAutoRetried, retryCount]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <LoadingSpinner 
          size="medium" 
          message={loadingMessage} 
          timeout={true}
          timeoutMs={5000}
        />
      </div>
    );
  }

  if (error && showError) {
    return (
      <Alert variant="destructive" className="mb-6 mx-auto max-w-2xl">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription className="flex justify-between items-center">
          <span>{error}</span>
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
