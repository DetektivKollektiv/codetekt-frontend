'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

import { FC } from 'react';

interface UserSettingsProps {}

const UserSettings: FC<UserSettingsProps> = ({}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Einstellungen</CardTitle>
        <CardDescription>
          Gib deine E-Mail-Adresse ein, um dich anzumelden
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={() => {}}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={'email'}
                onChange={(e) => {}}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Passwort</Label>
                <Link
                  href="/auth/forgot-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Passwort vergessen?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={'password'}
                onChange={(e) => {}}
              />
            </div>
            {/* {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
              </Button> */}
          </div>
          <div className="mt-4 text-center text-sm">
            Hast du noch kein Konto?{' '}
            <Link href="/auth/sign-up" className="underline underline-offset-4">
              Registrieren
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserSettings;
