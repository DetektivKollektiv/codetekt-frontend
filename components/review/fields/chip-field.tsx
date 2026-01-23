'use client';

import { Label } from '@/components/ui/label';
import { chipFieldSchema, Field } from '@/lib/schemas/field-schemas';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { FC, useMemo } from 'react';
import { z } from 'zod';
import { $ZodIssue } from 'zod/v4/core';
import { FieldContainer } from './field-container';

type ChipField = z.infer<typeof chipFieldSchema>;

interface ChipFieldProps {
  field: ChipField;
  onChange?: (values: string[]) => void;
  onCreateReviewDispute: (field: Field) => void;
  isSingle?: boolean;
  issues: $ZodIssue[];
}

export const ChipField: FC<ChipFieldProps> = ({
  field,
  onChange,
  onCreateReviewDispute,
  isSingle = true,
  issues,
}) => {
  const selectedValues = (field.answer_value ?? []) as string[];
  const isDisabled = field.is_disabled === true;

  const handleToggle = (optionId: string) => {
    if (isDisabled) return;

    let newValues: string[];

    if (isSingle) {
      // Single selection mode: select only this option
      newValues = selectedValues.includes(optionId) ? [] : [optionId];
    } else {
      // Multiple selection mode: toggle the option
      newValues = selectedValues.includes(optionId)
        ? selectedValues.filter((id) => id !== optionId)
        : [...selectedValues, optionId];
    }

    onChange?.(newValues);
  };

  const issue = useMemo(() => {
    return issues.length > 0 ? issues[0] : null;
  }, [issues]);

  return (
    <FieldContainer
      title={field.question}
      isDisputable={field.is_disputable as boolean}
      isDisabled={
        field.is_disabled === undefined ? false : (field.is_disabled as boolean)
      }
      onCreateReviewDispute={() => onCreateReviewDispute(field)}
      hasError={issue !== null}
    >
      <div>
        <div className="flex flex-wrap gap-2 mb-2">
          {field.options.map((option) => {
            const isSelected = selectedValues.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                disabled={isDisabled}
                onClick={() => handleToggle(option.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-body-md md:text-body-sm font-medium transition-all h-9',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-background text-foreground hover:bg-accent',
                  isDisabled && 'cursor-not-allowed opacity-60',
                  issue && 'border-destructive',
                )}
              >
                {isSelected && (
                  <span className="flex size-4 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                )}
                {!isSelected && (
                  <span className="flex size-5 items-center justify-center rounded-full border-2 border-muted-foreground/30" />
                )}
                {option.text}
              </button>
            );
          })}
        </div>

        {issue && (
          <Label className="text-destructive">
            {issue.code === 'invalid_type'
              ? 'Bitte Auswahl treffen.'
              : 'Fehlerhafte Auswahl.'}
          </Label>
        )}
      </div>
    </FieldContainer>
  );
};
