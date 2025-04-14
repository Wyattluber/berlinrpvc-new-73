
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertTriangle, Clock } from 'lucide-react';

interface ApplicationsTabProps {
  applications: any[];
  navigate: any;
}

const ApplicationsTab: React.FC<ApplicationsTabProps> = ({ applications, navigate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deine Bewerbungen</CardTitle>
        <CardDescription>
          Übersicht und Status deiner Bewerbungen
        </CardDescription>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-gray-900">Keine Bewerbungen</h3>
            <p className="text-gray-500 mt-1">Du hast noch keine Bewerbungen eingereicht.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/apply')}
            >
              Jetzt bewerben
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div 
                key={application.id} 
                className="border rounded-lg p-4 bg-white"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Teammitglied-Bewerbung</h3>
                    <p className="text-sm text-gray-500">
                      Eingereicht am {new Date(application.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      application.status === 'approved' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {application.status === 'approved' ? 'Angenommen' :
                       application.status === 'rejected' ? 'Abgelehnt' :
                       'In Bearbeitung'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Discord ID:</div>
                  <div>{application.discord_id}</div>
                  <div className="text-gray-500">Roblox Username:</div>
                  <div>{application.roblox_username}</div>
                  <div className="text-gray-500">Alter:</div>
                  <div>{application.age} Jahre</div>
                </div>
                
                {application.status === 'rejected' && (
                  <div className="mt-4 p-3 bg-red-50 rounded-md flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-800 font-medium">Bewerbung abgelehnt</p>
                      <p className="text-sm text-red-700 mt-1">
                        Deine Bewerbung wurde leider abgelehnt. Du kannst dich nach einer Wartezeit erneut bewerben.
                      </p>
                    </div>
                  </div>
                )}
                
                {application.status === 'pending' && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-md flex items-start">
                    <Clock className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Bewerbung in Bearbeitung</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Deine Bewerbung wird derzeit geprüft. Wir werden dich benachrichtigen, sobald eine Entscheidung getroffen wurde.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/apply')}
        >
          Neue Bewerbung
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApplicationsTab;
