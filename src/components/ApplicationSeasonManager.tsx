
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { LoaderIcon, Plus } from 'lucide-react';
import { createApplicationSeason, getApplicationSeasons } from '@/lib/adminService';
import { useQuery } from '@tanstack/react-query';

const ApplicationSeasonManager = () => {
  const [newSeasonName, setNewSeasonName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { 
    data: seasons,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['applicationSeasons'],
    queryFn: getApplicationSeasons,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching application seasons:', error);
        toast({
          title: 'Fehler',
          description: 'Fehler beim Laden der Bewerbungssaisons.',
          variant: 'destructive',
        });
      }
    }
  });

  const handleCreateSeason = async () => {
    if (!newSeasonName) {
      toast({
        title: 'Fehler',
        description: 'Bitte gib einen Namen für die neue Saison ein.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const result = await createApplicationSeason(newSeasonName);
      
      if (result.success) {
        toast({
          title: 'Erfolgreich',
          description: result.message,
        });
        setNewSeasonName('');
        refetch();
      } else {
        toast({
          title: 'Fehler',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating application season:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Erstellen der Bewerbungssaison.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bewerbungssaisons</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-sm text-blue-800">
            Mit einer neuen Bewerbungssaison kannst du die Anzahl der Bewerbungen zurücksetzen. 
            Alle bisherigen Bewerbungen bleiben erhalten, werden aber in der Historie gespeichert.
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Name der neuen Saison"
            value={newSeasonName}
            onChange={(e) => setNewSeasonName(e.target.value)}
          />
          <Button 
            onClick={handleCreateSeason} 
            disabled={isCreating || !newSeasonName}
          >
            {isCreating ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                Erstellen...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Neue Saison
              </>
            )}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-4">
            <LoaderIcon className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : seasons && seasons.length > 0 ? (
          <div className="space-y-2 mt-4">
            <h3 className="text-sm font-medium">Bisherige Saisons</h3>
            <div className="border rounded-md divide-y">
              {seasons.map((season: any) => (
                <div key={season.id} className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{season.name}</p>
                    <p className="text-xs text-gray-500">
                      Erstellt am {new Date(season.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  {season.is_active && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Aktiv
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm mt-4">
            Noch keine Saisons erstellt.
          </p>
        )}
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        Eine neue Saison zu erstellen wirkt sich auf die Statistiken und Übersichten aus.
      </CardFooter>
    </Card>
  );
};

export default ApplicationSeasonManager;
