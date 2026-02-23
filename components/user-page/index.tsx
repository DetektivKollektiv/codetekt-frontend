'use client';
import { ArchiveList } from '@/components/archive-list';
import { AggregatedReviews } from '@/lib/queries/getAggregatedReviews';
import { OpenCases } from '@/lib/queries/getOpenCases';
import { UserCases } from '@/lib/queries/getUserCases';
import { createClient } from '@/lib/supabase/client';
import { getAuth } from '@/lib/supabase/getAuth';
import { getShortUsername } from '@/lib/utils/get-short-username';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

import { Leaderboard } from '@/lib/queries/getLeaderboard';
import { UserReviews } from '@/lib/queries/getUserReviews';
import { FC } from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import UserSettings from './user-settings';
import UserStatistics from './user-statistics';

interface UserPageProps {
  auth: Awaited<ReturnType<typeof getAuth>>;
  leaderboard: Leaderboard;
  openCases: OpenCases;
  ownUserReviewsAndCases: (UserCases[number] | AggregatedReviews[number])[];
  userCases: UserCases;
  userReviews: UserReviews;
  userReviewsAndCases: (UserCases[number] | AggregatedReviews[number])[];
}

const UserPage: FC<UserPageProps> = ({
  auth,
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
        <div className="lg:w-2/3">
          <UserStatistics
            userCases={userCases}
            userReviews={userReviews}
            leaderboard={leaderboard}
          />
        </div>
      </div>
      {openCases && (
        <div className="mt-24 z-10 relative" id="open-cases">
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
