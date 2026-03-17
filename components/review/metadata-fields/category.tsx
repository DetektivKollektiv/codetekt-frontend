'use client';

import { FieldContainer } from '@/components/review/fields/field-container';
import { Button } from '@/components/ui/button';
import { CASE_CATEGORY_OPTIONS } from '@/lib/constants';
import { CaseCategoryValue } from '@/lib/schemas/case-metadata-schemas';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { FC, useState } from 'react';
import { $ZodIssue } from 'zod/v4/core';

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
  const [selected, setSelected] = useState<CaseCategoryValue | null>(
    (value as CaseCategoryValue | null) ?? null,
  );
  const issue = issues[0] ?? null;
  const isDisabled = isSaving || (isComplete && !!value);

  return (
    <FieldContainer
      title="Welche Kategorie trifft auf diesen Fall zu?"
      isDisputable={isComplete && !!value}
      onCreateReviewDispute={() => onCreateDispute?.()}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {CASE_CATEGORY_OPTIONS.map((option) => {
            const isSelected = selected === option.id;
            return (
              <button
                key={option.id}
                type="button"
                disabled={isDisabled}
                onClick={() => setSelected(option.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-body-md md:text-body-sm font-medium transition-all h-9',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-background text-foreground hover:bg-accent',
                  isDisabled && 'cursor-not-allowed opacity-60',
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
          disabled={isDisabled || !selected}
        >
          {isSaving ? 'Wird gespeichert...' : 'Bestätigen'}
        </Button>
      </div>
    </FieldContainer>
  );
};

export default Category;
