import { ArchiveList } from '@/components/archive-list';
import { aggregatedReviewsListConfig } from '@/lib/config/archive-list-configs';
import { getAggregatedReviews } from '@/lib/queries/getAggregatedReviews';
import { createClient } from '@/lib/supabase/server';

export default async function ArchivePage() {
  const supabase = await createClient();
  const { data, error } = await getAggregatedReviews(supabase);

  if (error) {
    throw error;
  }

  return (
    <>
      <div className="page-max-w w-full mt-12 ">
        <h1 className="text-display-sm sm:text-display-md 2xl:text-display-lg uppercase">
          Gelöste Fälle
        </h1>
      </div>
      <ArchiveList
        {...aggregatedReviewsListConfig}
        items={data ?? []}
        className="mt-12 mb-12 lg:mb-24"
        pageSize={10}
        showPageNumbers
      />
    </>
  );
}
