import { z } from 'zod';

export const caseTitleSchema = z
  .string()
  .min(10, 'Mindestens 10 Zeichen erforderlich')
  .max(500, 'Maximal 500 Zeichen erlaubt');

export const caseKeywordsSchema = z
  .array(z.string().min(1).max(50, 'Stichwort darf maximal 50 Zeichen haben'))
  .min(1, 'Mindestens ein Stichwort erforderlich')
  .max(5, 'Maximal 5 Stichwörter erlaubt');

export const caseCategorySchema = z.enum(
  ['satire', 'report', 'text_message', 'opinion'],
  { error: 'Bitte wähle eine Kategorie aus' },
);

export type CaseCategoryValue = z.infer<typeof caseCategorySchema>;
