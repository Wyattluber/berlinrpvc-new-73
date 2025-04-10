
import React from 'react';

interface LoadingSpinnerProps {
  timeout?: boolean;
  onReset?: () => void;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  timeout = false,
  onReset
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600 mb-2">Lade Anwendung...</p>
      
      {timeout && onReset && (
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
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
