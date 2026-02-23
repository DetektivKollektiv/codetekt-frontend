'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { updateProfileMutation } from '@/lib/queries/updateProfile';
import { updateUserEmailMutation } from '@/lib/queries/updateUserEmail';
import { createClient } from '@/lib/supabase/client';
import { getAuth } from '@/lib/supabase/getAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UserSettingsProps {
  auth: Awaited<ReturnType<typeof getAuth>>;
}

const UserSettings: FC<UserSettingsProps> = ({ auth }) => {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: authData } = useQuery({
    queryFn: () => getAuth(supabase),
    queryKey: ['auth'],
    initialData: auth,
  });

  const { profile, user } = authData;

  const [email, setEmail] = useState(user?.email || '');
  const [getNotifications, setGetNotifications] = useState(
    profile?.get_notifications ?? false
  );

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  useEffect(() => {
    if (profile?.get_notifications !== undefined) {
      setGetNotifications(profile.get_notifications);
    }
  }, [profile?.get_notifications]);

  // Update email mutation
  const emailMutation = useMutation({
    ...updateUserEmailMutation(supabase),
    onSuccess: () => {
      toast.success(
        'E-Mail-Adresse erfolgreich aktualisiert. Bitte überprüfe dein Postfach zur Bestätigung.'
      );
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
    onError: (err: Error) => {
      toast.error(
        err.message || 'Fehler beim Aktualisieren der E-Mail-Adresse'
      );
    },
  });

  // Update profile mutation
  const profileMutation = useMutation({
    ...updateProfileMutation(supabase, user?.id ?? ''),
    onSuccess: () => {
      toast.success('Benachrichtigungseinstellungen erfolgreich aktualisiert.');
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Fehler beim Aktualisieren der Einstellungen');
    },
  });

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || email === user.email) {
      toast.error('Die E-Mail-Adresse ist bereits aktuell.');
      return;
    }
    emailMutation.mutate({ email });
  };

  const handleNotificationToggle = async (checked: boolean) => {
    setGetNotifications(checked);
    profileMutation.mutate({ get_notifications: checked });
  };

  const isLoading = emailMutation.isPending || profileMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Einstellungen</CardTitle>
        <CardDescription>
          Verwalte deine Konto- und Benachrichtigungseinstellungen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {/* Email Settings */}
          <form onSubmit={handleEmailSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">E-Mail-Adresse</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || !user}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !user || email === user?.email}
                >
                  {emailMutation.isPending ? 'Wird gespeichert...' : 'Ändern'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Nach dem Ändern der E-Mail-Adresse erhältst du eine
                Bestätigungs-E-Mail.
              </p>
            </div>
          </form>

          {/* Notification Settings */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">
                  Benachrichtigungen erhalten
                </Label>
                <p className="text-xs text-muted-foreground">
                  Erhalte E-Mail-Benachrichtigungen über Updates und Updates
                  deiner Fälle
                </p>
              </div>
              <Switch
                id="notifications"
                checked={getNotifications}
                onCheckedChange={handleNotificationToggle}
                disabled={isLoading || !user}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSettings;
