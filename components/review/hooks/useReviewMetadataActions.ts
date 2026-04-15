'use client';

import {
  METADATA_STEP_CATEGORY,
  METADATA_STEP_FACTCHECK,
  METADATA_STEP_KEYWORDS,
} from '@/lib/constants';
import type { ReviewFlowState } from '@/lib/review-flow';
import type { ReviewFlowEvent } from '@/lib/review-flow/machine';
import {
  getNextStepAfterFactcheck,
} from '@/lib/review-flow/selectors';
import type { ReviewFlowSelection } from '@/lib/review-flow/selectors';
import {
  buildFactcheckSavePayload,
} from '@/lib/review-flow/validation';
import type { MetadataValidationIssues } from '@/lib/review-flow/validation';
import type { CaseCategoryValue } from '@/lib/schemas/case-metadata-schemas';
import type { Dispatch } from 'react';
import { runMetadataSave } from './metadataActionHelpers';
import { useReviewPersistence } from './useReviewPersistence';

interface UseReviewMetadataActionsOptions {
  dispatch: Dispatch<ReviewFlowEvent>;
  state: ReviewFlowState;
  selection: ReviewFlowSelection;
  issues: MetadataValidationIssues;
  persistence: ReturnType<typeof useReviewPersistence>;
}

export const useReviewMetadataActions = ({
  dispatch,
  state,
  selection,
  issues,
  persistence,
}: UseReviewMetadataActionsOptions) => {
  const currentStepId =
    selection.currentStep?.id ?? selection.repairedCurrentStepId;

  return {
    changeTitle: (value: string) => dispatch({ type: 'UPDATE_TITLE', value }),
    changeKeywords: (value: string[]) =>
      dispatch({ type: 'UPDATE_KEYWORDS', value }),
    changeCategory: (value: CaseCategoryValue | null) =>
      dispatch({ type: 'UPDATE_CATEGORY', value }),
    changeFactcheckSelection: (value: ReviewFlowState['metadataDraft']['factcheckSelection']) =>
      dispatch({ type: 'UPDATE_FACTCHECK_SELECTION', value }),
    changeFactcheckValue: (value: string) =>
      dispatch({ type: 'UPDATE_FACTCHECK_VALUE', value }),
    saveTitle: () =>
      runMetadataSave({
        dispatch,
        currentStepId,
        issues: issues.title,
        step: 'title',
        nextStepId: METADATA_STEP_KEYWORDS,
        save: () => persistence.metadata.saveTitle(state.metadataDraft.title),
      }),
    saveKeywords: () =>
      runMetadataSave({
        dispatch,
        currentStepId,
        issues: issues.keywords,
        step: 'keywords',
        nextStepId: METADATA_STEP_CATEGORY,
        save: () => persistence.metadata.saveKeywords(state.metadataDraft.userKeywords),
      }),
    saveCategory: () => {
      if (!state.metadataDraft.category) {
        dispatch({ type: 'STEPS_TOUCHED', stepIds: [currentStepId] });
        return;
      }
      return runMetadataSave({
        dispatch,
        currentStepId,
        issues: issues.category,
        step: 'category',
        nextStepId: METADATA_STEP_FACTCHECK,
        save: () => persistence.metadata.saveCategory(state.metadataDraft.category!),
      });
    },
    saveFactcheck: () => {
      const payload = buildFactcheckSavePayload(
        state.metadataDraft.factcheckSelection,
        state.metadataDraft.factcheckValue,
      );
      if (!payload) {
        dispatch({ type: 'STEPS_TOUCHED', stepIds: [currentStepId] });
        return;
      }
      return runMetadataSave({
        dispatch,
        currentStepId,
        issues: issues.factcheck,
        step: 'factcheck',
        nextStepId: getNextStepAfterFactcheck({
          factcheckSelection: state.metadataDraft.factcheckSelection,
          shownQuestions: selection.shownReviewTemplateQuestions,
        }),
        save: () => persistence.metadata.saveFactcheck(payload),
      });
    },
  };
};
