import { ArchiveDetail } from '@/components/archive-detail';
import { getAggregatedReview } from '@/lib/queries/getAggregatedReview';
import { getCaseComments } from '@/lib/queries/getCaseComments';
import { getSubmittedReviewAnswer } from '@/lib/queries/getSubmittedReviewAnswer';
import { getAuth } from '@/lib/supabase/getAuth';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: aggregatedReview, error },
    { data: caseComments, error: caseCommentsError },
    auth,
  ] = await Promise.all([
    getAggregatedReview(supabase, id),
    getCaseComments(supabase, id),
    getAuth(supabase),
  ]);

  if (error) {
    throw error;
  }

  if (caseCommentsError) {
    throw caseCommentsError;
  }

  if (!aggregatedReview) {
    notFound();
  }

  let hasSubmittedByCurrentUser = false;

  if (auth.user?.id) {
    const { data: submittedReview, error: submittedReviewError } =
      await getSubmittedReviewAnswer(supabase, id, auth.user.id);

    if (submittedReviewError) {
      throw submittedReviewError;
    }

    hasSubmittedByCurrentUser = !!submittedReview;
  }

  return (
    <div className=" w-full mt-10 lg:mt-12 mb-24 lg:mb-32">
      <ArchiveDetail
        auth={auth}
        aggregatedReview={aggregatedReview}
        caseComments={caseComments || []}
        hasSubmittedByCurrentUser={hasSubmittedByCurrentUser}
      />
    </div>
  );
}
