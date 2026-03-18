'use client';

import { FieldContainer } from '@/components/review/fields/field-container';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { caseTitleSchema } from '@/lib/schemas/case-metadata-schemas';
import { FC } from 'react';
import { $ZodIssue } from 'zod/v4/core';

interface TitleProps {
  value: string;
  isComplete: boolean;
  onChange: (val: string) => void;
  onSave: () => void;
  isSaving: boolean;
  onCreateDispute?: () => void;
  issues: $ZodIssue[];
}

const Title: FC<TitleProps> = ({
  value,
  isComplete,
  onChange,
  onSave,
  isSaving,
  onCreateDispute,
  issues,
}) => {
  const issue = issues[0] ?? null;
  const inputValue = value ?? '';
  const isDisabled = isSaving || (isComplete && !!inputValue);

  return (
    <FieldContainer
      title="Wie lautet der Titel dieses Falls?"
      isDisputable={isComplete && !!inputValue}
      onCreateReviewDispute={() => onCreateDispute?.()}
      onSave={onSave}
      isSaveDisabled={
        isDisabled || inputValue.trim().length < caseTitleSchema.maxLength!
      }
      saveLabel={isSaving ? 'Wird gespeichert...' : 'Speichern'}
    >
      <div className="space-y-2">
        <Input
          value={inputValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Titel für den Fall"
          maxLength={caseTitleSchema.maxLength!}
          className="w-full"
          disabled={isDisabled}
        />
        <div className="flex justify-between items-start">
          {issue && <Label className="text-destructive">{issue.message}</Label>}
          <div className="text-right text-sm ml-auto text-muted-foreground">
            {inputValue.length} / {caseTitleSchema.maxLength!}
          </div>
        </div>
      </div>
    </FieldContainer>
  );
};

export default Title;
