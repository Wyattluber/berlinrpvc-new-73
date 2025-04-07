
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const CancelDeletion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setcancelLoading] = useState(false);
  const [continueLoading, setContinueLoading] = useState(false);
  const [deletionInfo, setDeletionInfo] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  useEffect(() => {
    const checkDeletionStatus = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }
        
        const { data, error } = await supabase
          .from('account_deletion_requests')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'pending')
          .single();
        
        if (error) {
          // If no deletion request is found, redirect to profile
          navigate('/profile');
          return;
        }
        
        setDeletionInfo(data);
        
        // Check time remaining
        if (data.scheduled_deletion) {
          const deletionTime = new Date(data.scheduled_deletion).getTime();
          const currentTime = new Date().getTime();
          const remainingMs = deletionTime - currentTime;
          
          if (remainingMs <= 0) {
            // Account should already be deleted, log out
            await supabase.auth.signOut();
            navigate('/login');
            return;
          }
          
          // Calculate hours and minutes
          const hours = Math.floor(remainingMs / (1000 * 60 * 60));
          const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours} Stunden und ${minutes} Minuten`);
          
          // Update timer every minute
          const interval = setInterval(() => {
            const newCurrentTime = new Date().getTime();
            const newRemainingMs = deletionTime - newCurrentTime;
            
            if (newRemainingMs <= 0) {
              clearInterval(interval);
              setTimeLeft('0 Minuten');
              return;
            }
            
            const newHours = Math.floor(newRemainingMs / (1000 * 60 * 60));
            const newMinutes = Math.floor((newRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${newHours} Stunden und ${newMinutes} Minuten`);
          }, 60000);
          
          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error('Error checking deletion status:', error);
        toast({
          title: "Fehler",
          description: "Es gab ein Problem beim Abrufen deines Löschungsantrags.",
          variant: "destructive"
        });
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };
    
    checkDeletionStatus();
  }, [navigate]);
  
  const handleCancelDeletion = async () => {
    try {
      setcancelLoading(true);
      
      const { error } = await supabase
        .from('account_deletion_requests')
        .update({ status: 'cancelled' })
        .eq('id', deletionInfo.id);
      
      if (error) throw error;
      
      toast({
        title: "Löschung abgebrochen",
        description: "Dein Konto wird nicht mehr gelöscht."
      });
      
      navigate('/profile');
    } catch (error) {
      console.error('Error cancelling deletion:', error);
      toast({
        title: "Fehler",
        description: "Die Löschung konnte nicht abgebrochen werden.",
        variant: "destructive"
      });
    } finally {
      setcancelLoading(false);
    }
  };
  
  const handleContinueDeletion = async () => {
    try {
      setContinueLoading(true);
      
      // Just log out, the deletion will proceed automatically
      await supabase.auth.signOut();
      
      toast({
        title: "Abgemeldet",
        description: "Du wurdest abgemeldet. Dein Konto wird wie geplant gelöscht."
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Error during sign out:', error);
      toast({
        title: "Fehler",
        description: "Es gab ein Problem beim Abmelden.",
        variant: "destructive"
      });
    } finally {
      setContinueLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white mt-16">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-xl text-gray-600">Lade Informationen...</p>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white mt-16">
        <Card className="max-w-md w-full shadow-lg border-red-200">
          <CardHeader className="space-y-1 bg-gradient-to-r from-red-50 to-orange-50 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center text-red-900">Kontolöschung im Gange</CardTitle>
            <CardDescription className="text-center text-red-700">
              Dein Konto wird in {timeLeft} gelöscht
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-4">
            <p className="text-gray-800">
              Du hast die Löschung deines Kontos beantragt. Wenn du deine Meinung geändert hast, kannst du die Löschung jetzt noch abbrechen.
            </p>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
              <p className="font-semibold">Wichtig:</p>
              <p className="text-sm mt-1">Wenn du die Löschung nicht abbrichst, werden alle deine Daten nach Ablauf der Frist unwiderruflich gelöscht.</p>
            </div>
            
            <div className="flex flex-col space-y-3 mt-6">
              <Button
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                onClick={handleCancelDeletion}
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Abbrechen...
                  </>
                ) : (
                  "Löschung abbrechen und Konto behalten"
                )}
              </Button>
              
              <Button
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                onClick={handleContinueDeletion}
                disabled={continueLoading}
              >
                {continueLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Abmelden...
                  </>
                ) : (
                  "Löschung fortsetzen und abmelden"
                )}
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="bg-gradient-to-r from-red-50 to-orange-50 rounded-b-lg">
            <p className="w-full text-xs text-center text-gray-600">
              BerlinRP-VC • Datenschutz und Sicherheit
            </p>
          </CardFooter>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default CancelDeletion;
