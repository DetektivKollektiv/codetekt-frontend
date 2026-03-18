'use client';

import { FieldContainer } from '@/components/review/fields/field-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag } from '@/components/ui/tag';
import { CASE_KEYWORDS_LIMITS } from '@/lib/schemas/case-metadata-schemas';
import { Tables } from '@/lib/types/database.types';
import { FC, useEffect, useState } from 'react';
import { $ZodIssue } from 'zod/v4/core';

interface KeywordsProps {
  existingKeywords: string[];
  caseKeywords: Tables<'case_keywords'>[];
  userId?: string;
  isComplete: boolean;
  onSave: (values: string[]) => void;
  isSaving: boolean;
  onCreateDispute?: () => void;
  issues: $ZodIssue[];
}

const Keywords: FC<KeywordsProps> = ({
  existingKeywords,
  caseKeywords,
  userId,
  isComplete,
  onSave,
  isSaving,
  onCreateDispute,
  issues,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [newKeywords, setNewKeywords] = useState<string[]>([]);
  const issue = issues[0] ?? null;
  const userExistingKeywords = userId
    ? (caseKeywords.find((keywordSet) => keywordSet.created_by === userId)
        ?.values ?? [])
    : [];
  const hasUserKeywords = userExistingKeywords.length > 0;
  const totalCaseKeywords = existingKeywords.length + newKeywords.length;
  const hasReachedCaseKeywordsLimit =
    totalCaseKeywords >= CASE_KEYWORDS_LIMITS.maxCaseKeywords;

  useEffect(() => {
    if (hasUserKeywords) {
      setInputValue('');
      setNewKeywords([]);
    }
  }, [hasUserKeywords]);

  const handleAddKeyword = () => {
    const trimmed = inputValue.trim();

    // Validierungen
    if (!trimmed) return;
    if (trimmed.length > CASE_KEYWORDS_LIMITS.maxKeywordLength) return;
    if (newKeywords.some((kw) => kw.toLowerCase() === trimmed.toLowerCase()))
      return;
    if (newKeywords.length >= CASE_KEYWORDS_LIMITS.maxKeywords) return;
    if (totalCaseKeywords >= CASE_KEYWORDS_LIMITS.maxCaseKeywords) return;

    setNewKeywords([...newKeywords, trimmed]);
    setInputValue('');
  };

  const handleRemoveKeyword = (index: number) => {
    setNewKeywords(newKeywords.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleSave = () => {
    if (hasUserKeywords) return;
    onSave(newKeywords);
  };

  const canAddKeyword = () => {
    if (hasUserKeywords) return false;
    if (totalCaseKeywords >= CASE_KEYWORDS_LIMITS.maxCaseKeywords) return false;
    const trimmed = inputValue.trim();
    if (!trimmed) return false;
    if (trimmed.length > CASE_KEYWORDS_LIMITS.maxKeywordLength) return false;
    if (newKeywords.some((kw) => kw.toLowerCase() === trimmed.toLowerCase()))
      return false;
    if (newKeywords.length >= CASE_KEYWORDS_LIMITS.maxKeywords) return false;
    return true;
  };

  const canSave = () => {
    if (hasUserKeywords) return false;
    if (totalCaseKeywords > CASE_KEYWORDS_LIMITS.maxCaseKeywords) return false;
    return newKeywords.length > 0 && !isSaving;
  };

  return (
    <FieldContainer
      title=""
      isDisputable={isComplete && existingKeywords.length > 0}
      onCreateReviewDispute={() => onCreateDispute?.()}
      onSave={handleSave}
      isSaveDisabled={!canSave() || hasUserKeywords}
      saveLabel={isSaving ? 'Wird gespeichert...' : 'Speichern'}
    >
      <div className="space-y-6">
        {/* Erstellte Stichwörter (bestehend + neu) */}
        {(existingKeywords.length > 0 || newKeywords.length > 0) && (
          <div className="space-y-2">
            <Label className="text-body-sm font-medium text-foreground">
              Erstellte Stichwörter{' '}
              <span className="text-muted-foreground text-body-sm ml-1">
                {totalCaseKeywords}/{CASE_KEYWORDS_LIMITS.maxCaseKeywords}
              </span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {/* Bestehende Keywords (read-only) */}
              {existingKeywords.map((kw) => (
                <Tag
                  key={`existing-${kw}`}
                  label={kw}
                  removable={false}
                  variant="primary-muted"
                />
              ))}
              {/* Neu hinzugefügte Keywords (removable) */}
              {newKeywords.map((kw, index) => (
                <Tag
                  key={`new-${index}`}
                  label={kw}
                  removable={true}
                  onRemove={() => handleRemoveKeyword(index)}
                  disabled={isSaving || hasUserKeywords}
                  variant="primary"
                />
              ))}
            </div>
          </div>
        )}

        {/* Neues Stichwort erstellen */}
        <div>
          <Label className="text-body-sm font-medium text-foreground">
            Neues Stichwort erstellen
          </Label>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start mt-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Stichwort eingeben (max. ${CASE_KEYWORDS_LIMITS.maxKeywordLength} Zeichen)`}
              disabled={
                hasUserKeywords ||
                hasReachedCaseKeywordsLimit ||
                isSaving ||
                newKeywords.length >= CASE_KEYWORDS_LIMITS.maxKeywords
              }
              maxLength={CASE_KEYWORDS_LIMITS.maxKeywordLength}
              className="w-full"
            />

            <Button
              onClick={handleAddKeyword}
              disabled={
                !canAddKeyword() ||
                isSaving ||
                hasUserKeywords ||
                hasReachedCaseKeywordsLimit
              }
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Hinzufügen
            </Button>
          </div>
          <div className="mt-1">
            {issue && (
              <Label className="text-destructive text-body-sm">
                {issue.message}
              </Label>
            )}
            {newKeywords.length >= CASE_KEYWORDS_LIMITS.maxKeywords && (
              <Label className="text-muted-foreground text-body-sm">
                Du hast die Maximale Anzahl von{' '}
                {CASE_KEYWORDS_LIMITS.maxKeywords} Stichwörtern erreicht
              </Label>
            )}
            {inputValue.trim().length >
              CASE_KEYWORDS_LIMITS.maxKeywordLength && (
              <Label className="text-destructive text-body-sm">
                Stichwort darf maximal {CASE_KEYWORDS_LIMITS.maxKeywordLength}{' '}
                Zeichen lang sein
              </Label>
            )}
            {inputValue.trim() &&
              newKeywords.some(
                (kw) => kw.toLowerCase() === inputValue.trim().toLowerCase(),
              ) && (
                <Label className="text-destructive text-body-sm">
                  Dieses Stichwort existiert bereits
                </Label>
              )}
            {hasUserKeywords && (
              <Label className="text-destructive text-body-sm">
                Du hast bereits Stichwörter für diesen Fall erstellt.
              </Label>
            )}
            {hasReachedCaseKeywordsLimit && (
              <Label className="text-destructive text-body-sm">
                Es können maximal {CASE_KEYWORDS_LIMITS.maxCaseKeywords}{' '}
                Stichwörter pro Fall erstellt werden.
              </Label>
            )}
          </div>
        </div>
      </div>
    </FieldContainer>
  );
};

export default Keywords;
