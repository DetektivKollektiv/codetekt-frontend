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
  hasSubmittedByCurrentUser: boolean;
}

export function ArchiveDetail({
  aggregatedReview,
  caseComments,
  auth,
  hasSubmittedByCurrentUser,
}: ArchiveDetailProps) {
  const evaluationData = aggregatedReview.data;
  const hasEvaluationSection =
    evaluationData?.questions?.some((question) => question.fields.length > 0) ??
    false;

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <DetailHeader
        aggregatedReview={aggregatedReview}
        hasSubmittedByCurrentUser={hasSubmittedByCurrentUser}
      />

      {/* Rating Overview */}
      <DetailRating aggregatedReview={aggregatedReview} auth={auth} />

      {/* Evaluation Section */}
      {hasEvaluationSection && evaluationData && (
        <DetailEvaluation reviewData={evaluationData} />
      )}

      {/* Comments Section */}
      <DetailComments
        comments={caseComments}
        auth={auth}
        caseId={aggregatedReview.case_id}
      />

      <DetailCreateComment
        auth={auth}
        caseId={aggregatedReview.case_id}
        hasSubmittedByCurrentUser={hasSubmittedByCurrentUser}
      />
    </div>
  );
}
