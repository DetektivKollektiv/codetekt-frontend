'use client';

import { FieldContainer } from '@/components/review/fields/field-container';
import { Chip } from '@/components/ui/chip';
import { Label } from '@/components/ui/label';
import { CASE_CATEGORY_OPTIONS } from '@/lib/constants';
import { CaseCategoryValue } from '@/lib/schemas/case-metadata-schemas';
import { FC, ReactNode } from 'react';
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

const CATEGORY_INFO_TEXTS: Record<CaseCategoryValue, ReactNode> = {
  text_message:
    'Mit einer Textnachricht meinen wir in der Regel Nachrichten aus Messenger-Diensten wie WhatsApp oder Telegram oder Inhalte und Posts aus sozialen Medien (z.B. auf Facebook oder X). Meistens sind das also keine Nachrichten, die in einem journalistischen Medium (Nachrichtenportalen, Websites von Zeitungen, Blogs) veröffentlicht wurden.',
  opinion: (
    <>
      Hierbei handelt es sich um einen Beitrag, der die Meinung des*r Autor*in
      widerspiegelt. Typische Formen für solche Beiträge sind Kommentare,
      Glossen oder Essays. Eine vollständige Liste findest du{' '}
      <a
        href="https://de.wikipedia.org/wiki/Journalistische_Darstellungsform#Meinungs%C3%A4u%C3%9Fernde_Darstellungsformen"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-foreground"
      >
        hier
      </a>
      . Der deutsche Fachjournalisten-Verband fordert, dass Meinungsbeiträge{' '}
      <a
        href="https://www.fachjournalist.de/PDF-Dateien/2012/04/FJ_2_2002-Journalistisches-Schreiben-2_Meinungsbetonte-Darstellungsformen.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-foreground"
      >
        klar als solche gekennzeichnet sein müssen
      </a>
      .
    </>
  ),
  report: (
    <>
      Alle Beiträge, die nicht klar als Meinungsbeitrag gekennzeichnet sind,
      fallen unter die Kategorie “Bericht”. Ein Bericht sollte objektiv und
      ausgewogen sein. Wir nutzen den Begriff “Bericht” umfassend und meinen
      damit alle{' '}
      <a
        href="https://de.wikipedia.org/wiki/Journalistische_Darstellungsform#Informierende_Darstellungsformen"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-foreground"
      >
        informierenden journalistischen Darstellungsformen
      </a>{' '}
      (Kurzmeldung, Nachricht, Bericht, Reportage, etc.).
    </>
  ),
  satire:
    'Satire stellt eine Kunstform dar, bei der journalistische Qualitätskriterien bewusst missachtet werden. Dementsprechend lassen sich auch die Trust-Checking-Kriterien nicht sinnvoll anwenden. Wenn du einen Fall als Satire einordnest endet die Bewertung damit und dieser wird auch im Archiv als Satire gekennzeichnet',
};

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
  const selectedInfoText = selected ? CATEGORY_INFO_TEXTS[selected] : null;
  const isInputDisabled = isSaving || (isComplete && !!value);
  const isSaveDisabled = isComplete ? isSaving : isSaving || !selected;

  const handleToggle = (optionId: string) => {
    if (isInputDisabled) return;

    const nextValue = optionId as CaseCategoryValue;
    onChange(selected === nextValue ? null : nextValue);
  };

  return (
    <FieldContainer
      title={fieldTitle ?? 'Welche Kategorie trifft auf diesen Fall zu?'}
      isDisputable={isComplete && !!value}
      onCreateReviewDispute={() => onCreateDispute?.()}
      onSave={onSave}
      isSaveDisabled={isSaveDisabled}
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
                disabled={isInputDisabled}
                hasError={issue !== null}
                onClick={() => handleToggle(option.id)}
              />
            );
          })}
        </div>
        {selectedInfoText && (
          <Label className="text-muted-foreground text-body-sm block leading-normal pt-4">
            {selectedInfoText}
          </Label>
        )}
        {issue && <Label className="text-destructive">{issue.message}</Label>}
      </div>
    </FieldContainer>
  );
};

export default Category;
