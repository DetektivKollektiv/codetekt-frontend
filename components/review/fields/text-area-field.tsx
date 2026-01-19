'use client';

import { Textarea } from '@/components/ui/textarea';
import { textAreaFieldSchema } from '@/lib/schemas/field-schemas';
import { FC } from 'react';
import { z } from 'zod';

type TextAreaField = z.infer<typeof textAreaFieldSchema>;

interface TextAreaFieldProps {
  field: TextAreaField;
  onChange?: (value: string) => void;
}

export const TextAreaField: FC<TextAreaFieldProps> = ({ field, onChange }) => {
  const option = field.options[0];
  const value = (field.answer_value ?? '') as string;

  const handleChange = (newValue: string) => {
    onChange?.(newValue);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-body-md font-medium">{field.question}</h3>
      <div className="space-y-2">
        <Textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={option.placeholder}
          maxLength={option.max_length}
          className="min-h-[200px]"
        />
        <div className="text-right text-sm text-muted-foreground">
          {value.length} / {option.max_length}
        </div>
      </div>
    </div>
  );
};
