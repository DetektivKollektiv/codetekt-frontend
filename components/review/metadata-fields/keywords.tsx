'use client';

import { FieldContainer } from '@/components/review/fields/field-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FC, useState } from 'react';
import { $ZodIssue } from 'zod/v4/core';

interface KeywordsProps {
  existingKeywords: string[];
  isComplete: boolean;
  onSave: (values: string[]) => void;
  isSaving: boolean;
  onCreateDispute?: () => void;
  issues: $ZodIssue[];
}

const Keywords: FC<KeywordsProps> = ({
  existingKeywords,
  isComplete,
  onSave,
  isSaving,
  onCreateDispute,
  issues,
}) => {
  // TODO: custom keyword input UI
  const [inputValue, setInputValue] = useState('');
  const issue = issues[0] ?? null;

  if (isComplete && existingKeywords.length > 0) {
    return (
      <FieldContainer
        title="Welche Stichwörter beschreiben diesen Fall?"
        isDisputable={true}
        onCreateReviewDispute={() => onCreateDispute?.()}
      >
        <div className="flex flex-wrap gap-2">
          {existingKeywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center rounded-lg border border-border bg-muted px-3 py-1 text-body-sm font-medium text-foreground"
            >
              {kw}
            </span>
          ))}
        </div>
      </FieldContainer>
    );
  }

  const handleSave = () => {
    const values = inputValue
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onSave(values);
  };

  return (
    <FieldContainer
      title="Welche Stichwörter beschreiben diesen Fall?"
      isDisputable={false}
      onCreateReviewDispute={() => {}}
    >
      <div className="space-y-2">
        {/* TODO: custom keyword input UI */}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Stichwörter kommagetrennt eingeben (max. 5)"
          disabled={isSaving}
        />
        {issue && <Label className="text-destructive">{issue.message}</Label>}
        <Button
          className="w-full"
          onClick={handleSave}
          disabled={isSaving || inputValue.trim().length === 0}
        >
          {isSaving ? 'Wird gespeichert...' : 'Bestätigen'}
        </Button>
      </div>
    </FieldContainer>
  );
};

export default Keywords;
