
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AccountDeletionRequestManager from '@/components/admin/AccountDeletionRequestManager';

const AccountDeletionRequestsManager = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Kontolöschungsanträge
          </CardTitle>
          <CardDescription>
            Verwalte Anfragen zur Löschung von Benutzerkonten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountDeletionRequestManager />
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountDeletionRequestsManager;
