import { User } from '@supabase/supabase-js';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Tables } from './types/database.types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDisplayName(
  profile: Tables<'profiles'> | null,
  user: User | null,
) {
  return profile?.username || user?.email || 'Account';
}

export const getLocalDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
