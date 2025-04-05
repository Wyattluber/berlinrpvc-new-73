
import React from 'react';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { AccountDeletionRequest } from './types';

interface RequestListProps {
  requests: AccountDeletionRequest[];
  isLoading: boolean;
  formatDate: (dateString: string) => string;
  onApprove: (request: AccountDeletionRequest) => void;
  onReject: (request: AccountDeletionRequest) => void;
}

export const RequestList: React.FC<RequestListProps> = ({
  requests,
  isLoading,
  formatDate,
  onApprove,
  onReject
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Keine offenen Kontolöschungsanträge vorhanden.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Benutzer</TableHead>
          <TableHead>E-Mail</TableHead>
          <TableHead>Grund</TableHead>
          <TableHead>Datum</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-medium">{request.username}</TableCell>
            <TableCell>{request.email}</TableCell>
            <TableCell>
              {request.reason.length > 40 
                ? `${request.reason.substring(0, 40)}...` 
                : request.reason}
            </TableCell>
            <TableCell>{formatDate(request.created_at)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => onApprove(request)}
                >
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="sr-only">Genehmigen</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => onReject(request)}
                >
                  <X className="h-4 w-4 text-red-500" />
                  <span className="sr-only">Ablehnen</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RequestList;
