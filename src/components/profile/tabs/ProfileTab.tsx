
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import UserDataChangeRequest from '@/components/profile/UserDataChangeRequest';
import AccountDeletionRequest from '@/components/profile/AccountDeletionRequest';

interface ProfileTabProps {
  session: any;
  username: string;
  discordId: string;
  robloxId: string;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ session, username, discordId, robloxId }) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profil Informationen</CardTitle>
          <CardDescription>
            Deine persönlichen Informationen und Einstellungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input 
                  id="email" 
                  value={session.user.email} 
                  disabled 
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Deine E-Mail-Adresse kann nicht geändert werden</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Benutzername</Label>
                <Input 
                  id="username" 
                  value={username} 
                  disabled 
                  className="bg-gray-50"
                />
                <UserDataChangeRequest 
                  userId={session.user.id}
                  currentValue={username}
                  fieldName="username"
                  buttonText="Benutzernamen ändern"
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discord_id">Discord ID</Label>
                <Input 
                  id="discord_id" 
                  value={discordId || 'Nicht angegeben'} 
                  disabled 
                  className="bg-gray-50"
                />
                <UserDataChangeRequest 
                  userId={session.user.id}
                  currentValue={discordId}
                  fieldName="discord_id"
                  buttonText="Discord ID ändern"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="roblox_id">Roblox ID</Label>
                <Input 
                  id="roblox_id" 
                  value={robloxId || 'Nicht angegeben'} 
                  disabled 
                  className="bg-gray-50"
                />
                <UserDataChangeRequest 
                  userId={session.user.id}
                  currentValue={robloxId}
                  fieldName="roblox_id"
                  buttonText="Roblox ID ändern"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-red-600">Gefahrenzone</CardTitle>
          <CardDescription>
            Aktionen, die nicht rückgängig gemacht werden können
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountDeletionRequest />
        </CardContent>
      </Card>
    </>
  );
};

export default ProfileTab;
