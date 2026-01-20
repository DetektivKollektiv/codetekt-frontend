'use client';

import { chipFieldSchema } from '@/lib/schemas/field-schemas';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { FC } from 'react';
import { z } from 'zod';
import { FieldContainer } from './field-container';

type ChipField = z.infer<typeof chipFieldSchema>;

interface ChipFieldProps {
  field: ChipField;
  onChange?: (values: string[]) => void;
}

export const ChipField: FC<ChipFieldProps> = ({ field, onChange }) => {
  const selectedValues = (field.answer_value ?? []) as string[];
  const isDisabled = field.is_disabled === true;

  const handleToggle = (optionId: string) => {
    if (isDisabled) return;

    const newValues = selectedValues.includes(optionId)
      ? selectedValues.filter((id) => id !== optionId)
      : [...selectedValues, optionId];

    onChange?.(newValues);
  };

  return (
    <FieldContainer
      title={field.question}
      isDisputable={field.is_disputable as boolean}
      isDisabled={
        field.is_disabled === undefined ? false : (field.is_disabled as boolean)
      }
    >
      <div className="flex flex-wrap gap-2">
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
    </FieldContainer>
  );
};
