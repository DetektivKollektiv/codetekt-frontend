'use client';

import { FieldContainer } from '@/components/review/fields/field-container';
import { Chip } from '@/components/ui/chip';
import { Label } from '@/components/ui/label';
import { CASE_CATEGORY_OPTIONS } from '@/lib/constants';
import { CaseCategoryValue } from '@/lib/schemas/case-metadata-schemas';
import { FC } from 'react';
import { $ZodIssue } from 'zod/v4/core';

interface CategoryProps {
  value?: CaseCategoryValue | null;
  isComplete: boolean;
  onChange: (val: CaseCategoryValue | null) => void;
  onSave: () => void;
  isSaving: boolean;
  onCreateDispute?: () => void;
  issues: $ZodIssue[];
  fieldTitle?: string;
  saveLabel?: string;
  disputeLabel?: string;
}

const Category: FC<CategoryProps> = ({
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
  const selected = value ?? null;
  const issue = issues[0] ?? null;
  const isDisabled = isSaving || (isComplete && !!value);

  const handleToggle = (optionId: string) => {
    if (isDisabled) return;

    const nextValue = optionId as CaseCategoryValue;
    onChange(selected === nextValue ? null : nextValue);
  };

  return (
    <FieldContainer
      title={fieldTitle ?? 'Welche Kategorie trifft auf diesen Fall zu?'}
      isDisputable={isComplete && !!value}
      onCreateReviewDispute={() => onCreateDispute?.()}
      onSave={onSave}
      isSaveDisabled={isDisabled || !selected}
      saveLabel={isSaving ? 'Wird gespeichert...' : (saveLabel ?? 'Speichern')}
      disputeLabel={disputeLabel}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 mb-2">
          {CASE_CATEGORY_OPTIONS.map((option) => {
            const isSelected = selected === option.id;

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
        {issue && <Label className="text-destructive">{issue.message}</Label>}
      </div>
    </FieldContainer>
  );
};

export default Category;
