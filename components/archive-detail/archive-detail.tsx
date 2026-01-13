'use client';

import type { AggregatedReview } from '@/lib/queries/getAggregatedReview';
import type { CaseComments } from '@/lib/queries/getCaseComments';
import { DetailComments } from './detail-comments';
import { DetailEvaluation } from './detail-evaluation';
import { DetailHeader } from './detail-header';
import { DetailRating } from './detail-rating';

interface ArchiveDetailProps {
  aggregatedReview: NonNullable<AggregatedReview>;
  caseComments: CaseComments;
  isAuthenticated: boolean;
}

export function ArchiveDetail({
  aggregatedReview,
  caseComments,
  isAuthenticated,
}: ArchiveDetailProps) {
  return (
    <div className="space-y-12">
      {/* Header Section */}
      <DetailHeader aggregatedReview={aggregatedReview} />

      {/* Rating Overview */}
      <DetailRating
        aggregatedReview={aggregatedReview}
        isAuthenticated={isAuthenticated}
      />

      {/* Evaluation Section */}
      {aggregatedReview.data && (
        <DetailEvaluation reviewData={aggregatedReview.data} />
      )}

      {/* Comments Section */}
      <DetailComments comments={caseComments} />
    </div>
  );
}
