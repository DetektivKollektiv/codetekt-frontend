import { getAggregatedReview } from '@/lib/queries/getAggregatedReview';
import { getCaseComments } from '@/lib/queries/getCaseComments';
import { createClient } from '@/lib/supabase/server';

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

  return (
    <>
      <div className="page-max-w w-full mt-12 lg:mt-24">
        <h1 className="text-display-sm sm:text-display-md 2xl:text-display-lg uppercase">
          Fall {aggregatedReview?.cases.case_number}
        </h1>
      </div>
      <div className="page-max-w w-full mt-8 lg:mt-12 mb-24 lg:mb-32">
        {aggregatedReview?.case_id}
      </div>
    </>
  );
}
