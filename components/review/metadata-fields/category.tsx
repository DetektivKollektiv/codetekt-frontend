'use client';

import { FieldContainer } from '@/components/review/fields/field-container';
import { Button } from '@/components/ui/button';
import { CaseCategoryValue } from '@/lib/schemas/case-metadata-schemas';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { FC, useState } from 'react';
import { $ZodIssue } from 'zod/v4/core';

const CATEGORY_OPTIONS: { id: CaseCategoryValue; text: string }[] = [
  { id: 'satire', text: 'Satire' },
  { id: 'report', text: 'Bericht' },
  { id: 'text_message', text: 'Textnachricht' },
  { id: 'opinion', text: 'Meinung' },
];

interface CategoryProps {
  value?: string | null;
  isComplete: boolean;
  onSave: (val: CaseCategoryValue) => void;
  isSaving: boolean;
  onCreateDispute?: () => void;
  issues: $ZodIssue[];
}

const Category: FC<CategoryProps> = ({
  value,
  isComplete,
  onSave,
  isSaving,
  onCreateDispute,
  issues,
}) => {
  const [selected, setSelected] = useState<CaseCategoryValue | null>(null);
  const issue = issues[0] ?? null;

  const displayLabel =
    CATEGORY_OPTIONS.find((o) => o.id === value)?.text ?? value;

  if (isComplete && value) {
    return (
      <FieldContainer
        title="Welche Kategorie trifft auf diesen Fall zu?"
        isDisputable={true}
        onCreateReviewDispute={() => onCreateDispute?.()}
      >
        <p className="text-body-md text-foreground">{displayLabel}</p>
      </FieldContainer>
    );
  }

  return (
    <FieldContainer
      title="Welche Kategorie trifft auf diesen Fall zu?"
      isDisputable={false}
      onCreateReviewDispute={() => {}}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((option) => {
            const isSelected = selected === option.id;
            return (
              <button
                key={option.id}
                type="button"
                disabled={isSaving}
                onClick={() => setSelected(option.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-body-md md:text-body-sm font-medium transition-all h-9',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-background text-foreground hover:bg-accent',
                  isSaving && 'cursor-not-allowed opacity-60',
                  issue && !isSelected && 'border-destructive',
                )}
              >
                {isSelected ? (
                  <span className="flex size-4 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                ) : (
                  <span className="flex size-5 items-center justify-center rounded-full border-2 border-muted-foreground/30" />
                )}
                {option.text}
              </button>
            );
          })}
        </div>
        {issue && <p className="text-sm text-destructive">{issue.message}</p>}
        <Button
          className="w-full"
          onClick={() => selected && onSave(selected)}
          disabled={isSaving || !selected}
        >
          {isSaving ? 'Wird gespeichert...' : 'Bestätigen'}
        </Button>
      </div>
    </FieldContainer>
  );
};

export default Category;
