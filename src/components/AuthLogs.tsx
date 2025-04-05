
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Laptop, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LoaderIcon } from 'lucide-react';

interface AuthLog {
  id: string;
  created_at: string;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: any | null;
}

const AuthLogs = () => {
  const [logs, setLogs] = useState<AuthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthLogs = async () => {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) {
          setError("Nicht angemeldet");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.rpc('get_recent_auth_logs', {
          user_id_param: user.id
        });

        if (error) throw error;
        setLogs(data || []);
      } catch (err: any) {
        console.error('Error fetching auth logs:', err);
        setError(err.message || "Fehler beim Laden der Login-Daten");
      } finally {
        setLoading(false);
      }
    };

    fetchAuthLogs();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'login':
        return 'Anmeldung';
      case 'logout':
        return 'Abmeldung';
      case 'signup':
        return 'Registrierung';
      case 'password_recovery':
        return 'Passwort zurückgesetzt';
      default:
        return type;
    }
  };

  const getBrowserInfo = (userAgent: string) => {
    if (!userAgent) return 'Unbekannt';
    
    // Simple browser detection
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('MSIE') || userAgent.includes('Trident')) return 'Internet Explorer';
    
    return 'Unbekannter Browser';
  };

  const getDeviceInfo = (userAgent: string) => {
    if (!userAgent) return 'Unbekannt';
    
    // Simple device detection
    if (userAgent.includes('Mobile')) return 'Mobilgerät';
    if (userAgent.includes('Tablet')) return 'Tablet';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux';
    
    return 'Desktop';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Login-Aktivitäten</CardTitle>
          <CardDescription>Lade deine letzten Login-Aktivitäten...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Login-Aktivitäten</CardTitle>
          <CardDescription>Deine letzten Login-Aktivitäten</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login-Aktivitäten</CardTitle>
        <CardDescription>Deine letzten 5 Login-Aktivitäten</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center p-4 text-sm text-muted-foreground">
            Keine Login-Aktivitäten gefunden
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-sm">{getEventTypeLabel(log.event_type)}</span>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(log.created_at)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center">
                    <Laptop className="h-3 w-3 mr-1.5 text-blue-500" />
                    {log.user_agent ? (
                      <span>
                        {getBrowserInfo(log.user_agent)} / {getDeviceInfo(log.user_agent)}
                      </span>
                    ) : (
                      <span>Unbekanntes Gerät</span>
                    )}
                  </div>
                  {log.ip_address && (
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1.5 text-blue-500" />
                      <span>{log.ip_address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 text-xs text-muted-foreground">
          Info: Es werden immer nur die letzten 5 Login-Aktivitäten gespeichert.
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthLogs;
