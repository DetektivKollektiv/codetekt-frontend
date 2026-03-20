'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [username, setUsername] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [legalErrors, setLegalErrors] = useState<{
    privacy?: string;
    terms?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setLegalErrors({});

    if (password !== repeatPassword) {
      setError('Passwörter stimmen nicht überein');
      setIsLoading(false);
      return;
    }

    if (!privacyAccepted || !termsAccepted) {
      setLegalErrors({
        privacy: !privacyAccepted
          ? 'Du musst die Datenschutzerklärung akzeptieren'
          : undefined,
        terms: !termsAccepted
          ? 'Du musst die Nutzungsbedingungen akzeptieren'
          : undefined,
      });
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
          legal: {
            privacy: privacyAccepted,
            terms: termsAccepted,
          },
        },
      },
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

    router.push('/auth/sign-up-success');
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
                  autoComplete="email"
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
                  autoComplete="username"
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
                  autoComplete="new-password"
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
                  autoComplete="new-password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    id="privacy"
                    checked={privacyAccepted}
                    onCheckedChange={(checked) =>
                      setPrivacyAccepted(checked === true)
                    }
                    className={cn(
                      'bg-background',
                      legalErrors.privacy && 'border-red-500',
                    )}
                    disabled={isLoading}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label htmlFor="privacy" className="text-sm cursor-pointer">
                      Ich stimme den Bedingungen der{' '}
                      <Link
                        href="https://codetekt.org/datenschutz/"
                        className="underline underline-offset-4 hover:text-primary"
                        target="_blank"
                      >
                        Datenschutzerklärung
                      </Link>{' '}
                      zu
                    </label>
                    {legalErrors.privacy && (
                      <p className="text-sm text-red-500" role="alert">
                        {legalErrors.privacy}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) =>
                      setTermsAccepted(checked === true)
                    }
                    className={cn(
                      'bg-background',
                      legalErrors.terms && 'border-red-500',
                    )}
                    disabled={isLoading}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label htmlFor="terms" className="text-sm cursor-pointer">
                      Ich stimme den{' '}
                      <Link
                        href="/nutzungsbedingungen"
                        className="underline underline-offset-4 hover:text-primary"
                        target="_blank"
                      >
                        Nutzungsbedingungen
                      </Link>{' '}
                      zu
                    </label>
                    {legalErrors.terms && (
                      <p className="text-sm text-red-500" role="alert">
                        {legalErrors.terms}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !privacyAccepted || !termsAccepted}
              >
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
