
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkIsAdmin } from '@/lib/admin';
import { toast } from '@/hooks/use-toast';
import { fetchAdminUsers, getCachedUserCount } from '@/lib/adminService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderIcon, Users, FileText, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
        
        if (adminStatus) {
          // Fetch admin-related data
          const users = await fetchAdminUsers();
          setAdminUsers(users);
          
          const count = await getCachedUserCount();
          setUserCount(count);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking admin access:", error);
        setLoading(false);
        setIsAdmin(false);
      }
    };
    
    checkAccess();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 w-full">
        <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (isAdmin === false) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Zugriff verweigert</CardTitle>
          <CardDescription>
            Du benötigst Administrator-Berechtigungen, um auf diesen Bereich zuzugreifen.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Benutzer gesamt
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Admin-Benutzer
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bewerbungen
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Benutzer</TabsTrigger>
          <TabsTrigger value="applications">Bewerbungen</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Administratoren</CardTitle>
              <CardDescription>
                Verwalte Benutzer mit administrativen Berechtigungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {adminUsers.length === 0 ? (
                <p>Keine Admin-Benutzer gefunden.</p>
              ) : (
                <div className="space-y-2">
                  {adminUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{user.email || "Kein E-Mail"}</p>
                        <p className="text-sm text-muted-foreground">{user.role}</p>
                      </div>
                      <Button variant="outline" size="sm">Bearbeiten</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="applications" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Bewerbungen verwalten</CardTitle>
              <CardDescription>
                Verwalte und überprüfe eingehende Bewerbungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Bewerbungsübersicht wird geladen...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Teameinstellungen</CardTitle>
              <CardDescription>
                Verwalte Teameinstellungen wie Meetings und Benachrichtigungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Einstellungen werden geladen...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
