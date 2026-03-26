import { z } from 'zod';

export const CASE_KEYWORDS_LIMITS = {
  minKeywords: 1,
  // Per-User-Limit (validiert über caseKeywordsSchema beim Speichern)
  maxKeywords: 3,
  // Gesamt-Limit pro Fall (Frontend-UI-Check im Keywords-Field)
  maxCaseKeywords: 10,
  minKeywordLength: 1,
  maxKeywordLength: 50,
} as const;

export const caseTitleSchema = z
  .string()
  .min(10, 'Mindestens 10 Zeichen erforderlich')
  .max(500, 'Maximal 500 Zeichen erlaubt');

export const caseKeywordsSchema = z
  // Validiert ausschließlich das vom aktuellen User neu zu speichernde Set
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
  .max(
    CASE_KEYWORDS_LIMITS.maxKeywords,
    `Maximal ${CASE_KEYWORDS_LIMITS.maxKeywords} Stichwörter erlaubt`,
  );

export const caseCategorySchema = z.enum(
  ['satire', 'report', 'text_message', 'opinion'],
  { error: 'Bitte wähle eine Kategorie aus' },
);

export const factcheckUrlSchema = z
  .url('Bitte gib eine gültige URL ein')
  .max(2000, 'Maximal 2000 Zeichen erlaubt');

export const caseFactcheckSchema = z
  .object({
    hasFactcheck: z.boolean(),
    value: z.string().nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.hasFactcheck) return;

    const normalizedValue = data.value?.trim() ?? '';
    if (!normalizedValue) {
      ctx.addIssue({
        code: 'custom',
        path: ['value'],
        message: 'Bitte gib eine gültige URL ein',
      });
      return;
    }

    const result = factcheckUrlSchema.safeParse(normalizedValue);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        ctx.addIssue({
          code: 'custom',
          path: ['value'],
          message: issue.message,
        });
      });
    }
  });

export type CaseCategoryValue = z.infer<typeof caseCategorySchema>;
export type CaseFactcheckValue = z.infer<typeof caseFactcheckSchema>;
