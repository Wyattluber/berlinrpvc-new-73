
import React from 'react';
import { AccountDeletionRequest } from './types';

interface RequestDetailsProps {
  request: AccountDeletionRequest;
  isApproving: boolean;
}

export const RequestDetails: React.FC<RequestDetailsProps> = ({ 
  request, 
  isApproving 
}) => {
  return (
    <div className="py-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium">Benutzer</p>
          <p className="text-sm">{request.username}</p>
        </div>
        <div>
          <p className="text-sm font-medium">E-Mail</p>
          <p className="text-sm">{request.email}</p>
        </div>
      </div>
      
      <div>
        <p className="text-sm font-medium">Begründung</p>
        <p className="text-sm mt-1 p-2 border rounded bg-gray-50">{request.reason}</p>
      </div>
      
      {isApproving && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          <p className="font-semibold">Achtung:</p>
          <p>
            Bei Genehmigung werden die Benutzerdaten anonymisiert, der Benutzer wird als "[Gelöschter Benutzer]" 
            markiert, und alle persönlichen Informationen werden entfernt. Diese Aktion kann nicht rückgängig 
            gemacht werden.
          </p>
        </div>
      )}
    </div>
  );
};

export default RequestDetails;
