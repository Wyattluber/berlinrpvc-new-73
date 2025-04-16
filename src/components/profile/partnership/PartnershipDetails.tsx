
import React from 'react';
import { Link } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface PartnershipDetailsProps {
  partnerServer: any;
  isActivePartnership: boolean;
}

const PartnershipDetails = ({ partnerServer, isActivePartnership }: PartnershipDetailsProps) => {
  if (!partnerServer) return null;
  
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
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
    </div>
  );
};

export default PartnershipDetails;
