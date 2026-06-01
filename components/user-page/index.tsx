'use client';
import { ArchiveList } from '@/components/archive-list';
import { ChallengeProgressSection } from '@/components/challenge-progress-section';
import type { AggregatedReviews } from '@/lib/queries/getAggregatedReviews';
import type { ChallengeProgress } from '@/lib/queries/getChallengeProgress';
import type { OpenCases } from '@/lib/queries/getOpenCases';
import type { UserCases } from '@/lib/queries/getUserCases';
import { createClient } from '@/lib/supabase/client';
import { getAuth } from '@/lib/supabase/getAuth';
import { getShortUsername } from '@/lib/utils/get-short-username';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

import type { Leaderboard } from '@/lib/queries/getLeaderboard';
import type { UserReviews } from '@/lib/queries/getUserReviews';
import Link from 'next/link';
import { FC } from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { HomeHelpCard } from './home-help-card';
import UserSettings from './user-settings';
import UserStatistics from './user-statistics';

interface UserPageProps {
  auth: Awaited<ReturnType<typeof getAuth>>;
  challengeProgress: ChallengeProgress | null;
  leaderboard: Leaderboard;
  openCases: OpenCases;
  ownUserReviewsAndCases: (UserCases[number] | AggregatedReviews[number])[];
  userCases: UserCases;
  userReviews: UserReviews;
  userReviewsAndCases: (UserCases[number] | AggregatedReviews[number])[];
}

const UserPage: FC<UserPageProps> = ({
  auth,
  challengeProgress,
  leaderboard,
  ownUserReviewsAndCases,
  userReviewsAndCases,
  userCases,
  userReviews,
  openCases,
}) => {
  const supabase = createClient();

  const { data: authData } = useQuery({
    queryFn: () => getAuth(supabase),
    queryKey: ['auth'],
    initialData: auth,
  });

  const { profile, user } = authData;

  // Handle case when user logs out while component is mounted
  if (!profile || !user) {
    return null;
  }

  const handleOpenCasesClick = () => {
    const openCasesSection = document.getElementById('open-cases');

    if (!openCasesSection) {
      return;
    }

    openCasesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (window.location.hash !== '#open-cases') {
      window.history.replaceState(null, '', '#open-cases');
    }
  };

  return (
    <div className="overflow-x-hidden">
      <div className="bg-gradient-neutral-coral h-full pt-12 lg:pt-24">
        <div className="flex-col lg:flex-row justify-center flex lg:items-center relative">
          <div className="page-max-w w-full z-10 space-y-12 ">
            <div>
              <h1 className="text-display-sm sm:text-display-md 2xl:text-display-lg uppercase flex items-center gap-4">
                {profile.username && (
                  <Avatar className="size-8 md:size-14">
                    <AvatarFallback className="bg-primary text-heading-md">
                      <p className="text-primary-foreground">
                        {getShortUsername(profile.username)}
                      </p>
                    </AvatarFallback>
                  </Avatar>
                )}
                Hi {profile.username}!
              </h1>
              <p className="text-body-md max-w-xl xl:max-w-3xl mt-4">
                Herzlich willkommen auf deinem Dashboard. Du kannst dir deine
                gelösten und ungelösten Fälle ansehen und neue Fälle bearbeiten.
                Unten findest du Vorschläge für Fälle, die deine Hilfe
                benötigen.
              </p>
              <div className="mt-4 flex gap-2">
                <Button asChild>
                  <Link href="/submit">Fall einreichen</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link
                    href="#open-cases"
                    onClick={(event) => {
                      event.preventDefault();
                      handleOpenCasesClick();
                    }}
                  >
                    Fall checken
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <div
            className="ml-auto hidden lg:block absolute -right-6 2xl:-right-12 -top-12 xl:-top-6 w-2/5 xl:w-1/3 2xl:w-1/3"
            style={{
              maskImage:
                'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
            }}
          >
            <Image
              src="/images/community-people.svg"
              alt="Community Illustration"
              width={600}
              height={400}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
      <div className="mt-24 z-10 relative page-max-w ">
        <UserStatistics
          userCases={userCases}
          userReviews={userReviews}
          leaderboard={leaderboard}
        />
      </div>
      {openCases && (
        <div className="mt-24 z-10 relative" id="open-cases">
          <div className="page-max-w mb-12">
            {challengeProgress && (
              <ChallengeProgressSection
                challengeProgress={challengeProgress}
                className="mb-6"
              />
            )}
            <HomeHelpCard />
          </div>
          <h1 className="page-max-w text-display-sm sm:text-display-sm 2xl:text-display-md">
            Fälle, die deine Hilfe benötigen
          </h1>
          <ArchiveList
            configKey="openCases"
            items={openCases ?? []}
            className="mt-8 mb-12 lg:mb-24"
            pageSize={4}
            showPageNumbers
            syncWithURL={false}
          />
        </div>
      )}

      {ownUserReviewsAndCases && (
        <div className="mt-24 lg:mt-32">
          <h1 className="page-max-w text-display-sm sm:text-display-sm 2xl:text-display-md">
            Deine eingereichten Fälle
          </h1>
          <ArchiveList
            configKey="reviewsAndCases"
            items={ownUserReviewsAndCases ?? []}
            className="mt-8 mb-12 lg:mb-24"
            pageSize={4}
            showPageNumbers
            syncWithURL={false}
          />
        </div>
      )}

      {ownUserReviewsAndCases && (
        <div className=" mt-12 lg:mt-24">
          <h1 className="page-max-w text-display-sm sm:text-display-sm 2xl:text-display-md">
            Fälle, die du bewertet hast
          </h1>
          <ArchiveList
            configKey="reviewsAndCases"
            items={userReviewsAndCases ?? []}
            className="mt-8 mb-12 lg:mb-24"
            pageSize={4}
            showPageNumbers
            syncWithURL={false}
          />
        </div>
      )}

      <div className="page-max-w w-full mt-12 mb-24" id="user-settings">
        <UserSettings auth={auth} />
      </div>
    </div>
  );
};

export default UserPage;
