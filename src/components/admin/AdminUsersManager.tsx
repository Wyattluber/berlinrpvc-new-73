
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users } from 'lucide-react';
import UserRoleManager from '@/components/UserRoleManager';

interface AdminUsersManagerProps {
  adminUsers: any[];
  handleUpdateRole: (userId: string, role: string) => void;
  handleDeleteUser: (userId: string) => void;
}

const AdminUsersManager: React.FC<AdminUsersManagerProps> = ({ 
  adminUsers, 
  handleUpdateRole, 
  handleDeleteUser 
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Administration Team
          </CardTitle>
          <CardDescription>
            Verwalte Benutzer mit administrativen Rechten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserRoleManager />
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Aktuelle Administratoren</h3>
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-3 text-left font-medium">Benutzer</th>
                    <th className="p-3 text-left font-medium">Rolle</th>
                    <th className="p-3 text-left font-medium">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((admin) => (
                    <tr key={admin.id} className="border-t">
                      <td className="p-3">{admin.user_id}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          {admin.role}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <select
                            className="border rounded px-2 py-1 text-sm"
                            value={admin.role}
                            onChange={(e) => handleUpdateRole(admin.user_id, e.target.value)}
                          >
                            <option value="admin">Admin</option>
                            <option value="moderator">Moderator</option>
                          </select>
                          <button
                            className="text-destructive text-sm"
                            onClick={() => handleDeleteUser(admin.user_id)}
                          >
                            Entfernen
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersManager;
