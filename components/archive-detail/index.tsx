import type { AggregatedReview } from '@/lib/queries/getAggregatedReview';
import type { CaseComments } from '@/lib/queries/getCaseComments';
import { getAuth } from '@/lib/supabase/getAuth';
import { DetailComments } from './detail-comments';
import DetailCreateComment from './detail-create-comment';
import { DetailEvaluation } from './detail-evaluation';
import { DetailHeader } from './detail-header';
import { DetailRating } from './detail-rating';

interface ArchiveDetailProps {
  aggregatedReview: NonNullable<AggregatedReview>;
  caseComments: CaseComments;
  auth: Awaited<ReturnType<typeof getAuth>>;
}

export function ArchiveDetail({
  aggregatedReview,
  caseComments,
  auth,
}: ArchiveDetailProps) {
  return (
    <div className="space-y-12">
      {/* Header Section */}
      <DetailHeader aggregatedReview={aggregatedReview} />

      {/* Rating Overview */}
      <DetailRating aggregatedReview={aggregatedReview} auth={auth} />

      {/* Evaluation Section */}
      {aggregatedReview.data && (
        <DetailEvaluation reviewData={aggregatedReview.data} />
      )}

      {/* Comments Section */}
      <DetailComments
        comments={caseComments}
        auth={auth}
        caseId={aggregatedReview.case_id}
      />

      <DetailCreateComment auth={auth} caseId={aggregatedReview.case_id} />
    </div>
  );
}
