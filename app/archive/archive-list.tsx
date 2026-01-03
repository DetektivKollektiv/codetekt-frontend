'use client';

import { aggregatedReviewsQuery } from '@/lib/queries/getAggregatedReviews';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { FC, useEffect } from 'react';

export const ArchiveList: FC = () => {
  const client = createClient();

  const {
    data: aggregatedReviews,
    isLoading,
    isError,
    error,
  } = useQuery(aggregatedReviewsQuery(client));

  // log aggregatedReviews for debugging after fetching
  useEffect(() => {
    if (aggregatedReviews) {
      console.log('Aggregated Reviews:', aggregatedReviews);
    }
  }, [aggregatedReviews]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div>
      {aggregatedReviews?.map((caseItem) => (
        <div key={caseItem.case_id}>{caseItem.case_id}</div>
      ))}
    </div>
  );
};
