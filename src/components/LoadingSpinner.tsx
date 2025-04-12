
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
  timeoutMs = 5000,
  onReset
}) => {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (timeout) {
      timeoutId = setTimeout(() => {
        console.log("LoadingSpinner timeout triggered after", timeoutMs, "ms");
        setShowTimeout(true);
      }, timeoutMs);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [timeout, timeoutMs]);

  const handleReset = () => {
    if (onReset) {
      console.log("LoadingSpinner manual reset triggered");
      onReset();
      setShowTimeout(false);
    }
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
              Ladevorgang dauert länger als erwartet. Bitte Seite neu laden.
            </p>
            
            <div className="flex justify-center mt-3">
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Seite neu laden
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
