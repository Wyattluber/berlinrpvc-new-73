
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RequestList from './account-deletion/RequestList';
import ConfirmationDialog from './account-deletion/ConfirmationDialog';
import { useAccountDeletionRequests } from './account-deletion/useAccountDeletionRequests';

export const AccountDeletionRequestManager = () => {
  const {
    requests,
    isLoading,
    isProcessing,
    selectedRequest,
    setSelectedRequest,
    dialogOpen,
    setDialogOpen,
    isApproving,
    setIsApproving,
    handleRequestAction,
    formatDate
  } = useAccountDeletionRequests();

  const handleApprove = (request: typeof requests[0]) => {
    setSelectedRequest(request);
    setIsApproving(true);
    setDialogOpen(true);
  };

  const handleReject = (request: typeof requests[0]) => {
    setSelectedRequest(request);
    setIsApproving(false);
    setDialogOpen(true);
  };

  const handleConfirm = (approved: boolean) => {
    if (selectedRequest) {
      handleRequestAction(selectedRequest.id, approved);
    }
  };

  return (
    <Card className="border-red-100">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
          Kontolöschungsanträge
        </CardTitle>
        <CardDescription>
          Verwalte Anfragen zur Löschung von Benutzerkonten
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RequestList
          requests={requests}
          isLoading={isLoading}
          formatDate={formatDate}
          onApprove={handleApprove}
          onReject={handleReject}
        />
        
        <ConfirmationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          request={selectedRequest}
          isApproving={isApproving}
          isProcessing={isProcessing}
          onConfirm={handleConfirm}
        />
      </CardContent>
    </Card>
  );
};

export default AccountDeletionRequestManager;
