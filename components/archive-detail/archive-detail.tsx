'use client';

import { DetailHeader } from './detail-header';
import { DetailRating } from './detail-rating';
import { DetailEvaluation } from './detail-evaluation';
import { DetailComments } from './detail-comments';
import type { AggregatedReview } from '@/lib/queries/getAggregatedReview';
import type { CaseComments } from '@/lib/queries/getCaseComments';

interface ArchiveDetailProps {
  aggregatedReview: NonNullable<AggregatedReview>;
  caseComments: CaseComments;
}

export function ArchiveDetail({
  aggregatedReview,
  caseComments,
}: ArchiveDetailProps) {
  return (
    <div className="space-y-12">
      {/* Header Section */}
      <DetailHeader aggregatedReview={aggregatedReview} />

      {/* Rating Overview */}
      <DetailRating aggregatedReview={aggregatedReview} />

      {/* Evaluation Section */}
      {aggregatedReview.data && (
        <DetailEvaluation reviewData={aggregatedReview.data} />
      )}

      {/* Comments Section */}
      <DetailComments comments={caseComments} />
    </div>
  );
}
