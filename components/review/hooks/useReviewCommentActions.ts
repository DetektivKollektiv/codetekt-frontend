'use client';

import type { ReviewFlowState } from '@/lib/review-flow';
import type { ReviewFlowEvent } from '@/lib/review-flow/machine';
import type { ReviewFlowSelection } from '@/lib/review-flow/selectors';
import { useCallback } from 'react';
import type { Dispatch } from 'react';
import { useReviewPersistence } from './useReviewPersistence';

interface UseReviewCommentActionsOptions {
  dispatch: Dispatch<ReviewFlowEvent>;
  state: ReviewFlowState;
  selection: ReviewFlowSelection;
  persistence: ReturnType<typeof useReviewPersistence>;
}

export const useReviewCommentActions = ({
  dispatch,
  state,
  selection,
  persistence,
}: UseReviewCommentActionsOptions) => {
  const change = useCallback(
    (value: string) => dispatch({ type: 'SET_FINAL_COMMENT', value }),
    [dispatch],
  );

  const save = useCallback(async () => {
    const didSave = await persistence.comment.saveFinalComment(
      state.finalCommentDraft,
      selection.effective.finalStepEnabled,
    );

    if (didSave) {
      dispatch({ type: 'COMMENT_SAVE_SUCCEEDED' });
    }
  }, [
    dispatch,
    persistence.comment,
    selection.effective.finalStepEnabled,
    state.finalCommentDraft,
  ]);

  return { change, save };
};
