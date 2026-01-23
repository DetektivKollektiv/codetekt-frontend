'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Field, textAreaFieldSchema } from '@/lib/schemas/field-schemas';
import { FC, useMemo } from 'react';
import { z } from 'zod';
import { $ZodIssue } from 'zod/v4/core';
import { FieldContainer } from './field-container';

type TextAreaField = z.infer<typeof textAreaFieldSchema>;

interface TextAreaFieldProps {
  field: TextAreaField;
  issues: $ZodIssue[];
  onChange?: (value: string) => void;
  onCreateReviewDispute: (field: Field) => void;
}

export const TextAreaField: FC<TextAreaFieldProps> = ({
  field,
  issues,
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

  const issue = useMemo(() => {
    return issues.length > 0 ? issues[0] : null;
  }, [issues]);
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
        <div className="flex justify-between items-start">
          {issue && (
            <Label className="text-destructive">
              {issue.code === 'too_big'
                ? `Maximal ${issue.maximum} Zeichen.`
                : issue.code === 'too_small'
                  ? `Mindestens ${issue.minimum} Zeichen.`
                  : 'Fehlerhafte Eingabe.'}
            </Label>
          )}
          <div
            className={`text-right text-sm ml-auto ${
              issue?.code === 'too_big' || issue?.code === 'too_small'
                ? 'text-destructive'
                : 'text-muted-foreground'
            }`}
          >
            {value.length} / {option.max_length}
          </div>
        </div>
      </div>
    </FieldContainer>
  );
};
