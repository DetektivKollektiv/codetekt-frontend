'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Field, multiLineTextFieldSchema } from '@/lib/schemas/field-schemas';
import { X } from 'lucide-react';
import { FC, useMemo, useState } from 'react';
import { z } from 'zod';
import { $ZodIssue } from 'zod/v4/core';
import { FieldContainer } from './field-container';

type MultiLineTextField = z.infer<typeof multiLineTextFieldSchema>;

interface MultiLineTextFieldProps {
  field: MultiLineTextField;
  onChange?: (values: string[]) => void;
  onCreateReviewDispute: (field: Field) => void;
  issues: $ZodIssue[];
}

export const MultiLineTextField: FC<MultiLineTextFieldProps> = ({
  field,
  onChange,
  onCreateReviewDispute,
  issues,
}) => {
  const [initialAnswerValues] = useState(
    () => (field.initial_answer_value ?? []) as string[],
  );

  const allError = useMemo(() => {
    return issues.some((issue) => {
      return issue.code === 'invalid_type';
    });
  }, [issues]);

  const additionalAnswerSource = useMemo(() => {
    const values = Array.from({
      length: field.additonal_option_count ?? 0,
    }).map(
      (_, index) =>
        field.answer_value?.[
          index + (field.initial_answer_value?.length ?? 0)
        ] ?? '',
    );

    return {
      key: JSON.stringify([
        field.additonal_option_count ?? 0,
        field.initial_answer_value?.length ?? 0,
        values,
      ]),
      values,
    };
  }, [
    field.answer_value,
    field.additonal_option_count,
    field.initial_answer_value,
  ]);

  const [additionalAnswerState, setAdditionalAnswerState] = useState(() => ({
    source: additionalAnswerSource.key,
    values: additionalAnswerSource.values,
  }));
  const additionalAnswerValues =
    additionalAnswerState.source === additionalAnswerSource.key
      ? additionalAnswerState.values
      : additionalAnswerSource.values;

  const answerValues = ((field.answer_value ?? []) as string[]).slice(
    0,
    initialAnswerValues.length,
  );

  const isDisabled =
    field.is_disabled === undefined ? false : (field.is_disabled as boolean);

  const handleAnswerChange = (index: number, value: string) => {
    const newValues = [...answerValues];
    newValues[index] = value;
    onChange?.(newValues);
  };

  const handleAnswerClear = (index: number) => {
    const newValues = [...answerValues];
    newValues[index] = '';
    onChange?.(newValues);
  };

  return (
    <FieldContainer
      title={field.question}
      isDisputable={field.is_disputable as boolean}
      isDisabled={isDisabled}
      onCreateReviewDispute={() => onCreateReviewDispute(field)}
      hasError={allError}
    >
      <div className="space-y-2 ">
        {/* Pre-defined options (disabled, read-only) */}
        {field.options.map((option) => {
          const isOptionDisabled = option.is_disabled ?? false;
          return (
            <div key={option.id} className="flex gap-2">
              <Input
                value={option.text}
                disabled={isOptionDisabled}
                className={`${isOptionDisabled ? 'text-muted-foreground' : ''} `}
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                disabled={isOptionDisabled}
                aria-label="Clear value"
              >
                <X className="size-4" />
              </Button>
            </div>
          );
        })}

        {/* Additional editable inputs for user answers */}
        {initialAnswerValues.map((answer_value, index) => {
            return (
              <div key={`additional-${index}`} className="flex gap-2 ">
                <Input
                  value={answer_value}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder={field.placeholder}
                  maxLength={field.max_length}
                  disabled={isDisabled}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => handleAnswerClear(index)}
                  disabled={!answer_value || isDisabled}
                  aria-label="Clear value"
                >
                  <X className="size-4" />
                </Button>
              </div>
            );
          })}

        {additionalAnswerValues.map((_, index) => {
          const value = additionalAnswerValues[index];

          const issue = issues.find((issue) => {
            return (
              issue.path[1] ===
              index +
                (field.initial_answer_value
                  ? field.initial_answer_value.length
                  : 0)
            );
          });

          return (
            <div key={`additional-${index}`}>
              <div className="flex gap-2 ">
                <Input
                  value={value}
                  onChange={(e) => {
                    const newValues = additionalAnswerValues.slice();
                    newValues[index] = e.target.value;
                    setAdditionalAnswerState({
                      source: additionalAnswerSource.key,
                      values: newValues,
                    });
                    onChange?.([...answerValues, ...newValues]);
                  }}
                  placeholder={field.placeholder}
                  maxLength={field.max_length}
                  className={`${allError || issue ? 'border-destructive' : ''} `}
                  disabled={false}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => {
                    const newValues = additionalAnswerValues.slice();
                    newValues[index] = '';
                    setAdditionalAnswerState({
                      source: additionalAnswerSource.key,
                      values: newValues,
                    });
                    onChange?.([...answerValues, ...newValues]);
                  }}
                  disabled={!value}
                  aria-label="Clear value"
                >
                  <X className="size-4" />
                </Button>
              </div>
              {issue && (
                <Label className="text-destructive">
                  {issue.code === 'too_small' ? (
                    <span>
                      Bitte mindestens {issue.minimum} Zeichen eingeben.
                    </span>
                  ) : issue.code === 'too_big' ? (
                    <span>Bitte maximal {issue.maximum} Zeichen eingeben.</span>
                  ) : (
                    <span>Ungültiger Wert.</span>
                  )}
                </Label>
              )}
            </div>
          );
        })}
      </div>
    </FieldContainer>
  );
};
