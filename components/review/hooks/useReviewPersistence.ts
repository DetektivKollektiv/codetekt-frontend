'use client';

import { createClient } from '@/lib/supabase/client';
import { useMemo } from 'react';
import { useMetadataSave } from './useMetadataSave';
import { useReviewSubmission } from './useReviewSubmission';
import { useSaveFinalComment } from './useSaveFinalComment';

interface UseReviewPersistenceOptions {
  caseId: string;
  userId?: string;
}

export const useReviewPersistence = ({
  caseId,
  userId,
}: UseReviewPersistenceOptions) => {
  const supabase = useMemo(() => createClient(), []);
  const metadata = useMetadataSave({ supabase, caseId, userId });
  const review = useReviewSubmission({ supabase, caseId });
  const comment = useSaveFinalComment({ supabase, caseId, userId });

  return {
    metadata,
    review,
    comment,
    status: {
      isTitlePending: metadata.isTitlePending,
      isKeywordsPending: metadata.isKeywordsPending,
      isCategoryPending: metadata.isCategoryPending,
      isFactcheckPending: metadata.isFactcheckPending,
      isSavingPending: review.isSavingPending,
      isSubmitting: review.isSubmitting,
      isSavingFinalComment: comment.isSavingFinalComment,
    },
  };
};
