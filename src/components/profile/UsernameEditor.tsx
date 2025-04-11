
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateUsername, isUsernameTaken, checkUsernameCooldown } from '@/lib/usernameValidation';

interface UsernameEditorProps {
  currentUsername: string;
  userId: string;
  lastChanged: Date | null;
  onUsernameUpdated: (newUsername: string) => void;
}

const UsernameEditor: React.FC<UsernameEditorProps> = ({
  currentUsername,
  userId,
  lastChanged,
  onUsernameUpdated
}) => {
  const [username, setUsername] = useState(currentUsername);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check cooldown on load
  const [cooldown, setCooldown] = useState({
    canChange: true,
    daysRemaining: 0,
    nextChangeDate: null as Date | null
  });
  
  useEffect(() => {
    if (lastChanged) {
      setCooldown(checkUsernameCooldown(lastChanged));
    }
  }, [lastChanged]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === currentUsername) {
      setIsEditing(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate username
      const validation = await validateUsername(username);
      if (!validation.valid) {
        setError(validation.reason || 'Ungültiger Benutzername');
        setIsLoading(false);
        return;
      }
      
      // Check if username is taken
      const taken = await isUsernameTaken(username);
      if (taken) {
        setError('Dieser Benutzername ist bereits vergeben');
        setIsLoading(false);
        return;
      }
      
      // Update username in the database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          username,
          username_changed_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update successful
      onUsernameUpdated(username);
      setIsEditing(false);
      toast({
        title: 'Benutzername aktualisiert',
        description: `Dein Benutzername wurde auf "${username}" geändert.`,
      });
      
      // Update cooldown
      setCooldown(checkUsernameCooldown(new Date()));
    } catch (err: any) {
      setError('Fehler beim Aktualisieren des Benutzernamens: ' + (err.message || 'Unbekannter Fehler'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const startEditing = () => {
    if (!cooldown.canChange) {
      toast({
        title: 'Benutzername kann nicht geändert werden',
        description: `Du kannst deinen Benutzernamen erst in ${cooldown.daysRemaining} Tagen wieder ändern.`,
        variant: 'destructive'
      });
      return;
    }
    
    setIsEditing(true);
  };
  
  const cancelEditing = () => {
    setUsername(currentUsername);
    setIsEditing(false);
    setError(null);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username">Benutzername</Label>
            {isEditing ? (
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Dein Benutzername"
                disabled={isLoading}
                className="mb-2"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <div className="bg-gray-100 px-3 py-2 rounded-md text-gray-800 font-medium w-full">
                  {currentUsername}
                </div>
              </div>
            )}
            
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            
            {!cooldown.canChange && !isEditing && (
              <p className="text-sm text-amber-600">
                Du kannst deinen Benutzernamen erst wieder in {cooldown.daysRemaining} Tagen ändern.
              </p>
            )}
            
            <div className="flex justify-end space-x-2 mt-2">
              {isEditing ? (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={cancelEditing}
                    disabled={isLoading}
                  >
                    Abbrechen
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isLoading || username === ''}
                  >
                    {isLoading ? 'Wird gespeichert...' : 'Speichern'}
                  </Button>
                </>
              ) : (
                <Button 
                  type="button" 
                  onClick={startEditing}
                  disabled={!cooldown.canChange}
                >
                  Ändern
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UsernameEditor;
