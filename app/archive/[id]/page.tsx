import { ArchiveDetail } from '@/components/archive-detail/archive-detail';
import { getAggregatedReview } from '@/lib/queries/getAggregatedReview';
import { getCaseComments } from '@/lib/queries/getCaseComments';
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
  const { data: aggregatedReview, error } = await getAggregatedReview(
    supabase,
    id
  );
  const { data: caseComments, error: caseCommentsError } =
    await getCaseComments(supabase, id);

  const { isAuthenticated, user } = await getAuth();

  if (error) {
    throw error;
  }

  if (caseCommentsError) {
    throw caseCommentsError;
  }

  if (!aggregatedReview) {
    notFound();
  }

  return (
    <div className="page-max-w w-full mt-10 lg:mt-12 mb-24 lg:mb-32">
      <ArchiveDetail
        aggregatedReview={aggregatedReview}
        caseComments={caseComments || []}
        isAuthenticated={isAuthenticated}
        userId={user?.id}
      />
    </div>
  );
}
