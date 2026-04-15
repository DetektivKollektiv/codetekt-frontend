import {
  METADATA_STEP_CATEGORY,
  METADATA_STEP_FACTCHECK,
  METADATA_STEP_KEYWORDS,
  METADATA_STEP_TITLE,
} from '@/lib/constants';
import {
  caseCategorySchema,
  caseFactcheckSchema,
  caseTitleSchema,
  userKeywordsSchema,
} from '@/lib/schemas/case-metadata-schemas';
import { ReviewStepStatus } from '@/lib/types';
import { $ZodIssue } from 'zod/v4/core';
import type {
  FactcheckSelection,
  MetadataDirtyState,
  MetadataDraftState,
} from './index';

export interface MetadataValidationIssues {
  title: $ZodIssue[];
  keywords: $ZodIssue[];
  category: $ZodIssue[];
  factcheck: $ZodIssue[];
}

export interface MetadataStepStatuses {
  title: ReviewStepStatus;
  keywords: ReviewStepStatus;
  category: ReviewStepStatus;
  factcheck: ReviewStepStatus;
}

export type MetadataStepKey = keyof MetadataDirtyState;

export const createCustomIssue = (
  path: PropertyKey[],
  message: string,
): $ZodIssue =>
  ({
    code: 'custom',
    path,
    message,
  }) as unknown as $ZodIssue;

export const validateMetadataDraft = ({
  metadataDraft,
  metadataSaved,
}: {
  metadataDraft: MetadataDraftState;
  metadataSaved: MetadataDirtyState;
}): MetadataValidationIssues => {
  const titleResult = metadataSaved.title
    ? null
    : caseTitleSchema.safeParse(metadataDraft.title);
  const shouldValidateUserKeywords =
    !metadataSaved.keywords || metadataDraft.userKeywords.length > 0;
  const keywordsResult = shouldValidateUserKeywords
    ? userKeywordsSchema.safeParse(metadataDraft.userKeywords)
    : null;
  const categoryResult = metadataSaved.category
    ? null
    : caseCategorySchema.safeParse(metadataDraft.category);

  let factcheckIssues: $ZodIssue[] = [];
  if (!metadataSaved.factcheck) {
    if (!metadataDraft.factcheckSelection) {
      factcheckIssues = [
        createCustomIssue(
          ['hasFactcheck'],
          'Bitte wähle aus, ob bereits ein Faktencheck existiert.',
        ),
      ];
    } else {
      const factcheckResult = caseFactcheckSchema.safeParse({
        hasFactcheck: metadataDraft.factcheckSelection === 'yes',
        value:
          metadataDraft.factcheckSelection === 'yes'
            ? metadataDraft.factcheckValue.trim() || null
            : null,
      });
      factcheckIssues = factcheckResult.success
        ? []
        : factcheckResult.error.issues;
    }
  }

  return {
    title: !titleResult || titleResult.success ? [] : titleResult.error.issues,
    keywords:
      !keywordsResult || keywordsResult.success
        ? []
        : keywordsResult.error.issues,
    category:
      !categoryResult || categoryResult.success
        ? []
        : categoryResult.error.issues,
    factcheck: factcheckIssues,
  };
};

export const filterMetadataIssuesByTouched = (
  issues: MetadataValidationIssues,
  touchedStepIds: Set<string>,
): MetadataValidationIssues => ({
  title: touchedStepIds.has(METADATA_STEP_TITLE) ? issues.title : [],
  keywords: touchedStepIds.has(METADATA_STEP_KEYWORDS) ? issues.keywords : [],
  category: touchedStepIds.has(METADATA_STEP_CATEGORY) ? issues.category : [],
  factcheck: touchedStepIds.has(METADATA_STEP_FACTCHECK)
    ? issues.factcheck
    : [],
});

const getMetadataStatus = ({
  isSaved,
  isTouched,
  issues,
}: {
  isSaved: boolean;
  isTouched: boolean;
  issues: $ZodIssue[];
}): ReviewStepStatus => {
  if (isSaved) return 'success';
  return isTouched && issues.length > 0 ? 'error' : 'incomplete';
};

export const getMetadataStepStatuses = ({
  issues,
  metadataSaved,
  touchedStepIds,
}: {
  issues: MetadataValidationIssues;
  metadataSaved: MetadataDirtyState;
  touchedStepIds: Set<string>;
}): MetadataStepStatuses => ({
  title: getMetadataStatus({
    isSaved: metadataSaved.title,
    isTouched: touchedStepIds.has(METADATA_STEP_TITLE),
    issues: issues.title,
  }),
  keywords: getMetadataStatus({
    isSaved: metadataSaved.keywords,
    isTouched: touchedStepIds.has(METADATA_STEP_KEYWORDS),
    issues: issues.keywords,
  }),
  category: getMetadataStatus({
    isSaved: metadataSaved.category,
    isTouched: touchedStepIds.has(METADATA_STEP_CATEGORY),
    issues: issues.category,
  }),
  factcheck: getMetadataStatus({
    isSaved: metadataSaved.factcheck,
    isTouched: touchedStepIds.has(METADATA_STEP_FACTCHECK),
    issues: issues.factcheck,
  }),
});

export const buildFactcheckSavePayload = (
  selection: FactcheckSelection,
  value: string,
) => {
  if (!selection) return null;

  return {
    hasFactcheck: selection === 'yes',
    value: selection === 'yes' ? value : null,
  };
};
