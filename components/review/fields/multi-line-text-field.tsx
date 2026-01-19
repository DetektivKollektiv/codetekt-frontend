'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { multiLineTextFieldSchema } from '@/lib/schemas/field-schemas';
import { X } from 'lucide-react';
import { FC } from 'react';
import { z } from 'zod';
import { FieldContainer } from './field-container';

type MultiLineTextField = z.infer<typeof multiLineTextFieldSchema>;

interface MultiLineTextFieldProps {
  field: MultiLineTextField;
  onChange?: (values: string[]) => void;
}

export const MultiLineTextField: FC<MultiLineTextFieldProps> = ({
  field,
  onChange,
}) => {
  const additionalInputCount = field.additonal_option_count ?? 0;
  const answerValues = ((field.answer_value ?? []) as string[]).slice(
    0,
    additionalInputCount
  );

  const handleAnswerChange = (index: number, value: string) => {
    const newValues = [...answerValues];
    newValues[index] = value;
    onChange?.(newValues.filter(Boolean));
  };

  const handleAnswerClear = (index: number) => {
    const newValues = [...answerValues];
    newValues[index] = '';
    onChange?.(newValues.filter(Boolean));
  };

  return (
    <FieldContainer
      title={field.question}
      isDisputable={field.is_disputable as boolean}
    >
      <div className="space-y-2">
        {/* Pre-defined options (disabled, read-only) */}
        {field.options.map((option) => (
          <div key={option.id} className="flex gap-2">
            <Input value={option.text} disabled className="flex-1" />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              disabled
              aria-label="Clear value"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}

        {/* Additional editable inputs for user answers */}
        {Array.from({ length: additionalInputCount }).map((_, index) => {
          const value = answerValues[index] ?? '';

          return (
            <div key={`additional-${index}`} className="flex gap-2">
              <Input
                value={value}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder={field.placeholder}
                maxLength={field.max_length}
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => handleAnswerClear(index)}
                disabled={!value}
                aria-label="Clear value"
              >
                <X className="size-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </FieldContainer>
  );
};
