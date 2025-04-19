
import React from 'react';
import { Link, X } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface PartnershipDetailsProps {
  partnerServer: any;
  isActivePartnership: boolean;
  onClose?: () => void;
}

const PartnershipDetails = ({ partnerServer, isActivePartnership, onClose }: PartnershipDetailsProps) => {
  const isMobile = useIsMobile();
  
  if (!partnerServer) return null;
  
  return (
    <div className="mt-4 pt-4 border-t border-gray-200 relative max-h-[80vh] overflow-y-auto">
      {onClose && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 h-8 w-8" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      <h3 className="font-medium mb-2">Partnerschaft Details</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-gray-500">Aktiv:</div>
        <div>{isActivePartnership ? 'Ja' : 'Nein'}</div>
        <div className="text-gray-500">Server:</div>
        <div>{partnerServer.name}</div>
        {partnerServer.website && (
          <>
            <div className="text-gray-500">Website:</div>
            <div className="flex items-center">
              <a 
                href={partnerServer.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center"
              >
                Öffnen <Link className="h-3 w-3 ml-1" />
              </a>
            </div>
          </>
        )}
      </div>
      
      {partnerServer.description && (
        <div className="mt-4">
          <div className="text-gray-500 mb-1">Beschreibung:</div>
          <div className="text-sm">{partnerServer.description}</div>
        </div>
      )}
      
      {isMobile && (
        <div className="mt-6 mb-4 text-center">
          <Button onClick={onClose} className="w-full">Schließen</Button>
        </div>
      )}
    </div>
  );
};

export default PartnershipDetails;
