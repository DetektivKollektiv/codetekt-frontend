'use client';

import type { ReviewFlowEvent } from '@/lib/review-flow/machine';
import {
  getIncompleteStepIds,
} from '@/lib/review-flow/selectors';
import type { ReviewFlowSelection } from '@/lib/review-flow/selectors';
import type { Field } from '@/lib/schemas/field-schemas';
import { useCallback } from 'react';
import type { Dispatch } from 'react';
import { useReviewPersistence } from './useReviewPersistence';

interface UseReviewAnswerActionsOptions {
  dispatch: Dispatch<ReviewFlowEvent>;
  selection: ReviewFlowSelection;
  persistence: ReturnType<typeof useReviewPersistence>;
  userId?: string;
}

export const useReviewAnswerActions = ({
  dispatch,
  selection,
  persistence,
  userId,
}: UseReviewAnswerActionsOptions) => {
  const changeField = useCallback(
    (questionId: string, fieldId: string, value: Field['answer_value']) => {
      dispatch({ type: 'UPDATE_ANSWER', questionId, fieldId, value });
    },
    [dispatch],
  );

  const saveInProgress = useCallback(async () => {
    const didSave = await persistence.review.saveInProgress({
      data: selection.inProgressReviewAnswerData,
      userId,
    });

    if (didSave) {
      dispatch({
        type: 'REVIEW_ANSWERS_SAVE_SUCCEEDED',
        data: selection.inProgressReviewAnswerData,
      });
    }
  }, [dispatch, persistence.review, selection.inProgressReviewAnswerData, userId]);

  const submitReview = useCallback(async () => {
    dispatch({
      type: 'SUBMIT_ATTEMPTED',
      incompleteStepIds: getIncompleteStepIds(selection.enabledSteps),
    });

    if (selection.submitBlockers.length > 0) return;

    const didSubmit = await persistence.review.submitReview({
      userId,
      caseCategory: selection.effective.caseCategory,
      hasFactcheck: selection.effective.shouldSkipReviewQuestions,
      inProgressReviewAnswerData: selection.inProgressReviewAnswerData,
    });

    if (didSubmit) {
      dispatch({
        type: 'SUBMIT_SUCCEEDED',
        data: selection.inProgressReviewAnswerData,
      });
    }
  }, [dispatch, persistence.review, selection, userId]);

  return {
    changeField,
    saveInProgress,
    submitReview,
  };
};
