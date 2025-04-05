
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const UnderageAlert = () => {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="bg-red-50 text-red-800 rounded-t-lg">
        <CardTitle className="flex items-center text-lg">
          <AlertCircle className="mr-2 h-5 w-5" />
          Altersbeschränkung
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-6">
        <div className="space-y-4">
          <p>
            Es tut uns leid, aber du kannst dich leider nicht für unser Team bewerben, da du das Mindestalter von 12 Jahren nicht erreicht hast.
          </p>
          
          <p>
            Aus rechtlichen Gründen und zum Schutz von Minderjährigen ist es uns nicht möglich, Teammitglieder unter 12 Jahren aufzunehmen.
          </p>
          
          <div className="p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg mt-4">
            <p className="text-sm">
              <strong>Hinweis:</strong> Falls du dein Alter versehentlich falsch angegeben hast, 
              kannst du auf unserem Discord-Server ein Ticket öffnen und dein korrektes Alter angeben.
            </p>
          </div>
          
          <div className="flex justify-center pt-4">
            <Button onClick={() => navigate('/')} className="w-full">
              Zurück zur Startseite
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnderageAlert;
