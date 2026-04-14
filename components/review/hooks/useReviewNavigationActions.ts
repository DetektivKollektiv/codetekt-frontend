'use client';

import type { ReviewFlowEvent } from '@/lib/review-flow/machine';
import type { ReviewFlowSelection } from '@/lib/review-flow/selectors';
import { useCallback, useMemo } from 'react';
import type { Dispatch } from 'react';

interface UseReviewNavigationActionsOptions {
  dispatch: Dispatch<ReviewFlowEvent>;
  selection: ReviewFlowSelection;
  isLocked: boolean;
}

export const useReviewNavigationActions = ({
  dispatch,
  selection,
  isLocked,
}: UseReviewNavigationActionsOptions) => {
  const reachableStepIds = useMemo(
    () => selection.reachableSteps.map((step) => step.id),
    [selection.reachableSteps],
  );

  const selectStep = useCallback(
    (stepId: string) => {
      dispatch({ type: 'NAVIGATE', stepId, reachableStepIds });
    },
    [dispatch, reachableStepIds],
  );

  const goPrev = useCallback(() => {
    if (isLocked || selection.currentStepIndex <= 0) return;
    const previousStep = selection.reachableSteps[selection.currentStepIndex - 1];
    if (previousStep) selectStep(previousStep.id);
  }, [isLocked, selectStep, selection.currentStepIndex, selection.reachableSteps]);

  const goNext = useCallback(() => {
    if (
      isLocked ||
      selection.currentStepIndex < 0 ||
      selection.currentStepIndex >= selection.reachableSteps.length - 1
    ) {
      return;
    }

    const nextStep = selection.reachableSteps[selection.currentStepIndex + 1];
    if (nextStep) selectStep(nextStep.id);
  }, [isLocked, selectStep, selection.currentStepIndex, selection.reachableSteps]);

  return {
    goPrev,
    goNext,
    selectStep,
  };
};
