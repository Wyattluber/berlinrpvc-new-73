
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const UnderageAlert = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="shadow-lg border-red-200 max-w-md mx-auto">
      <CardHeader className="bg-red-50 border-b border-red-200">
        <div className="flex items-center gap-2">
          <Lock className="text-red-500" />
          <CardTitle className="text-red-800">Bewerbung gesperrt</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Altersbeschränkung</AlertTitle>
          <AlertDescription>
            Du musst mindestens 12 Jahre alt sein, um dich für eine Teammitgliedschaft zu bewerben.
          </AlertDescription>
        </Alert>
        
        <p className="text-gray-600 mb-2">
          Deine Bewerbung wurde gesperrt, da du angegeben hast, unter 12 Jahre alt zu sein.
        </p>
        
        <p className="text-gray-600">
          Nur ein Administrator kann diese Sperre aufheben. Wenn du denkst, dass dies ein Fehler ist, kontaktiere bitte einen Administrator.
        </p>
      </CardContent>
      <CardFooter className="border-t flex justify-end">
        <Button 
          variant="secondary"
          onClick={() => navigate('/')}
        >
          Zurück zur Startseite
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UnderageAlert;
