'use client';

import { likertScaleFieldSchema } from '@/lib/schemas/field-schemas';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { FC, useState } from 'react';
import { z } from 'zod';

type LikertScaleField = z.infer<typeof likertScaleFieldSchema>;
type LikertScaleValue = 0 | 1 | 2 | 3 | 4 | null;

interface LikertScaleFieldProps {
  field: LikertScaleField;
  onChange?: (value: LikertScaleValue) => void;
}

export const LikertScaleField: FC<LikertScaleFieldProps> = ({
  field,
  onChange,
}) => {
  const [selectedValue, setSelectedValue] = useState<LikertScaleValue>(
    field.answer_value ?? null
  );

  const isDisabled = field.is_disabled === true;

  const handleSelect = (value: LikertScaleValue) => {
    if (isDisabled) return;

    setSelectedValue(value);
    onChange?.(value);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-body-md font-medium">{field.question}</h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
        {field.options.map((option) => {
          const isSelected = selectedValue === option.value;

          return (
            <button
              key={option.id}
              type="button"
              disabled={isDisabled}
              onClick={() => handleSelect(option.value)}
              className={cn(
                'flex flex-col items-center gap-3 rounded-xl border-2 bg-muted/30 px-4 py-6 transition-all',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected
                  ? 'border-primary bg-muted/50'
                  : 'border-transparent hover:border-muted-foreground/20',
                isDisabled && 'cursor-not-allowed opacity-60'
              )}
            >
              {/* Colored circle indicator */}
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-full border-2 transition-all',
                  isSelected && 'text-white'
                )}
                style={{
                  borderColor: option.color,
                  backgroundColor: isSelected ? option.color : 'transparent',
                }}
              >
                {isSelected && <Check className="size-3" strokeWidth={3} />}
              </span>

              {/* Text and description */}
              <div className="flex flex-col items-center text-center">
                <span className="text-body-md font-semibold">
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
    </div>
  );
};
