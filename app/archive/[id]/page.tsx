import { ArchiveDetail } from '@/components/archive-detail';
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
    id,
  );
  const { data: caseComments, error: caseCommentsError } =
    await getCaseComments(supabase, id);

  const auth = await getAuth(supabase);
  if (error) {
    throw error;
  }

  if (caseCommentsError) {
    throw caseCommentsError;
  }

  if (!aggregatedReview) {
    notFound();
  }

  console.log('Aggregated Review:', aggregatedReview);

  return (
    <div className=" w-full mt-10 lg:mt-12 mb-24 lg:mb-32">
      <ArchiveDetail
        auth={auth}
        aggregatedReview={aggregatedReview}
        caseComments={caseComments || []}
      />
    </div>
  );
}
