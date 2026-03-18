'use client';

import { Chip } from '@/components/ui/chip';
import { Label } from '@/components/ui/label';
import { chipFieldSchema, Field } from '@/lib/schemas/field-schemas';
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
              <Chip
                key={option.id}
                text={option.text}
                isSelected={isSelected}
                disabled={isDisabled}
                hasError={issue !== null}
                onClick={() => handleToggle(option.id)}
              />
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
