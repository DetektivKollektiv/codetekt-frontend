'use client';
import { ArchiveList } from '@/components/archive-list';
import { AggregatedReviews } from '@/lib/queries/getAggregatedReviews';
import { OpenCases } from '@/lib/queries/getOpenCases';
import { Profile } from '@/lib/queries/getProfile';
import { UserCases } from '@/lib/queries/getUserCases';
import { User } from '@supabase/supabase-js';
import { FC } from 'react';
import UserSettings from './user-settings';
interface UserPageProps {
  profile: NonNullable<Profile>;
  user: User;
  openCases: OpenCases;
  ownUserReviewsAndCases: (UserCases[number] | AggregatedReviews[number])[];
  userReviewsAndCases: (UserCases[number] | AggregatedReviews[number])[];
}

const UserPage: FC<UserPageProps> = ({
  profile,
  user,
  ownUserReviewsAndCases,
  userReviewsAndCases,
  openCases,
}) => {
  return (
    <>
      <div className="page-max-w w-full mt-12 lg:mt-24">
        <h1 className="text-display-sm sm:text-display-md 2xl:text-display-lg uppercase">
          Hi {profile.username}!
        </h1>
        <p className="text-body-md max-w-xl xl:max-w-3xl mt-4">
          Herzlich willkommen auf deinem Dashboard. Du kannst dir deine gelösten
          und ungelösten Fälle ansehen und neue Fälle bearbeiten. Unten findest
          du Vorschläge für Fälle, die deine Hilfe benötigen.
        </p>
      </div>

      <div className="page-max-w w-full mt-12" id="user-settings">
        <UserSettings profile={profile} user={user} />
      </div>

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
            Fälle die du bewertet hast
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

      {openCases && (
        <div className="mt-24 lg:mt-32" id="open-cases">
          <h1 className="page-max-w text-display-sm sm:text-display-sm 2xl:text-display-md">
            Fälle die deine Hilfe benötigen
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
    </>
  );
};

export default UserPage;
