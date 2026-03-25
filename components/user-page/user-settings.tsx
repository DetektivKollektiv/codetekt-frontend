'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { deactivateAccountMutation } from '@/lib/queries/deactivateAccount';
import { updateProfileMutation } from '@/lib/queries/updateProfile';
import { updateUserEmailMutation } from '@/lib/queries/updateUserEmail';
import { createClient } from '@/lib/supabase/client';
import { getAuth } from '@/lib/supabase/getAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UserSettingsProps {
  auth: Awaited<ReturnType<typeof getAuth>>;
}

const UserSettings: FC<UserSettingsProps> = ({ auth }) => {
  const supabase = createClient();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: authData } = useQuery({
    queryFn: () => getAuth(supabase),
    queryKey: ['auth'],
    initialData: auth,
  });

  const { profile, user } = authData;

  const [email, setEmail] = useState(user?.email || '');
  const [getNotifications, setGetNotifications] = useState(
    profile?.get_notifications ?? false,
  );
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [deactivateConfirmation, setDeactivateConfirmation] = useState('');

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
        'E-Mail-Adresse erfolgreich aktualisiert. Bitte überprüfe dein Postfach zur Bestätigung.',
      );
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (err: Error) => {
      toast.error(
        err.message || 'Fehler beim Aktualisieren der E-Mail-Adresse',
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

  const deactivateMutation = useMutation({
    ...deactivateAccountMutation(supabase),
    onSuccess: async () => {
      toast.success('Dein Konto wurde deaktiviert und anonymisiert.');
      setDeactivateConfirmation('');
      setIsDeactivateDialogOpen(false);
      await supabase.auth.signOut();
      await queryClient.clear();
      router.push('/auth/login');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Fehler beim Deaktivieren des Kontos');
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

  const handleDeactivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deactivateConfirmation !== 'DEAKTIVIEREN') {
      toast.error('Bitte gib DEAKTIVIEREN ein, um fortzufahren.');
      return;
    }

    deactivateMutation.mutate({ confirmation: 'DEAKTIVIEREN' });
  };

  const isLoading =
    emailMutation.isPending ||
    profileMutation.isPending ||
    deactivateMutation.isPending;

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
                  Erhalte E-Mail-Benachrichtigungen sobald es Updates zu einem
                  deiner Fälle gibt
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

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div className="grid gap-1">
              <p className="text-sm font-medium">Konto deaktivieren</p>
              <p className="text-xs text-muted-foreground">
                Dein Konto wird gesperrt und als Deaktivierter Account
                anonymisiert.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              disabled={isLoading || !user}
              onClick={() => setIsDeactivateDialogOpen(true)}
            >
              Konto deaktivieren
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog
        open={isDeactivateDialogOpen}
        onOpenChange={(open) => {
          setIsDeactivateDialogOpen(open);
          if (!open) {
            setDeactivateConfirmation('');
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleDeactivateAccount}>
            <DialogHeader>
              <DialogTitle>Konto endgültig deaktivieren?</DialogTitle>
              <DialogDescription>
                Gib zur Bestätigung DEAKTIVIEREN ein. Du kannst dich danach
                nicht mehr anmelden.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2 py-4">
              <Label htmlFor="deactivate-confirmation">Bestätigung</Label>
              <Input
                id="deactivate-confirmation"
                value={deactivateConfirmation}
                onChange={(e) => setDeactivateConfirmation(e.target.value)}
                placeholder="DEAKTIVIEREN"
                disabled={deactivateMutation.isPending}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeactivateDialogOpen(false)}
                disabled={deactivateMutation.isPending}
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={
                  deactivateMutation.isPending ||
                  deactivateConfirmation !== 'DEAKTIVIEREN'
                }
              >
                {deactivateMutation.isPending
                  ? 'Wird deaktiviert...'
                  : 'Konto deaktivieren'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserSettings;
