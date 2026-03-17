import { CaseCategoryValue } from '@/lib/schemas/case-metadata-schemas';

// Template version constant
// This should match the latest template version in the database
export const CURRENT_TEMPLATE_VERSION = 1;

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
