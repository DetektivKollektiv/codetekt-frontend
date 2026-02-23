'use client';

import { Label } from '@/components/ui/label';
import { Field, likertScaleFieldSchema } from '@/lib/schemas/field-schemas';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { FC, useMemo } from 'react';
import { z } from 'zod';
import { $ZodIssue } from 'zod/v4/core';
import { FieldContainer } from './field-container';

type LikertScaleField = z.infer<typeof likertScaleFieldSchema>;
type LikertScaleValue = 0 | 1 | 2 | 3 | 4 | null;

interface LikertScaleFieldProps {
  field: LikertScaleField;
  issues: $ZodIssue[];
  onChange?: (value: LikertScaleValue) => void;
  onCreateReviewDispute: (field: Field) => void;
}

export const LikertScaleField: FC<LikertScaleFieldProps> = ({
  field,
  issues,
  onChange,
  onCreateReviewDispute,
}) => {
  const selectedValue = (field.answer_value ?? null) as LikertScaleValue;
  const isDisabled = field.is_disabled === true;

  const handleSelect = (value: LikertScaleValue) => {
    if (isDisabled) return;
    onChange?.(value);
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
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-4 mb-2">
          {field.options.map((option) => {
            const isSelected = selectedValue === option.value;
            return (
              <button
                key={option.id}
                type="button"
                disabled={isDisabled}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'flex flex-col items-center gap-3 rounded-xl border bg-muted px-4 py-6 transition-all',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-primary bg-muted/50'
                    : 'border-muted-foreground/30 hover:border-muted-foreground/50',
                  isDisabled && 'cursor-not-allowed opacity-60',
                  issue && 'border-destructive',
                )}
              >
                {/* Colored circle indicator */}
                <span
                  className={cn(
                    'flex size-4 items-center justify-center rounded-full border-2 transition-all',
                    isSelected && 'text-neutral-0',
                  )}
                  style={{
                    borderColor: `${option.color}`,
                    backgroundColor: isSelected
                      ? `${option.color}`
                      : 'transparent',
                  }}
                >
                  {isSelected && <Check className="size-3" strokeWidth={3} />}
                </span>
                {/* Text and description */}
                <div className="flex flex-col items-center text-center">
                  <span className="text-body-md md:text-body-sm font-semibold">
                    {option.text}
                  </span>
                  <span className="text-body-sm text-muted-foreground">
                    {option.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        {issue && (
          <Label className="text-destructive">
            {issue.code === 'invalid_union'
              ? 'Bitte eine Auswahl treffen.'
              : 'Fehlerhafte Auswahl.'}
          </Label>
        )}
      </div>
    </FieldContainer>
  );
};
