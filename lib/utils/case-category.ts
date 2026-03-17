import { CASE_CATEGORY_LABELS, CASE_CATEGORY_OPTIONS } from '@/lib/constants';
import { CaseCategoryValue } from '@/lib/schemas/case-metadata-schemas';

export { CASE_CATEGORY_LABELS, CASE_CATEGORY_OPTIONS };

export const getCaseCategoryLabel = (category?: string | null) => {
  if (!category) return category;
  if (category in CASE_CATEGORY_LABELS) {
    return CASE_CATEGORY_LABELS[category as CaseCategoryValue];
  }
  return category;
};
