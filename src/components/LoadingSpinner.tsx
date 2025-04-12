
import React, { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  timeout?: boolean;
  timeoutMs?: number;
  onReset?: () => void;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Laden...',
  size = 'medium',
  timeout = false,
  timeoutMs = 8000,
  onReset
}) => {
  const [showTimeout, setShowTimeout] = useState(false);
  const [showHideButton, setShowHideButton] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let hideButtonTimeoutId: NodeJS.Timeout;

    if (timeout) {
      timeoutId = setTimeout(() => {
        setShowTimeout(true);
      }, timeoutMs);

      // Show hide button a bit later to avoid confusion
      hideButtonTimeoutId = setTimeout(() => {
        setShowHideButton(true);
      }, timeoutMs + 3000);
    }

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(hideButtonTimeoutId);
    };
  }, [timeout, timeoutMs]);

  const handleReset = () => {
    if (onReset) {
      onReset();
      setShowTimeout(false);
    }
  };

  const handleHide = () => {
    setShowTimeout(false);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-6 h-6';
      case 'large':
        return 'w-14 h-14';
      case 'medium':
      default:
        return 'w-10 h-10';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-600 ${getSizeClasses()}`}></div>
      <div className="mt-3 text-center">
        <p className="text-gray-600">{message}</p>
        
        {showTimeout && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-700 mb-2">
              Authentifizierung Timeout - Bitte Seite neu laden oder zurücksetzen.
            </p>
            
            <div className="flex gap-2 justify-center mt-3">
              {onReset && (
                <button
                  onClick={handleReset}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Zurücksetzen
                </button>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Seite neu laden
              </button>
              
              {showHideButton && (
                <button
                  onClick={handleHide}
                  className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                >
                  Ausblenden
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
