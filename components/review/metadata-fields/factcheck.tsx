'use client';

import { LikertScaleField } from '@/components/review/fields/likert-scale-field';
import { TextAreaField } from '@/components/review/fields/text-area-field';
import { Button } from '@/components/ui/button';
import {
  likertScaleFieldSchema,
  textAreaFieldSchema,
} from '@/lib/schemas/field-schemas';
import { FC, useMemo } from 'react';
import { z } from 'zod';
import { $ZodIssue } from 'zod/v4/core';

type LikertScaleFieldValue = 0 | 1 | 2 | 3 | 4 | null;

type FactcheckSelection = 'yes' | 'no' | null;

type FactcheckLikertField = z.infer<typeof likertScaleFieldSchema>;
type FactcheckTextAreaField = z.infer<typeof textAreaFieldSchema>;

interface FactcheckProps {
  selection: FactcheckSelection;
  details: string;
  isComplete: boolean;
  isSaving?: boolean;
  onSelectionChange: (value: FactcheckSelection) => void;
  onDetailsChange: (value: string) => void;
  onSave: () => void;
  saveLabel?: string;
  fieldTitle?: string;
  issues: $ZodIssue[];
}

const Factcheck: FC<FactcheckProps> = ({
  selection,
  details,
  isComplete,
  isSaving = false,
  onSelectionChange,
  onDetailsChange,
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
      question: fieldTitle ?? 'Hat der Fall bereits einen Faktencheck?',
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
      initial_answer_value: likertValue,
      is_disabled: isDisabled,
      is_disputable: false,
    }),
    [fieldTitle, isDisabled, likertValue],
  );

  const detailsField = useMemo<FactcheckTextAreaField>(
    () => ({
      id: 'factcheck_details',
      type: 'text-area',
      question: 'Falls ja, ergänze bitte den Faktencheck.',
      options: [
        {
          id: 'factcheck_details_input',
          placeholder: 'Link oder kurze Beschreibung des Faktenchecks',
          max_length: 2000,
        },
      ],
      answer_value: details,
      initial_answer_value: details,
      is_disabled: isDisabled,
      is_disputable: false,
    }),
    [details, isDisabled],
  );

  const shouldShowDetails = selection === 'yes';
  const isSaveDisabled = isComplete ? isSaving : isSaving || selection === null;

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
    <div className="space-y-4 flex flex-col h-full">
      <LikertScaleField
        field={factcheckField}
        issues={[]}
        onChange={handleSelectionChange}
        onCreateReviewDispute={() => undefined}
      />

      {shouldShowDetails && (
        <TextAreaField
          field={detailsField}
          issues={[]}
          onChange={onDetailsChange}
          onCreateReviewDispute={() => undefined}
        />
      )}

      {issue && <p className="text-destructive text-sm">{issue.message}</p>}

      <Button
        className="w-full mt-auto"
        onClick={onSave}
        disabled={isSaveDisabled}
      >
        {isSaving ? 'Wird gespeichert...' : (saveLabel ?? 'Speichern')}
      </Button>
    </div>
  );
};

export default Factcheck;
