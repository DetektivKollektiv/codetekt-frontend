'use client';

import { createInitialReviewFlowState } from '@/lib/review-flow';
import type { ReviewFlowSnapshot, ReviewFlowState } from '@/lib/review-flow';
import { transitionReviewFlow } from '@/lib/review-flow/machine';
import type { ReviewFlowEvent } from '@/lib/review-flow/machine';
import { useEffect, useReducer } from 'react';
import type { Dispatch } from 'react';

const reducer = (
  state: ReviewFlowState,
  event: ReviewFlowEvent,
): ReviewFlowState => transitionReviewFlow(state, event);

export const useReviewMachine = (snapshot: ReviewFlowSnapshot) => {
  const [state, dispatch] = useReducer(
    reducer,
    snapshot,
    createInitialReviewFlowState,
  );

  useEffect(() => {
    dispatch({ type: 'HYDRATE', snapshot });
  }, [snapshot]);

  return { state, dispatch: dispatch as Dispatch<ReviewFlowEvent> };
};
