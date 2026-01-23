'use client';
import { createClient } from '@/lib/supabase/client';
import { getAuth } from '@/lib/supabase/getAuth';
import { Case, getCase } from '@/lib/queries/getCase';
import {
  getReviewTemplate,
  ReviewTemplate,
} from '@/lib/queries/getReviewTemplate';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import ReviewContent from './review-content';

interface ReviewProps {
  reviewTemplate: NonNullable<ReviewTemplate>;
  caseData: NonNullable<Case>;
  isSubmitted: boolean;
}

const Review: FC<ReviewProps> = ({
  reviewTemplate: initialReviewTemplate,
  caseData: initialCaseData,
  isSubmitted: initialIsSubmitted,
}) => {
  const supabase = createClient();

  // Auth context
  const { data: authData } = useQuery({
    queryFn: () => getAuth(supabase),
    queryKey: ['auth'],
  });

  const userId = authData?.user?.id;

  // Case data with useQuery
  const { data: caseData } = useQuery({
    queryKey: ['case', initialCaseData.id],
    queryFn: async () => {
      const { data, error } = await getCase(supabase, initialCaseData.id);
      if (error) throw error;
      return data;
    },
    initialData: initialCaseData,
  });

  // Review template with useQuery
  const { data: reviewTemplate } = useQuery({
    queryKey: ['review-template', initialCaseData.id],
    queryFn: async () => {
      const { data, error } = await getReviewTemplate(
        supabase,
        initialCaseData.id,
      );
      if (error) throw error;
      return data;
    },
    initialData: initialReviewTemplate,
  });

  // Early return if data is null (shouldn't happen with initialData)
  if (!caseData || !reviewTemplate) {
    return null;
  }

  return (
    <ReviewContent
      reviewTemplate={reviewTemplate}
      caseData={caseData}
      isSubmitted={initialIsSubmitted}
      userId={userId}
    />
  );
};

export default Review;