'use client';

import { FieldContainer } from '@/components/review/fields/field-container';
import { LikertScaleField } from '@/components/review/fields/likert-scale-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { factcheckUrlSchema } from '@/lib/schemas/case-metadata-schemas';
import { likertScaleFieldSchema } from '@/lib/schemas/field-schemas';
import { FC, useMemo } from 'react';
import { z } from 'zod';
import { $ZodIssue } from 'zod/v4/core';

type LikertScaleFieldValue = 0 | 1 | 2 | 3 | 4 | null;

type FactcheckSelection = 'yes' | 'no' | null;

type FactcheckLikertField = z.infer<typeof likertScaleFieldSchema>;
interface FactcheckProps {
  selection: FactcheckSelection;
  value: string;
  isComplete: boolean;
  isSaving?: boolean;
  onSelectionChange: (value: FactcheckSelection) => void;
  onValueChange: (value: string) => void;
  onSave: () => void;
  saveLabel?: string;
  fieldTitle: string;
  issues: $ZodIssue[];
}

const Factcheck: FC<FactcheckProps> = ({
  selection,
  value,
  isComplete,
  isSaving = false,
  onSelectionChange,
  onValueChange,
  onSave,
  saveLabel,
  fieldTitle,
  issues,
}) => {
  const isDisabled = isSaving || isComplete;
  const issue = issues[0] ?? null;

  const likertValue: LikertScaleFieldValue =
    selection === 'yes' ? 1 : selection === 'no' ? 0 : null;

  const factcheckField = useMemo<FactcheckLikertField>(
    () => ({
      id: 'factcheck_selection',
      type: 'likert-scale',
      question: '',
      options: [
        {
          id: 'factcheck_no',
          text: 'Nein',
          description: 'Es liegt kein Faktencheck vor.',
          color: 'hsl(var(--destructive))',
          value: 0,
        },
        {
          id: 'factcheck_yes',
          text: 'Ja',
          description: 'Es gibt bereits einen Faktencheck.',
          color: 'hsl(var(--primary))',
          value: 1,
        },
      ],
      answer_value: likertValue,
      is_disabled: isDisabled,
      is_disputable: false,
    }),
    [isDisabled, likertValue],
  );

  const shouldShowDetails = selection === 'yes';
  const isFactcheckUrlValid = factcheckUrlSchema.safeParse(
    value.trim(),
  ).success;
  const isSaveDisabled = isComplete
    ? isSaving
    : isSaving ||
      selection === null ||
      (selection === 'yes' && !isFactcheckUrlValid);

  const handleSelectionChange = (value: LikertScaleFieldValue) => {
    if (value === 1) {
      onSelectionChange('yes');
      return;
    }

    if (value === 0) {
      onSelectionChange('no');
      return;
    }

    onSelectionChange(null);
  };

  return (
    <FieldContainer
      title={fieldTitle}
      onCreateReviewDispute={() => undefined}
      onSave={onSave}
      isSaveDisabled={isSaveDisabled}
      saveLabel={isSaving ? 'Wird gespeichert...' : (saveLabel ?? 'Speichern')}
      hasError={!!issue}
    >
      <div className="space-y-4">
        <LikertScaleField
          field={factcheckField}
          issues={[]}
          onChange={handleSelectionChange}
          onCreateReviewDispute={() => undefined}
        />

        {shouldShowDetails && (
          <div className="space-y-2">
            <Label>URL zum Faktencheck</Label>
            <Input
              type="url"
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              placeholder="https://..."
              maxLength={2000}
              disabled={isDisabled}
            />
          </div>
        )}

        {issue && <p className="text-destructive text-sm">{issue.message}</p>}
      </div>
    </FieldContainer>
  );
};

export default Factcheck;
