'use client';

import type { AggregatedReview } from '@/lib/queries/getAggregatedReview';
import type { CaseComments } from '@/lib/queries/getCaseComments';
import { Profile } from '@/lib/queries/getProfile';
import { User } from '@/lib/queries/getUser';
import { DetailComments } from './detail-comments';
import DetailCreateComment from './detail-create-comment';
import { DetailEvaluation } from './detail-evaluation';
import { DetailHeader } from './detail-header';
import { DetailRating } from './detail-rating';

interface ArchiveDetailProps {
  aggregatedReview: NonNullable<AggregatedReview>;
  caseComments: CaseComments;
  isAuthenticated: boolean;
  user: User['user'] | null;
  profile: Profile | null;
}

export function ArchiveDetail({
  aggregatedReview,
  caseComments,
  isAuthenticated,
  user,
  profile,
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
      <DetailComments comments={caseComments} userId={user?.id} />

      <DetailCreateComment
        user={user}
        isAuthenticated={isAuthenticated}
        profile={profile}
      />
    </div>
  );
}
