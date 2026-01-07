'use client';

import { ArchiveItemCard } from '@/components/archive-item-card';
import { aggregatedReviewsQuery } from '@/lib/queries/getAggregatedReviews';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

export const ArchiveList: FC = () => {
  const client = createClient();

  const {
    data: aggregatedReviews,
    isLoading,
    isError,
    error,
  } = useQuery(aggregatedReviewsQuery(client));

  if (isLoading) {
    return (
      <div className="page-max-w w-full">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Lade Archiv...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-max-w w-full">
        <div className="text-center py-12">
          <p className="text-destructive">
            Fehler beim Laden: {error?.message}
          </p>
        </div>
      </div>
    );
  }

  if (!aggregatedReviews || aggregatedReviews.length === 0) {
    return (
      <div className="page-max-w w-full">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Keine Fälle im Archiv gefunden.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-max-w w-full">
      <div className="space-y-6">
        {aggregatedReviews.map((caseItem) => (
          <ArchiveItemCard key={caseItem.case_id} caseItem={caseItem} />
        ))}
      </div>
    </div>
  );
};
