
import React, { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  timeout?: boolean;
  onReset?: () => void;
  size?: 'small' | 'medium' | 'large';
  message?: string;
  timeoutMs?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  timeout = false,
  onReset,
  size = 'large',
  message = 'Lade Anwendung...',
  timeoutMs = 10000 // Reduced from 15000 to 10000
}) => {
  // Define spinner sizes
  const spinnerSizes = {
    small: 'h-6 w-6 border-t-1 border-b-1',
    medium: 'h-8 w-8 border-t-2 border-b-2',
    large: 'h-12 w-12 border-t-2 border-b-2',
  };
  
  const containerSizes = {
    small: 'min-h-0',
    medium: 'min-h-0', 
    large: 'min-h-screen',
  };

  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (timeout) {
      timer = setTimeout(() => {
        setShowTimeout(true);
      }, timeoutMs);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeout, timeoutMs]);

  return (
    <div className={`flex flex-col items-center justify-center ${containerSizes[size]} p-4`}>
      <div className={`animate-spin rounded-full ${spinnerSizes[size]} border-blue-500 mb-4`}></div>
      <p className="text-gray-600 mb-2">{message}</p>
      
      {timeout && showTimeout && onReset && (
        <div className="mt-4 text-center">
          <p className="text-amber-600 mb-2">
            Das Laden dauert länger als erwartet.
          </p>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Neu laden
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Alternativ kannst du auch versuchen, alle Cookies zu löschen und die Seite neu zu laden.
          </p>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
