import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, CheckCircle, User, Mail, MessageSquare, ShieldCheck, AlertTriangle, Trash2, Loader2, BadgeCheck, Copy, ClipboardList, FileText, UserCog, UserX } from "lucide-react"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { PopoverClose, PopoverOpen } from '@radix-ui/react-popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Announcement } from '@/lib/announcementService';
import AnnouncementsList from '@/components/AnnouncementsList';
import { fetchApplications } from '@/lib/adminService';
import { Badge } from '@/components/ui/badge';
import { getApplicationSeasons } from '@/lib/adminService';

interface ProfileData {
  id: string;
  username: string | null;
  avatar_url: string | null;
  roblox_id: string | null;
  discord_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  username_changed_at: string | null;
}

interface AuthLog {
  id: string;
  created_at: string;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: any | null;
}

interface IdChangeRequest {
  id: string;
  user_id: string;
  field_name: string;
  new_value: string;
  status: string;
  created_at: string;
  processed_at: string | null;
}

interface AccountDeletionRequest {
  id: string;
  user_id: string;
  reason: string;
  status: string;
  created_at: string;
  processed_at: string | null;
}

interface Application {
  id: string;
  user_id: string;
  roblox_username: string;
  roblox_id: string;
  discord_id: string;
  age: number;
  activity_level: number;
  admin_experience: string | null;
  other_servers: string | null;
  situation_handling: string;
  vdm_understanding: string;
  frp_understanding: string;
  bodycam_understanding: string;
  taschen_rp_understanding: string;
  server_age_understanding: string;
  friend_rule_violation: string;
  created_at: string;
  updated_at: string;
  status: string;
  notes: string | null;
}

interface ApplicationSeason {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [robloxId, setRobloxId] = useState('');
  const [discordId, setDiscordId] = useState('');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [idChangeRequests, setIdChangeRequests] = useState<IdChangeRequest[]>([]);
  const [accountDeletionRequest, setAccountDeletionRequest] = useState<AccountDeletionRequest | null>(null);
  const [isSubmittingDeletionRequest, setIsSubmittingDeletionRequest] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isSessionInvalidated, setIsSessionInvalidated] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false);
  const [applicationsData, setApplicationsData] = useState<Application[] | null>(null);
  const [applicationSeasons, setApplicationSeasons] = useState<ApplicationSeason[]>([]);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) {
            throw profileError;
          }

          setProfile(profileData);
          setUsername(profileData?.username || '');
          setAvatarUrl(profileData?.avatar_url || '');
          setRobloxId(profileData?.roblox_id || '');
          setDiscordId(profileData?.discord_id || '');

          const { data: authLogsData, error: authLogsError } = await supabase
            .from('auth_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

          if (authLogsError) {
            console.error('Error fetching auth logs:', authLogsError);
          } else {
            setAuthLogs(authLogsData || []);
          }

          const { data: idChangeRequestsData, error: idChangeRequestsError } = await supabase
            .from('id_change_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

          if (idChangeRequestsError) {
            console.error('Error fetching ID change requests:', idChangeRequestsError);
          } else {
            setIdChangeRequests(idChangeRequestsData || []);
          }

          const { data: accountDeletionRequestData, error: accountDeletionRequestError } = await supabase
            .from('account_deletion_requests')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (accountDeletionRequestError && accountDeletionRequestError.code !== 'PGRST116') {
            console.error('Error fetching account deletion request:', accountDeletionRequestError);
          } else {
            setAccountDeletionRequest(accountDeletionRequestData || null);
          }

          const applications = await fetchApplications();
          if (applications) {
            const userApplications = applications.filter(app => app.user_id === user.id);
            setApplicationsData(userApplications);
          }

          const seasons = await getApplicationSeasons();
          setApplicationSeasons(seasons);
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Fehler",
          description: error.message || "Profil konnte nicht geladen werden",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    setIsUsernameAvailable(null); // Reset availability status when the username changes

    // Basic validation: check if the username is at least 3 characters long
    if (newUsername.length < 3) {
      setIsUsernameAvailable(false);
      return;
    }

    // Debounce the username availability check
    const timerId = setTimeout(async () => {
      if (newUsername.trim() !== '') {
        const isAvailable = await checkUsernameAvailability(newUsername);
        setIsUsernameAvailable(isAvailable);
      }
    }, 500); // Wait for 500ms

    return () => clearTimeout(timerId); // Clear the timeout if the input changes
  };

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username);

      if (error) {
        console.error('Error checking username availability:', error);
        return false;
      }

      // If there are any rows with the given username, it's not available
      return data.length === 0 || profile?.username === username;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  };

  const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarUrl(e.target.value);
  };

  const handleRobloxIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRobloxId(e.target.value);
  };

  const handleDiscordIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDiscordId(e.target.value);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      if (!profile) {
        throw new Error('No profile found');
      }

      if (isUsernameAvailable === false) {
        toast({
          title: "Fehler",
          description: "Benutzername ist nicht verfügbar",
          variant: "destructive"
        });
        return;
      }

      const updates = {
        id: profile.id,
        username: username,
        avatar_url: avatarUrl,
        roblox_id: robloxId,
        discord_id: discordId,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) {
        throw error;
      }

      setProfile({ ...profile, ...updates });
      toast({
        title: "Erfolg",
        description: "Profil erfolgreich aktualisiert"
      });
    } catch (error: any) {
      console.error('Error updating the data!', error);
      toast({
        title: "Fehler",
        description: error.message || "Profil konnte nicht aktualisiert werden",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unbekannt';
    return format(parseISO(dateString), 'dd.MM.yyyy HH:mm', { locale: de });
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Fehler",
        description: "Abmeldung fehlgeschlagen",
        variant: "destructive"
      });
    }
  };

  const handleSubmitDeletionRequest = async () => {
    setIsSubmittingDeletionRequest(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('account_deletion_requests')
        .insert({
          user_id: user.id,
          reason: deletionReason,
          status: 'pending',
        });

      if (error) {
        throw error;
      }

      setAccountDeletionRequest({
        id: 'temp',
        user_id: user.id,
        reason: deletionReason,
        status: 'pending',
        created_at: new Date().toISOString(),
        processed_at: null,
      });
      toast({
        title: "Erfolg",
        description: "Löschantrag erfolgreich eingereicht",
      });
    } catch (error: any) {
      console.error('Error submitting deletion request:', error);
      toast({
        title: "Fehler",
        description: error.message || "Löschantrag konnte nicht eingereicht werden",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingDeletionRequest(false);
    }
  };

  const handleDeleteAccount = useCallback(async () => {
    setIsDeletingAccount(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Invalidate session
      const { error: invalidateError } = await supabase.auth.admin.invalidateUserAuth(user.id);

      if (invalidateError) {
        console.error('Error invalidating session:', invalidateError);
        throw invalidateError;
      }

      setIsSessionInvalidated(true);

      // Delete user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteError) {
        console.error('Error deleting user:', deleteError);
        throw deleteError;
      }

      toast({
        title: "Erfolg",
        description: "Konto erfolgreich gelöscht",
      });

      navigate('/register');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: "Fehler",
        description: error.message || "Konto konnte nicht gelöscht werden",
        variant: "destructive"
      });
    } finally {
      setIsDeletingAccount(false);
    }
  }, [navigate]);

  const handleCopyUserId = () => {
    if (profile?.id) {
      navigator.clipboard.writeText(profile.id)
        .then(() => {
          toast({
            title: "Erfolg",
            description: "Benutzer-ID in die Zwischenablage kopiert",
          });
        })
        .catch(err => {
          console.error("Failed to copy user ID: ", err);
          toast({
            title: "Fehler",
            description: "Benutzer-ID konnte nicht in die Zwischenablage kopiert werden",
            variant: "destructive"
          });
        });
    }
  };

  const applicationSchema = z.object({
    reason: z.string().min(10, {
      message: "Die Begründung muss mindestens 10 Zeichen lang sein.",
    }),
  })

  const form = useForm<z.infer<typeof applicationSchema>>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      reason: "",
    },
  })

  return (
    <div className="container mx-auto py-10">
      {loading ? (
        <div className="flex items-center justify-center p-8 w-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Profil</CardTitle>
              <CardDescription>
                Verwalte deine persönlichen Informationen und Einstellungen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={avatarUrl} alt={username || 'Profile'} />
                  <AvatarFallback>{username ? username[0].toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{username || 'Unbekannter Benutzer'}</h3>
                  <p className="text-sm text-gray-500">
                    Konto erstellt: {formatDate(profile?.created_at)}
                  </p>
                  <Button variant="ghost" size="sm" onClick={handleCopyUserId}>
                    <Copy className="h-4 w-4 mr-2" />
                    Benutzer-ID kopieren
                  </Button>
                  {profile?.id && (
                    <p className="text-sm text-gray-500">
                      <BadgeCheck className="h-3.5 w-3.5 mr-1 inline-block" />
                      ID: {profile.id}
                    </p>
                  )}
                </div>
              </div>
              <Separator />
              <div className="grid gap-2">
                <Label htmlFor="username">Benutzername</Label>
                <Input
                  type="text"
                  id="username"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="Benutzernamen eingeben"
                />
                {isUsernameAvailable === false && (
                  <p className="text-red-500 text-sm">Benutzername ist nicht verfügbar.</p>
                )}
                {isUsernameAvailable === true && username !== profile?.username && (
                  <p className="text-green-500 text-sm">Benutzername ist verfügbar!</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="avatarUrl">Avatar-URL</Label>
                <Input
                  type="text"
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={handleAvatarUrlChange}
                  placeholder="Avatar-URL eingeben"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="robloxId">Roblox-ID</Label>
                <Input
                  type="text"
                  id="robloxId"
                  value={robloxId}
                  onChange={handleRobloxIdChange}
                  placeholder="Roblox-ID eingeben"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discordId">Discord-ID</Label>
                <Input
                  type="text"
                  id="discordId"
                  value={discordId}
                  onChange={handleDiscordIdChange}
                  placeholder="Discord-ID eingeben"
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  'Profil speichern'
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Sitzungsverlauf</CardTitle>
              <CardDescription>
                Die letzten 5 Anmeldungen in deinem Konto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authLogs.length === 0 ? (
                <p className="text-gray-500">Keine Anmeldeaktivitäten gefunden.</p>
              ) : (
                <div className="space-y-3">
                  {authLogs.map((log) => (
                    <div key={log.id} className="border rounded-md p-3">
                      <p className="text-sm font-medium">
                        {log.event_type === 'SIGNED_IN' ? 'Angemeldet' : 'Abgemeldet'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Datum: {formatDate(log.created_at)}
                      </p>
                      <p className="text-xs text-gray-500">
                        IP-Adresse: {log.ip_address || 'Unbekannt'}
                      </p>
                      <p className="text-xs text-gray-500">
                        User-Agent: {log.user_agent || 'Unbekannt'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">ID Änderungsanträge</CardTitle>
              <CardDescription>
                Deine letzten 5 Anträge zur Änderung deiner Benutzerdaten.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {idChangeRequests.length === 0 ? (
                <p className="text-gray-500">Keine ID Änderungsanträge gefunden.</p>
              ) : (
                <div className="space-y-3">
                  {idChangeRequests.map((request) => (
                    <div key={request.id} className="border rounded-md p-3">
                      <p className="text-sm font-medium">
                        Feld: {request.field_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Neuer Wert: {request.new_value}
                      </p>
                      <p className="text-xs text-gray-500">
                        Status: {request.status}
                      </p>
                      <p className="text-xs text-gray-500">
                        Erstellt: {formatDate(request.created_at)}
                      </p>
                      {request.processed_at && (
                        <p className="text-xs text-gray-500">
                          Verarbeitet: {formatDate(request.processed_at)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Konto löschen</CardTitle>
              <CardDescription>
                Hier kannst du dein Konto löschen. Bitte beachte, dass diese Aktion unwiderruflich ist.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {accountDeletionRequest ? (
                <>
                  <div className="border rounded-md p-3">
                    <p className="text-sm font-medium">
                      Status: {accountDeletionRequest.status}
                    </p>
                    <p className="text-xs text-gray-500">
                      Begründung: {accountDeletionRequest.reason}
                    </p>
                    <p className="text-xs text-gray-500">
                      Erstellt: {formatDate(accountDeletionRequest.created_at)}
                    </p>
                    {accountDeletionRequest.processed_at && (
                      <p className="text-xs text-gray-500">
                        Verarbeitet: {formatDate(accountDeletionRequest.processed_at)}
                      </p>
                    )}
                  </div>
                  {accountDeletionRequest.status === 'pending' && (
                    <p className="text-yellow-500">
                      <AlertTriangle className="inline-block h-4 w-4 mr-1" />
                      Dein Löschantrag ist noch in Bearbeitung.
                    </p>
                  )}
                </>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmitDeletionRequest)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Begründung für die Löschung</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Warum möchtest du dein Konto löschen?"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Bitte gib eine kurze Begründung an, warum du dein Konto löschen möchtest.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isSubmittingDeletionRequest}>
                      {isSubmittingDeletionRequest ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Antrag einreichen...
                        </>
                      ) : (
                        'Löschantrag einreichen'
                      )}
                    </Button>
                  </form>
                </Form>
              )}
              <Separator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeletingAccount}>
                    Konto endgültig löschen
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Konto löschen</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bist du sicher, dass du dein Konto endgültig löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeletingAccount} className="bg-red-500 hover:bg-red-600">
                      {isDeletingAccount ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Löschen...
                        </>
                      ) : (
                        'Konto löschen'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {isSessionInvalidated && (
                <p className="text-green-500">
                  <CheckCircle className="inline-block h-4 w-4 mr-1" />
                  Die Sitzung wurde erfolgreich invalidiert.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Einstellungen</CardTitle>
              <CardDescription>
                Weitere Einstellungen für dein Konto.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" onClick={handleSignOut}>
                Abmelden
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Ankündigungen</CardTitle>
              <CardDescription>
                Hier findest du aktuelle Ankündigungen und Updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnnouncementsList selectedId={selectedAnnouncementId} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Bewerbungen</CardTitle>
              <CardDescription>
                Hier kannst du deine Bewerbungen einsehen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applicationsData ? true : false ? (
                <div className="space-y-3">
                  {applicationsData.map((application) => (
                    <div key={application.id} className="border rounded-md p-3">
                      <p className="text-sm font-medium">
                        Bewerbung vom: {formatDate(application.created_at)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Status: {application.status}
                      </p>
                      <p className="text-xs text-gray-500">
                        Roblox-Benutzername: {application.roblox_username}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Keine Bewerbungen gefunden.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Profile;
