
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Share, Server, HelpCircle, Save, Edit } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetchServerStats, ServerStats as ServerStatsType, updateServerStats } from '@/lib/stats';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { toast } from '@/hooks/use-toast';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  className = "", 
  lastUpdated, 
  color, 
  isEditing,
  onValueChange
}: {
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  className?: string;
  lastUpdated: string;
  color: string;
  isEditing?: boolean;
  onValueChange?: (value: number) => void;
}) => {
  return (
    <Card className={`hover:shadow-lg transition-all duration-300 ${className} relative group overflow-visible`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute top-3 right-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-help z-10">
              <HelpCircle size={16} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="z-50 bg-white shadow-lg">
            <p className="text-xs">Zuletzt aktualisiert: {lastUpdated}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <CardHeader className={`flex flex-row items-center justify-between pb-2 ${color}`}>
        <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
        <Icon className="h-4 w-4 text-white/80" />
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Input 
            type="number" 
            value={value} 
            onChange={(e) => onValueChange && onValueChange(parseInt(e.target.value, 10) || 0)} 
            className="text-lg font-bold h-8 px-2" 
          />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
};

interface ServerStatsProps {
  isAdmin?: boolean;
}

const ServerStats: React.FC<ServerStatsProps> = ({ isAdmin = false }) => {
  const [stats, setStats] = useState<ServerStatsType>({
    discordMembers: 181,
    partnerServers: 2,
    servers: 1,
    lastUpdated: new Date().toISOString()
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const serverStats = await fetchServerStats();
        console.log("Loaded server stats:", serverStats);
        setStats(serverStats);
      } catch (error) {
        console.error("Error loading server stats:", error);
      }
    };

    loadStats();
  }, []);

  const handleSaveStats = async () => {
    setIsLoading(true);
    try {
      const result = await updateServerStats(stats);
      
      if (result.success) {
        toast({
          title: "Erfolg",
          description: "Serverstatistiken erfolgreich aktualisiert"
        });
        setIsEditing(false);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error saving server stats:", error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Aktualisieren der Serverstatistiken",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueChange = (key: keyof ServerStatsType, value: number) => {
    setStats(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          {isEditing ? (
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Abbrechen
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleSaveStats}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                    Speichern...
                  </>
                ) : (
                  <>
                    <Save className="mr-1 h-4 w-4" />
                    Speichern
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(true)}
            >
              <Edit className="mr-1 h-4 w-4" />
              Bearbeiten
            </Button>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard 
          title="Discord Mitglieder" 
          value={stats.discordMembers} 
          icon={Users} 
          lastUpdated={stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString('de-DE') : 'Unbekannt'}
          className="border-t-4 border-t-blue-500 hover:translate-y-[-5px]"
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          isEditing={isEditing}
          onValueChange={(value) => handleValueChange('discordMembers', value)}
        />
        <StatCard 
          title="Partner Server" 
          value={stats.partnerServers} 
          icon={Share}
          lastUpdated={stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString('de-DE') : 'Unbekannt'}
          className="border-t-4 border-t-indigo-500 hover:translate-y-[-5px]"
          color="bg-gradient-to-r from-indigo-500 to-indigo-600"
          isEditing={isEditing}
          onValueChange={(value) => handleValueChange('partnerServers', value)}
        />
        <StatCard 
          title="Server" 
          value={stats.servers} 
          icon={Server}
          lastUpdated={stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString('de-DE') : 'Unbekannt'}
          className="border-t-4 border-t-purple-500 hover:translate-y-[-5px]"
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          isEditing={isEditing}
          onValueChange={(value) => handleValueChange('servers', value)}
        />
      </div>
    </div>
  );
};

export default ServerStats;
