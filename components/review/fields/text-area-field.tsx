'use client';

import { Textarea } from '@/components/ui/textarea';
import { Field, textAreaFieldSchema } from '@/lib/schemas/field-schemas';
import { FC } from 'react';
import { z } from 'zod';
import { FieldContainer } from './field-container';

type TextAreaField = z.infer<typeof textAreaFieldSchema>;

interface TextAreaFieldProps {
  field: TextAreaField;
  onChange?: (value: string) => void;
  onCreateReviewDispute: (field: Field) => void;
}

export const TextAreaField: FC<TextAreaFieldProps> = ({
  field,
  onChange,
  onCreateReviewDispute,
}) => {
  const option = field.options[0];
  const value = (field.answer_value ?? '') as string;
  const isDisabled =
    field.is_disabled === undefined ? false : (field.is_disabled as boolean);

  const handleChange = (newValue: string) => {
    onChange?.(newValue);
  };

  return (
    <FieldContainer
      title={field.question}
      isDisputable={field.is_disputable as boolean}
      isDisabled={isDisabled}
      onCreateReviewDispute={() => onCreateReviewDispute(field)}
    >
      <div className="space-y-2">
        <Textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={option.placeholder}
          maxLength={option.max_length}
          className="min-h-[200px]"
          disabled={isDisabled}
        />
        <div className="text-right text-sm text-muted-foreground">
          {value.length} / {option.max_length}
        </div>
      </div>
    </FieldContainer>
  );
};
