
import React, { useState, useEffect } from 'react';

const LoadingSpinner: React.FC = () => {
  const [longLoading, setLongLoading] = useState(false);
  
  useEffect(() => {
    // If loading takes more than 3 seconds, show additional message
    const timeoutId = setTimeout(() => {
      setLongLoading(true);
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600">Lade Anwendung...</p>
      
      {longLoading && (
        <div className="mt-4 max-w-md text-center">
          <p className="text-yellow-600 text-sm">
            Wenn das Laden zu lange dauert, bitte die Seite neu laden.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Seite neu laden
          </button>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
