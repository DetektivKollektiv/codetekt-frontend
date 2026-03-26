import { CaseCategoryValue } from '@/lib/schemas/case-metadata-schemas';

// Template version constant
// This should match the latest template version in the database
export const CURRENT_TEMPLATE_VERSION = 1;

export const CASE_CATEGORY_LABELS: Record<CaseCategoryValue, string> = {
  text_message: 'Textnachricht',
  opinion: 'Meinung',
  report: 'Bericht',
  satire: 'Satire',
};

export const CASE_CATEGORY_OPTIONS: { id: CaseCategoryValue; text: string }[] =
  (Object.entries(CASE_CATEGORY_LABELS) as [CaseCategoryValue, string][]).map(
    ([id, text]) => ({ id, text }),
  );

export const METADATA_STEP_TITLE = 'meta_title';
export const METADATA_STEP_KEYWORDS = 'meta_keywords';
export const METADATA_STEP_CATEGORY = 'meta_category';
export const METADATA_STEP_FACTCHECK = 'meta_factcheck';
export const COMMENT_STEP = 'comment_step';
export const SUBMIT_STEP = 'submit_step';
