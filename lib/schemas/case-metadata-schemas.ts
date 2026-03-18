import { z } from 'zod';

export const CASE_KEYWORDS_LIMITS = {
  minKeywords: 1,
  maxKeywords: 5,
  minKeywordLength: 1,
  maxKeywordLength: 50,
} as const;

export const caseTitleSchema = z
  .string()
  .min(10, 'Mindestens 10 Zeichen erforderlich')
  .max(500, 'Maximal 500 Zeichen erlaubt');

export const caseKeywordsSchema = z
  .array(
    z
      .string()
      .min(CASE_KEYWORDS_LIMITS.minKeywordLength)
      .max(
        CASE_KEYWORDS_LIMITS.maxKeywordLength,
        `Stichwort darf maximal ${CASE_KEYWORDS_LIMITS.maxKeywordLength} Zeichen haben`,
      ),
  )
  .min(
    CASE_KEYWORDS_LIMITS.minKeywords,
    'Mindestens ein Stichwort erforderlich',
  )
  .max(CASE_KEYWORDS_LIMITS.maxKeywords, 'Maximal 5 Stichwörter erlaubt');

export const caseCategorySchema = z.enum(
  ['satire', 'report', 'text_message', 'opinion'],
  { error: 'Bitte wähle eine Kategorie aus' },
);

export type CaseCategoryValue = z.infer<typeof caseCategorySchema>;
