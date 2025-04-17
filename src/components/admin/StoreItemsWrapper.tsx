
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load the StoreItemsManager component
const StoreItemsManager = React.lazy(() => import('./StoreItemsManager'));

// This wrapper handles the lazy loading of the component
const StoreItemsWrapper = () => {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Clothing Store Manager wird geladen...</span>
      </div>
    }>
      <StoreItemsManager />
    </Suspense>
  );
};

export default StoreItemsWrapper;
