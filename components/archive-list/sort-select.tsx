'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FC, useEffect } from 'react';

export type GenericSortOption = {
  key: string;
  label: string;
};

export interface ArchiveListSortSelectProps {
  sortOptions: GenericSortOption[];
  value: string;
  onValueChange: (value: string) => void;
  storageKey: string;
  className?: string;
}

export const ArchiveListSortSelect: FC<ArchiveListSortSelectProps> = ({
  sortOptions,
  value,
  onValueChange,
  storageKey,
  className,
}) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, value);
    }
  }, [value, storageKey]);

  return (
    <div className={className}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[200px]" aria-label="Sortierung auswählen">
          <SelectValue placeholder="Sortierung wählen" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map(({ key, label }) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export function getSavedSortPreference(
  storageKey: string,
  validKeys: string[]
): string | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(storageKey);
  return saved && validKeys.includes(saved) ? saved : null;
}
