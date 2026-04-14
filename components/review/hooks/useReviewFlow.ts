'use client';

import { buildReviewFlowSnapshot } from '@/lib/review-flow';
import type { ReviewFlowSnapshot } from '@/lib/review-flow';
import { selectReviewFlow } from '@/lib/review-flow/selectors';
import type { Case } from '@/lib/queries/getCase';
import type { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { useEffect, useMemo } from 'react';
import { buildReviewFlowReturn } from './reviewFlowReturn';
import { useReviewAnswerActions } from './useReviewAnswerActions';
import { useReviewCommentActions } from './useReviewCommentActions';
import { useReviewDispute } from './useReviewDispute';
import { useReviewMachine } from './useReviewMachine';
import { useReviewMetadataActions } from './useReviewMetadataActions';
import { useReviewNavigationActions } from './useReviewNavigationActions';
import { useReviewPersistence } from './useReviewPersistence';
import { useUnsavedChangesWarning } from './useUnsavedChangesWarning';

interface UseReviewFlowOptions {
  reviewTemplate: NonNullable<ReviewTemplate>;
  caseData: NonNullable<Case>;
  isSubmitted: boolean;
  isReviewTemplateFetching: boolean;
  userId?: string;
}

const useReviewFlowSnapshot = ({
  reviewTemplate,
  caseData,
  isSubmitted,
  isReviewTemplateFetching,
  userId,
}: UseReviewFlowOptions): ReviewFlowSnapshot =>
  useMemo(
    () =>
      buildReviewFlowSnapshot({
        caseData,
        reviewTemplate,
        isSubmitted,
        isReviewTemplateFetching,
        userId,
      }),
    [caseData, isReviewTemplateFetching, isSubmitted, reviewTemplate, userId],
  );

export const useReviewFlow = (options: UseReviewFlowOptions) => {
  const snapshot = useReviewFlowSnapshot(options);
  const { state, dispatch } = useReviewMachine(snapshot);
  const selection = useMemo(
    () => selectReviewFlow(state, snapshot),
    [state, snapshot],
  );
  const persistence = useReviewPersistence({
    caseId: options.caseData.id,
    userId: options.userId,
  });
  const navigationActions = useReviewNavigationActions({
    dispatch,
    selection,
    isLocked: state.isLocked,
  });
  const metadataActions = useReviewMetadataActions({
    dispatch,
    state,
    selection,
    issues: selection.metadataIssues,
    persistence,
  });
  const answerActions = useReviewAnswerActions({
    dispatch,
    selection,
    persistence,
    userId: options.userId,
  });
  const commentActions = useReviewCommentActions({
    dispatch,
    state,
    selection,
    persistence,
  });
  const dispute = useReviewDispute({
    caseId: options.caseData.id,
    userId: options.userId,
  });

  useEffect(() => {
    if (selection.repairedCurrentStepId !== state.currentStepId) {
      dispatch({
        type: 'REPAIR_CURRENT_STEP',
        stepId: selection.repairedCurrentStepId,
      });
    }
  }, [dispatch, selection.repairedCurrentStepId, state.currentStepId]);

  useUnsavedChangesWarning({
    hasUnsavedChanges: selection.hasUnsavedChanges,
    isActive: selection.isUnsavedChangesWarningActive,
  });

  return buildReviewFlowReturn({
    state,
    snapshot,
    selection,
    persistence,
    navigationActions,
    metadataActions,
    answerActions,
    commentActions,
    dispute,
    isReviewTemplateFetching: options.isReviewTemplateFetching,
  });
};
