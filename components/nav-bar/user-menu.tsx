'use client';

import Link from 'next/link';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import { Tables } from '@/lib/types/database.types-generated';
import { User } from '@supabase/supabase-js';

function getDisplayName(profile: Tables<'profiles'> | null, user: User | null) {
  return profile?.username || user?.email || 'Account';
}

export default function UserMenu({
  user,
  profile,
  onLogout,
}: {
  user: User;
  profile: Tables<'profiles'> | null;
  onLogout: () => void;
}) {
  const name = getDisplayName(profile, user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-3">
          <span className="hidden md:block text-body-md font-medium">
            Hi {name}!
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="text-body-md font-medium">{name}</div>
          {user.email && (
            <div className="text-meta text-muted-foreground">{user.email}</div>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-body-md" asChild>
          <Link href="#">Profil</Link>
        </DropdownMenuItem>

        <DropdownMenuItem className="text-body-md" asChild>
          <Link href="#">Rangliste</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onLogout}
          className="text-destructive focus:text-destructive text-body-md font-bold"
          variant="destructive"
        >
          Abmelden
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
