import { CaseCategoryValue } from '@/lib/schemas/case-metadata-schemas';

export const CASE_CATEGORY_LABELS: Record<CaseCategoryValue, string> = {
  satire: 'Satire',
  report: 'Bericht',
  text_message: 'Textnachricht',
  opinion: 'Meinung',
};

export const CASE_CATEGORY_OPTIONS: { id: CaseCategoryValue; text: string }[] =
  (Object.entries(CASE_CATEGORY_LABELS) as [CaseCategoryValue, string][]).map(
    ([id, text]) => ({ id, text }),
  );

export const getCaseCategoryLabel = (category?: string | null) => {
  if (!category) return category;
  if (category in CASE_CATEGORY_LABELS) {
    return CASE_CATEGORY_LABELS[category as CaseCategoryValue];
  }
  return category;
};
