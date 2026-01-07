'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FC, useEffect } from 'react';

export type SortField = 'newest_first' | 'last_updated';

const SORT_OPTIONS: Record<SortField, string> = {
  newest_first: 'Neuste zuerst',
  last_updated: 'Zuletzt geupdated',
};

const SORT_PREFERENCE_KEY = 'archive-sort-preference';

export interface ArchiveListSortSelectProps {
  value: SortField;
  onValueChange: (value: SortField) => void;
  className?: string;
}

export const ArchiveListSortSelect: FC<ArchiveListSortSelectProps> = ({
  value,
  onValueChange,
  className,
}) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SORT_PREFERENCE_KEY, value);
    }
  }, [value]);

  const handleValueChange = (newValue: string) => {
    onValueChange(newValue as SortField);
  };

  return (
    <div className={className}>
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[200px]" aria-label="Sortierung auswählen">
          <SelectValue placeholder="Sortierung wählen" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SORT_OPTIONS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export function getSavedSortPreference(): SortField | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(SORT_PREFERENCE_KEY);
  return saved && saved in SORT_OPTIONS ? (saved as SortField) : null;
}
