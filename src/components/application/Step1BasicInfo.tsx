import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight } from 'lucide-react';
import { useApplication } from '@/contexts/ApplicationContext';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Step1Props {
  onNext: () => void;
  userDiscordId: string;
  userRobloxId: string;
  userRobloxUsername: string;
}

const Step1BasicInfo = ({ onNext, userDiscordId, userRobloxId, userRobloxUsername }: Step1Props) => {
  const { applicationData, updateApplicationData } = useApplication();
  const [loading, setLoading] = useState(false);
  const [discordIdValue, setDiscordIdValue] = useState(userDiscordId || applicationData.discordId || '');
  const [robloxIdValue, setRobloxIdValue] = useState(userRobloxId || applicationData.robloxId || '');
  const [robloxUsernameValue, setRobloxUsernameValue] = useState(userRobloxUsername || applicationData.robloxUsername || '');
  const [age, setAge] = useState<number | undefined>(applicationData.age);
  const [activityLevel, setActivityLevel] = useState(applicationData.activityLevel || 1);
  const [showUnderageConfirm, setShowUnderageConfirm] = useState(false);

  const validateFields = () => {
    if (!discordIdValue.trim() || !robloxIdValue.trim() || !robloxUsernameValue.trim() || !age) {
      return 'Bitte fülle alle Felder aus.';
    }

    if (age <= 0 || age > 99) {
      return 'Bitte gib ein gültiges Alter an.';
    }

    return null;
  };

  const handleSubmit = () => {
    // Check if the applicant is under 14
    if (age !== undefined && age < 14) {
      setShowUnderageConfirm(true);
      return;
    }
    
    const validationError = validateFields();
    if (validationError) {
      alert(validationError);
      return;
    }

    setLoading(true);
    
    // Update application data
    updateApplicationData({
      discordId: discordIdValue,
      robloxId: robloxIdValue,
      robloxUsername: robloxUsernameValue,
      age: age as number,
      activityLevel,
      isUnder12: false, // Set to false by default
    });
    
    onNext();
  };

  const handleUnderageConfirm = () => {
    setShowUnderageConfirm(false);
    
    // If age is under 12, mark the application
    if (age !== undefined && age < 12) {
      updateApplicationData({
        discordId: discordIdValue,
        robloxId: robloxIdValue,
        robloxUsername: robloxUsernameValue,
        age: age,
        activityLevel,
        isUnder12: true,
      });
    } else {
      // For ages 12-13, continue normally
      updateApplicationData({
        discordId: discordIdValue,
        robloxId: robloxIdValue,
        robloxUsername: robloxUsernameValue,
        age: age as number,
        activityLevel,
        isUnder12: false,
      });
      onNext();
    }
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ageValue = parseInt(e.target.value);
    if (!isNaN(ageValue)) {
      setAge(ageValue);
    } else {
      setAge(0); // Default to 0 if parsing fails
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="discord-id">Discord ID</Label>
        <Input
          id="discord-id"
          placeholder="Deine Discord ID"
          value={discordIdValue}
          onChange={(e) => setDiscordIdValue(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="roblox-id">Roblox ID</Label>
        <Input
          id="roblox-id"
          placeholder="Deine Roblox ID"
          value={robloxIdValue}
          onChange={(e) => setRobloxIdValue(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="roblox-username">Roblox Benutzername</Label>
        <Input
          id="roblox-username"
          placeholder="Dein Roblox Benutzername"
          value={robloxUsernameValue}
          onChange={(e) => setRobloxUsernameValue(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="age">Alter</Label>
        <Input
          id="age"
          type="number"
          placeholder="Dein Alter"
          value={age === undefined ? '' : age.toString()}
          onChange={handleAgeChange}
        />
      </div>
      <div>
        <Label htmlFor="activity-level">Wie aktiv bist du auf dem Server? (1-5)</Label>
        <input
          type="range"
          min="1"
          max="5"
          value={activityLevel}
          onChange={(e) => setActivityLevel(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <p className="text-sm text-gray-500">Aktuelles Level: {activityLevel}</p>
      </div>
      
      {/* Age Confirmation Dialog */}
      {showUnderageConfirm && (
        <AlertDialog open={showUnderageConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Altersbestätigung</AlertDialogTitle>
              <AlertDialogDescription>
                Du hast angegeben, dass du unter 14 Jahre alt bist. Bitte bestätige, dass diese Angabe korrekt ist.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowUnderageConfirm(false)}>
                Zurück
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleUnderageConfirm}>
                Bestätigen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      <div className="pt-6 flex justify-end">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird geladen...
            </>
          ) : (
            <>
              Weiter
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Step1BasicInfo;
