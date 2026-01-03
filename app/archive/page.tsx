import { aggregatedReviewsQuery } from '@/lib/queries/getAggregatedReviews';
import { createClient } from '@/lib/supabase/server';
import { getQueryClient } from '@/lib/utils/get-query-client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ArchiveList } from './archive-list';

async function ArchiveContent() {
  const queryClient = getQueryClient();
  const supabase = await createClient();

  // Prefetch the data on the server
  await queryClient.prefetchQuery(aggregatedReviewsQuery(supabase));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ArchiveList />
    </HydrationBoundary>
  );
}

export default function ArchivePage() {
  return (
    <Suspense fallback={<div>Loading archive...</div>}>
      <ArchiveContent />
    </Suspense>
  );
}
