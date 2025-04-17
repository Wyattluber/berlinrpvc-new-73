
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ClipboardList, ClipboardCheck, ClipboardX, CalendarDays } from 'lucide-react';

interface ApplicationsTabProps {
  applications: any[];
  navigate: any;
}

const ApplicationsTab: React.FC<ApplicationsTabProps> = ({ applications, navigate }) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Deine Bewerbungen</CardTitle>
          <CardDescription>
            Übersicht über deine eingereichten Bewerbungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-6">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">Keine Bewerbungen</h3>
              <p className="mt-1 text-sm text-gray-500">
                Du hast noch keine Bewerbungen eingereicht.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => navigate('/apply')}
              >
                Jetzt bewerben
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      {app.status === 'pending' && (
                        <ClipboardList className="h-5 w-5 text-yellow-500 mr-2" />
                      )}
                      {app.status === 'approved' && (
                        <ClipboardCheck className="h-5 w-5 text-green-500 mr-2" />
                      )}
                      {app.status === 'rejected' && (
                        <ClipboardX className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <div>
                        <div className="font-medium">
                          Bewerbung {app.season_name ? `für ${app.season_name}` : ''}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <CalendarDays className="h-3 w-3 mr-1" />
                          {format(new Date(app.created_at), 'PPP', { locale: de })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    {app.status === 'pending' && (
                      <Badge className="bg-yellow-500">In Bearbeitung</Badge>
                    )}
                    {app.status === 'approved' && (
                      <Badge className="bg-green-500">Angenommen</Badge>
                    )}
                    {app.status === 'rejected' && (
                      <Badge className="bg-red-500">Abgelehnt</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ApplicationsTab;
