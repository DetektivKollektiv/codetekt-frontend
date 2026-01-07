import { ArchiveList } from '@/components/archive-list';
import { getAggregatedReviews } from '@/lib/queries/getAggregatedReviews';
import { createClient } from '@/lib/supabase/server';

export default async function ArchivePage() {
  const supabase = await createClient();
  const { data, error } = await getAggregatedReviews(supabase);

  if (error) {
    throw error;
  }

  return (
    <ArchiveList
      className="mt-12 mb-12 lg:mb-24"
      initialData={data ?? []}
      pageSize={10}
      showPageNumbers
    />
  );
}
