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
  const enabledStepIds = useMemo(
    () => selection.enabledSteps.map((step) => step.id),
    [selection.enabledSteps],
  );

  const selectStep = useCallback(
    (stepId: string) => {
      dispatch({ type: 'NAVIGATE', stepId, enabledStepIds });
    },
    [dispatch, enabledStepIds],
  );

  const goPrev = useCallback(() => {
    if (isLocked || selection.currentStepIndex <= 0) return;
    const previousStep = selection.enabledSteps[selection.currentStepIndex - 1];
    if (previousStep) selectStep(previousStep.id);
  }, [isLocked, selectStep, selection.currentStepIndex, selection.enabledSteps]);

  const goNext = useCallback(() => {
    if (
      isLocked ||
      selection.currentStepIndex < 0 ||
      selection.currentStepIndex >= selection.enabledSteps.length - 1
    ) {
      return;
    }

    const nextStep = selection.enabledSteps[selection.currentStepIndex + 1];
    if (nextStep) selectStep(nextStep.id);
  }, [isLocked, selectStep, selection.currentStepIndex, selection.enabledSteps]);

  return {
    goPrev,
    goNext,
    selectStep,
  };
};
