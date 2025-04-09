
import React, { useEffect, useState } from 'react';
import ChangelogEntry, { ChangelogEntryProps } from './ChangelogEntry';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const Changelog: React.FC = () => {
  const [entries, setEntries] = useState<ChangelogEntryProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChangelog = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('changelog')
          .select('*')
          .order('date', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        setEntries(data || []);
      } catch (err: any) {
        console.error('Error fetching changelog:', err);
        setError(err.message || 'Fehler beim Laden des Changelogs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChangelog();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        Noch keine Änderungen vorhanden.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <ChangelogEntry 
          key={entry.id}
          id={entry.id}
          title={entry.title}
          description={entry.description}
          date={entry.date}
          type={entry.type}
        />
      ))}
    </div>
  );
};

export default Changelog;
