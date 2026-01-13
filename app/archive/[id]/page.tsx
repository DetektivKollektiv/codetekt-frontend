import { getAggregatedReview } from '@/lib/queries/getAggregatedReview';
import { getCaseComments } from '@/lib/queries/getCaseComments';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ArchiveDetail } from '@/components/archive-detail/archive-detail';

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
    <div className="page-max-w w-full mt-12 lg:mt-24 mb-24 lg:mb-32">
      <ArchiveDetail
        aggregatedReview={aggregatedReview}
        caseComments={caseComments || []}
      />
    </div>
  );
}
