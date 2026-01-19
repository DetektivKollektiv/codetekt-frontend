'use client';

import { Input } from '@/components/ui/input';
import { textFieldSchema } from '@/lib/schemas/field-schemas';
import { FC } from 'react';
import { z } from 'zod';

type TextField = z.infer<typeof textFieldSchema>;

interface TextFieldProps {
  field: TextField;
  onChange?: (value: string) => void;
}

export const TextField: FC<TextFieldProps> = ({ field, onChange }) => {
  const option = field.options[0];
  const value = (field.answer_value ?? '') as string;

  const handleChange = (newValue: string) => {
    onChange?.(newValue);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-body-md font-medium">{field.question}</h3>
      <div className="space-y-2">
        <Input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={option.placeholder}
          maxLength={option.max_length}
          className="w-full"
        />
        <div className="text-right text-sm text-muted-foreground">
          {value.length} / {option.max_length}
        </div>
      </div>
    </div>
  );
};
