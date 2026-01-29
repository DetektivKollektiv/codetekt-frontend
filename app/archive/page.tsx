import { ArchiveList } from '@/components/archive-list';
import { getAggregatedReviews } from '@/lib/queries/getAggregatedReviews';
import { createClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = await createClient();
  const { data: aggregatedReviews, error } =
    await getAggregatedReviews(supabase);

  if (error) {
    throw error;
  }

  return (
    <>
      <div className="w-full pt-12 lg:pt-24 bg-gradient-neutral-coral">
        <h1 className="text-display-sm sm:text-display-md 2xl:text-display-lg uppercase page-max-w">
          Gelöste Fälle
        </h1>
      </div>
      <ArchiveList
        configKey="aggregatedReviews"
        items={aggregatedReviews ?? []}
        className="mt-12 mb-12 lg:mb-24"
        pageSize={10}
        showPageNumbers
      />
    </>
  );
}
