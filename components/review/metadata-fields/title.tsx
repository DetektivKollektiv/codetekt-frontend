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
  fieldTitle?: string;
  saveLabel?: string;
  disputeLabel?: string;
}

const Title: FC<TitleProps> = ({
  value,
  isComplete,
  onChange,
  onSave,
  isSaving,
  onCreateDispute,
  issues,
  fieldTitle,
  saveLabel,
  disputeLabel,
}) => {
  const issue = issues[0] ?? null;
  const inputValue = value ?? '';
  const isTitleValid = caseTitleSchema.safeParse(inputValue).success;
  const isInputDisabled = isSaving || (isComplete && !!inputValue);
  const isSaveDisabled = isComplete ? isSaving : isSaving || !isTitleValid;

  return (
    <FieldContainer
      title={fieldTitle ?? 'Falltitel'}
      isDisputable={isComplete && !!inputValue}
      onCreateReviewDispute={() => onCreateDispute?.()}
      onSave={onSave}
      isSaveDisabled={isSaveDisabled}
      saveLabel={isSaving ? 'Wird gespeichert...' : (saveLabel ?? 'Speichern')}
      disputeLabel={disputeLabel}
    >
      <div className="space-y-2">
        <Input
          value={inputValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder=""
          maxLength={caseTitleSchema.maxLength!}
          className="w-full"
          disabled={isInputDisabled}
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
