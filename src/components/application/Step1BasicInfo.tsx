
import React, { useEffect, useState } from 'react';
import { useApplication } from '@/contexts/ApplicationContext';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

// Define the form schema with Zod - updated minimum age to 14
const step1Schema = z.object({
  roblox_username: z.string().min(1, { message: "Bitte gib deinen Roblox Benutzernamen ein." }),
  roblox_id: z.string().min(1, { message: "Bitte gib deine Roblox ID ein." }),
  discord_id: z.string().min(1, { message: "Bitte gib deine Discord ID ein." }),
  age: z.coerce
    .number({ required_error: "Bitte gib dein Alter ein.", invalid_type_error: "Bitte gib eine gültige Zahl ein." })
    .min(12, { message: "Du musst mindestens 12 Jahre alt sein." })
    .max(100, { message: "Bitte gib ein gültiges Alter ein." }),
  activity_level: z.coerce
    .number({ required_error: "Bitte schätze deine Aktivität ein.", invalid_type_error: "Bitte wähle eine Option." })
    .min(1, { message: "Bitte wähle eine Option." })
    .max(10, { message: "Bitte wähle eine Option." }),
});

type Step1FormData = z.infer<typeof step1Schema>;

interface Step1Props {
  onNext: () => void;
  userDiscordId: string;
  userRobloxId: string;
  userRobloxUsername: string;
}

const Step1BasicInfo: React.FC<Step1Props> = ({ 
  onNext, 
  userDiscordId, 
  userRobloxId, 
  userRobloxUsername 
}) => {
  const { applicationData, updateApplicationData, setIsUnder12 } = useApplication();
  const [ageWarning, setAgeWarning] = useState(false);

  const form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      roblox_username: userRobloxUsername || applicationData.robloxUsername,
      roblox_id: userRobloxId || applicationData.robloxId,
      discord_id: userDiscordId || applicationData.discordId,
      age: applicationData.age as number || undefined,
      activity_level: applicationData.activityLevel || 5,
    },
  });

  // Watch the age field to detect underage users
  const age = form.watch('age');
  
  useEffect(() => {
    if (typeof age === 'number' && age < 14) {
      setAgeWarning(true);
    } else {
      setAgeWarning(false);
    }
  }, [age]);

  const onSubmit = (data: Step1FormData) => {
    // Check if user is under 12, which is not allowed
    if (typeof data.age === 'number' && data.age < 12) {
      setIsUnder12(true);
      return;
    }
    
    updateApplicationData({
      robloxUsername: data.roblox_username,
      robloxId: data.roblox_id,
      discordId: data.discord_id,
      age: data.age,
      activityLevel: data.activity_level
    });
    
    onNext();
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="roblox_username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roblox Benutzername</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Dein Roblox Benutzername" 
                          {...field} 
                          value={field.value || userRobloxUsername}
                          className="pr-10"
                          readOnly={!!userRobloxUsername}
                        />
                        {userRobloxUsername && (
                          <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </FormControl>
                    {userRobloxUsername && (
                      <FormDescription>
                        Automatisch aus deinem Profil übernommen
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="roblox_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roblox ID</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Deine Roblox ID" 
                          {...field} 
                          value={field.value || userRobloxId}
                          className="pr-10"
                          readOnly={!!userRobloxId}
                        />
                        {userRobloxId && (
                          <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </FormControl>
                    {userRobloxId && (
                      <FormDescription>
                        Automatisch aus deinem Profil übernommen
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discord_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discord ID</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Deine Discord ID" 
                          {...field} 
                          value={field.value || userDiscordId}
                          className="pr-10"
                          readOnly={!!userDiscordId}
                        />
                        {userDiscordId && (
                          <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </FormControl>
                    {userDiscordId && (
                      <FormDescription>
                        Automatisch aus deinem Profil übernommen
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alter</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="12" 
                        max="100" 
                        placeholder="Dein Alter" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          // Reset the under-12 flag when they change their age
                          if (parseInt(e.target.value) >= 12) {
                            setIsUnder12(false);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {ageWarning && (
              <Alert className="bg-yellow-50 border-yellow-300 text-yellow-800">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle>Bitte überprüfe dein Alter</AlertTitle>
                <AlertDescription>
                  Das Mindestalter für Moderatoren beträgt 14 Jahre. Bitte überprüfe, ob du dein Alter korrekt angegeben hast.
                </AlertDescription>
              </Alert>
            )}
            
            <FormField
              control={form.control}
              name="activity_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wie aktiv schätzt du dich auf einer Skala von 1-10 ein?</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="flex justify-between px-1">
                        <span className="text-gray-500 text-sm">Wenig aktiv</span>
                        <span className="text-gray-500 text-sm">Sehr aktiv</span>
                      </div>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                        className="flex justify-between items-center"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <div key={num} className="flex flex-col items-center gap-1">
                            <RadioGroupItem 
                              value={num.toString()} 
                              id={`activity-${num}`} 
                              className={`h-10 w-10 rounded-lg transition-all ${field.value === num ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}
                            />
                            <Label 
                              htmlFor={`activity-${num}`}
                              className={`text-sm font-medium ${field.value === num ? 'text-blue-600' : 'text-gray-600'}`}
                            >
                              {num}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700"
            >
              Weiter
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default Step1BasicInfo;
