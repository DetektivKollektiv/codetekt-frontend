import { ArchiveList } from '@/components/archive-list';
import { Button } from '@/components/ui/button';
import UserPage from '@/components/user-page';
import {
  AggregatedReviews,
  getAggregatedReviews,
} from '@/lib/queries/getAggregatedReviews';
import { getLeaderboard } from '@/lib/queries/getLeaderboard';
import { filterUnaggregatedOpenCases, getOpenCases } from '@/lib/queries/getOpenCases';
import { getUserCases, UserCases } from '@/lib/queries/getUserCases';
import { getUserReviews, UserReviews } from '@/lib/queries/getUserReviews';
import { getAuth } from '@/lib/supabase/getAuth';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  const supabase = await createClient();
  const aggregatedReviewsPromise = getAggregatedReviews(supabase);
  const openCasesPromise = getOpenCases(supabase);
  const authPromise = getAuth(supabase);
  const leaderboardPromise = getLeaderboard(supabase);

  const [
    { data: aggregatedReviewsData, error },
    { data: openCases, error: openCasesError },
    auth,
    { data: leaderboardData },
  ] = await Promise.all([
    aggregatedReviewsPromise,
    openCasesPromise,
    authPromise,
    leaderboardPromise,
  ]);

  const { user, profile, isAuthenticated } = auth;

  type CaseWithSubmissionState = UserCases[number] & {
    hasSubmittedByCurrentUser: boolean;
  };

  // cases the user has created (and their aggregated reviews)
  let ownUserReviewsAndCases:
    | null
    | (CaseWithSubmissionState | AggregatedReviews[number])[] = null;

  // cases the user has reviewed (and their aggregated reviews)
  let userReviewsAndCases:
    | null
    | (CaseWithSubmissionState | AggregatedReviews[number])[] = null;

  // Separate arrays for cases with and without aggregated reviews
  let userCases: UserCases | null = null;
  let userReviews: UserReviews | null = null;

  // open cases filtered to exclude cases the user has already reviewed
  let filteredOpenCases = filterUnaggregatedOpenCases(openCases);

  if (isAuthenticated && user) {
    const [
      { data: userCasesData, error: userCasesError },
      { data: userReviewsData, error: userReviewsError },
    ] = await Promise.all([
      getUserCases(supabase, user.id),
      getUserReviews(supabase, user.id),
    ]);

    const submittedCaseIds = new Set(
      (userReviewsData ?? [])
        .filter((review) => review.submitted_review_answers_id !== null)
        .map((review) => review.case_id),
    );

    const ownUserAggregatedReviewsData = aggregatedReviewsData?.filter(
      (review) =>
        userCasesData?.some((userCase) => review.case_id === userCase.id),
    );

    const ownFilteredUserCases = userCasesData?.filter(
      (userCase) =>
        !ownUserAggregatedReviewsData?.some(
          (review) => review.case_id === userCase.id,
        ),
    );

    userCases = userCasesData ?? null;
    userReviews = userReviewsData ?? null;

    ownUserReviewsAndCases = [
      ...((ownFilteredUserCases ?? []).map((userCase) => ({
        ...userCase,
        hasSubmittedByCurrentUser: submittedCaseIds.has(userCase.id!),
      })) as CaseWithSubmissionState[]),
      ...(ownUserAggregatedReviewsData ?? []),
    ];

    if (userCasesError) {
      console.error(
        'Error fetching own user cases or reviews:',
        userCasesError,
      );
    }

    // 1. Eigene Reviews aus aggregatedReviewsData (Vorrang)
    const userAggregatedReviewsData = aggregatedReviewsData?.filter((review) =>
      userReviewsData?.some(
        (userReview) => review.case_id === userReview.case_id,
      ),
    );

    // 2. Eigene Reviews, die NICHT in aggregatedReviewsData sind
    const userReviewsDataFiltered = userReviewsData?.filter(
      (review) =>
        !aggregatedReviewsData?.some(
          (aggReview) => aggReview.case_id === review.case_id,
        ),
    );

    userReviewsAndCases = [
      ...(userReviewsDataFiltered?.map(
        (userReview) =>
          ({
            ...(userReview.cases as UserCases[number]),
            hasSubmittedByCurrentUser:
              userReview.submitted_review_answers_id !== null,
          }) as CaseWithSubmissionState,
      ) ?? []),
      ...(userAggregatedReviewsData ?? []),
    ];

    // Filter open cases to exclude cases the user has already reviewed
    filteredOpenCases = filterUnaggregatedOpenCases(openCases)
      .filter((openCase) => !submittedCaseIds.has(openCase.id!))
      .map((openCase) => ({
        ...openCase,
        hasSubmittedByCurrentUser: false,
      }));

    if (userReviewsError) {
      console.error('Error fetching user reviews:', userReviewsError);
    }
  }

  if (error) {
    throw error;
  }

  if (openCasesError) {
    throw openCasesError;
  }

  return (
    <main className="h-full flex-1">
      {isAuthenticated && user && profile ? (
        <UserPage
          auth={auth}
          userCases={userCases ?? []}
          userReviews={userReviews ?? []}
          userReviewsAndCases={userReviewsAndCases ?? []}
          ownUserReviewsAndCases={ownUserReviewsAndCases ?? []}
          openCases={filteredOpenCases ?? []}
          leaderboard={leaderboardData ?? []}
        />
      ) : (
        <>
          <div className="pb-12 bg-gradient-neutral-coral">
            <div className="lg:h-[80lvh] pt-24 overflow-hidden relative flex-col lg:flex-row justify-center flex lg:items-center">
              <div className="page-max-w w-full z-10 space-y-12 ">
                <div className="text-center lg:text-left">
                  <h2 className="text-display-eyebrow uppercase">
                    Trust-Checking von codetekt
                  </h2>
                  <h1 className="text-display-sm sm:text-display-md 2xl:text-display-lg uppercase">
                    Gemeinsam gegen <br />
                    Falsch&shy;informationen
                  </h1>
                  <p className="text-body-md max-w-xl xl:max-w-3xl mx-auto lg:mx-0">
                    Bei codetekt kannst du digitale Informationen auf
                    Vertrauenswürdigkeit prüfen lassen.{' '}
                    <br className="hidden xl:block" />
                    Reiche Fälle ein oder werde selbst Detektiv*in und
                    verbessere deine Recherche-Fähigkeiten.
                  </p>
                  <div className="mt-6">
                    <Link href="/auth/sign-up">
                      <Button size="lg" variant={'default'}>
                        Detektiv*in werden
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              <Image
                src="/images/title.svg"
                alt="Title Illustration"
                width={600}
                height={400}
                className="lg:hidden self-center w-full max-w-2xl px-12 mt-24 mb-12"
              />
              <Image
                src="/images/title.svg"
                alt="Title Illustration"
                width={600}
                height={400}
                className="ml-auto hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-2/5 xl:w-2/5 2xl:w-1/3"
              />
            </div>
            <div className="page-max-w">
              <div className="w-full rounded-lg bg-background p-5 page-max-w">
                <h3 className="text-display-eyebrow uppercase">
                  Unsere Partner*innen, Unterstützer*innen und Netzwerke
                </h3>
                <div className="flex mt-6 overflow-x-scroll justify-around space-x-6 no-scrollbar ">
                  <Image
                    src="/images/logo_dpl.png"
                    alt="DPL Logos"
                    width={0}
                    height={0}
                    sizes="10vw"
                    className="saturate-0 h-12 w-auto"
                  />
                  <Image
                    src="/images/logo_mabb.png"
                    alt="DPL Logos"
                    width={0}
                    height={0}
                    sizes="10vw"
                    className="saturate-0 h-12 w-auto"
                  />
                  <Image
                    src="/images/logo_campact.png"
                    alt="DPL Logos"
                    width={0}
                    height={0}
                    sizes="10vw"
                    className="saturate-0 h-12 w-auto"
                  />
                  <Image
                    src="/images/logo_berlin.png"
                    alt="DPL Logos"
                    width={0}
                    height={0}
                    sizes="10vw"
                    className="saturate-0 h-12 w-auto"
                  />
                  <Image
                    src="/images/logo_anstossdemokratie.png"
                    alt="DPL Logos"
                    width={0}
                    height={0}
                    sizes="10vw"
                    className="saturate-0 h-12 w-auto"
                  />
                  <Image
                    src="/images/logo_mitwirken.svg"
                    alt="DPL Logos"
                    width={0}
                    height={0}
                    sizes="10vw"
                    className="saturate-0 h-12 w-auto"
                  />
                  <Image
                    src="/images/logo_dda.png"
                    alt="DPL Logos"
                    width={0}
                    height={0}
                    sizes="10vw"
                    className="saturate-0 h-12 w-auto"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="page-max-w mt-12 lg:mt-24">
            <h1 className="text-display-sm sm:text-display-sm 2xl:text-display-md uppercase ">
              Gelöste Fälle
            </h1>
          </div>

          <ArchiveList
            configKey="aggregatedReviews"
            items={aggregatedReviewsData ?? []}
            className="mt-8 lg:mb-24 mb-12"
            pageSize={4}
            syncWithURL={false}
            showPageNumbers
          />
        </>
      )}
    </main>
  );
}
