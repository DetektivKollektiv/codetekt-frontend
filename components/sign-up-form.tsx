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
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  FunctionsHttpError,
  FunctionsRelayError,
  FunctionsFetchError,
} from '@supabase/supabase-js';

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError('Passwörter stimmen nicht überein');
      setIsLoading(false);
      return;
    }

    const { data, error: fnError } = await supabase.functions.invoke(
      'sign-up',
      {
        body: {
          email,
          password,
          username,
        },
      }
    );

    if (fnError) {
      if (fnError instanceof FunctionsHttpError) {
        const errorData = await fnError.context.json();
        setError(errorData.error || 'Registrierung fehlgeschlagen');
      } else if (fnError instanceof FunctionsRelayError) {
        setError('Netzwerkfehler. Bitte versuche es erneut.');
      } else if (fnError instanceof FunctionsFetchError) {
        setError('Server nicht erreichbar. Bitte überprüfe deine Verbindung.');
      } else {
        setError('Ein unerwarteter Fehler ist aufgetreten');
      }
      setIsLoading(false);
      return;
    }

    if (data?.error) {
      if (data.issues) {
        const firstIssue = data.issues[0];
        setError(firstIssue.message || data.error);
      } else {
        setError(data.error);
      }
      setIsLoading(false);
      return;
    }

    if (data.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }

    router.push('/protected');
    setIsLoading(false);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Registrieren</CardTitle>
          <CardDescription>Erstelle ein neues Konto</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Benutzername</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="meinbenutzername"
                  required
                  minLength={3}
                  maxLength={50}
                  pattern="[a-zA-Z0-9_\-]+"
                  title="Nur Buchstaben, Zahlen, Unterstriche und Bindestriche"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Passwort</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Passwort wiederholen</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Konto wird erstellt...' : 'Registrieren'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Hast du bereits ein Konto?{' '}
              <Link href="/auth/login" className="underline underline-offset-4">
                Anmelden
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
