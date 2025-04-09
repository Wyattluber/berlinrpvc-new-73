
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { checkIsAdmin, checkIsModerator } from '@/lib/admin';
import { useNavigate } from 'react-router-dom';
import ApplicationsList from '@/components/ApplicationsList';
import TeamAbsencesList from '@/components/admin/TeamAbsencesList';
import ModeratorAbsencePanel from '@/components/admin/ModeratorAbsencePanel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ModeratorPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const adminCheck = await checkIsAdmin();
        const modCheck = await checkIsModerator();
        
        setIsAdmin(adminCheck);
        setIsModerator(modCheck);
        
        // If user is neither admin nor moderator, redirect to home
        if (!adminCheck && !modCheck) {
          navigate('/');
        }
        
      } catch (error) {
        console.error('Error checking permissions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAccess();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Lade Berechtigungen...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Moderationsbereich</h1>
        <p className="text-gray-600 mb-6">Willkommen im Bereich für Teammitglieder</p>
        
        {(isAdmin || isModerator) ? (
          <Tabs defaultValue="applications">
            <TabsList className="mb-4">
              <TabsTrigger value="applications">Bewerbungen</TabsTrigger>
              <TabsTrigger value="absences">Team-Abmeldungen</TabsTrigger>
              <TabsTrigger value="my-absence">Vom Meeting abmelden</TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin-panel">
                  <a href="https://berlinrpvc-new-51.lovable.app/login" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                    Admin-Panel
                  </a>
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle>Bewerbungen verwalten</CardTitle>
                  <CardDescription>
                    Übersicht aller eingegangenen Bewerbungen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ApplicationsList />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="absences">
              <Card>
                <CardHeader>
                  <CardTitle>Team-Abmeldungen</CardTitle>
                  <CardDescription>
                    Übersicht aller abgemeldeten Teammitglieder
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TeamAbsencesList />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="my-absence">
              <Card>
                <CardHeader>
                  <CardTitle>Vom Meeting abmelden</CardTitle>
                  <CardDescription>
                    Hier kannst du dich von Team-Meetings abmelden
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ModeratorAbsencePanel />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Zugriff verweigert</AlertTitle>
            <AlertDescription>
              Du benötigst Moderator- oder Administratorberechtigungen, um auf diesen Bereich zuzugreifen.
              <Button variant="outline" onClick={() => navigate('/')} className="mt-4 w-full">
                Zurück zur Startseite
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ModeratorPanel;
