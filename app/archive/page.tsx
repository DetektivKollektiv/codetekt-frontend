import { ArchiveList } from '@/components/archive-list';
import { getAggregatedReviews } from '@/lib/queries/getAggregatedReviews';
import { getUserReviews } from '@/lib/queries/getUserReviews';
import { getAuth } from '@/lib/supabase/getAuth';
import { createClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = await createClient();
  const [{ data: aggregatedReviews, error }, auth] = await Promise.all([
    getAggregatedReviews(supabase),
    getAuth(supabase),
  ]);

  if (error) {
    throw error;
  }

  let submittedCaseIds = new Set<string | null>();

  if (auth.user?.id) {
    const { data: userReviews, error: userReviewsError } =
      await getUserReviews(supabase, auth.user.id);

    if (userReviewsError) {
      throw userReviewsError;
    }

    submittedCaseIds = new Set(
      (userReviews ?? [])
        .filter((review) => review.submitted_review_answers_id !== null)
        .map((review) => review.case_id),
    );
  }

  const aggregatedReviewsWithSubmissionState = aggregatedReviews?.map(
    (review) => ({
      ...review,
      hasSubmittedByCurrentUser: submittedCaseIds.has(review.case_id),
    }),
  );

  return (
    <>
      <div className="w-full pt-12 lg:pt-24 bg-gradient-neutral-coral">
        <h1 className="text-display-sm sm:text-display-md 2xl:text-display-lg uppercase page-max-w">
          Gelöste Fälle
        </h1>
      </div>
      <ArchiveList
        configKey="aggregatedReviews"
        items={aggregatedReviewsWithSubmissionState ?? []}
        className="mt-12 mb-12 lg:mb-24"
        pageSize={10}
        showPageNumbers
      />
    </>
  );
}
