'use client';

import { FieldContainer } from '@/components/review/fields/field-container';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { commentContentSchema } from '@/lib/schemas/comment-schemas';
import { FC } from 'react';

interface FinalCommentProps {
  value: string;
  onChange: (val: string) => void;
  onSave: () => void;
  isSaving: boolean;
  isDisabled: boolean;
  fieldTitle?: string;
  saveLabel?: string;
}

const FinalComment: FC<FinalCommentProps> = ({
  value,
  onChange,
  onSave,
  isSaving,
  isDisabled,
  fieldTitle,
  saveLabel,
}) => {
  const inputValue = value ?? '';
  const trimmedValue = inputValue.trim();
  const hasValue = trimmedValue.length > 0;

  const validation = hasValue
    ? commentContentSchema.safeParse(inputValue)
    : { success: true as const };
  const issueMessage = validation.success
    ? null
    : (validation.error.issues[0]?.message ?? null);

  const isInputDisabled = isSaving || isDisabled;
  const isSaveDisabled = isInputDisabled || !hasValue || !validation.success;

  return (
    <FieldContainer
      title={fieldTitle ?? 'Was ist dir noch aufgefallen?'}
      onCreateReviewDispute={() => {}}
      onSave={onSave}
      isSaveDisabled={isSaveDisabled}
      saveLabel={
        isSaving ? 'Wird gespeichert...' : (saveLabel ?? 'Kommentar speichern')
      }
    >
      <div className="space-y-2">
        <Textarea
          value={inputValue}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Schreibe deine Antwort hier..."
          maxLength={5000}
          className="min-h-36 w-full resize-none"
          disabled={isInputDisabled}
        />

        <div className="flex justify-between items-start">
          {issueMessage ? (
            <Label className="text-destructive">{issueMessage}</Label>
          ) : (
            <div />
          )}

          <div className="text-right text-sm ml-auto text-muted-foreground">
            {inputValue.length} / 5000
          </div>
        </div>
      </div>
    </FieldContainer>
  );
};

export default FinalComment;
