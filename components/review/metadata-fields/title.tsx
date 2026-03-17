'use client';

import { FieldContainer } from '@/components/review/fields/field-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FC, useState } from 'react';
import { $ZodIssue } from 'zod/v4/core';

interface TitleProps {
  value?: string | null;
  isComplete: boolean;
  onSave: (val: string) => void;
  isSaving: boolean;
  onCreateDispute?: () => void;
  issues: $ZodIssue[];
}

const Title: FC<TitleProps> = ({
  value,
  isComplete,
  onSave,
  isSaving,
  onCreateDispute,
  issues,
}) => {
  const [inputValue, setInputValue] = useState('');
  const issue = issues[0] ?? null;

  if (isComplete && value) {
    return (
      <FieldContainer
        title="Wie lautet der Titel dieses Falls?"
        isDisputable={true}
        onCreateReviewDispute={() => onCreateDispute?.()}
      >
        <p className="text-body-md text-foreground">{value}</p>
      </FieldContainer>
    );
  }

  return (
    <FieldContainer
      title="Wie lautet der Titel dieses Falls?"
      isDisputable={false}
      onCreateReviewDispute={() => {}}
    >
      <div className="space-y-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Titel für den Fall"
          maxLength={500}
          className="w-full"
          disabled={isSaving}
        />
        <div className="flex justify-between items-start">
          {issue && <Label className="text-destructive">{issue.message}</Label>}
          <div className="text-right text-sm ml-auto text-muted-foreground">
            {inputValue.length} / 500
          </div>
        </div>
        <Button
          className="w-full"
          onClick={() => onSave(inputValue)}
          disabled={isSaving || inputValue.trim().length === 0}
        >
          {isSaving ? 'Wird gespeichert...' : 'Bestätigen'}
        </Button>
      </div>
    </FieldContainer>
  );
};

export default Title;
