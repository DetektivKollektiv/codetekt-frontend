'use client';
import { ArchiveList } from '@/components/archive-list';
import { reviewsAndCasesListConfig } from '@/lib/config/archive-list-configs';
import { AggregatedReviews } from '@/lib/queries/getAggregatedReviews';
import { Profile } from '@/lib/queries/getProfile';
import { UserCases } from '@/lib/queries/getUserCases';
import { FC } from 'react';
import UserSettings from './user-settings';
interface UserPageProps {
  profile: NonNullable<Profile>;
  userReviewsAndCases: (UserCases[number] | AggregatedReviews[number])[];
}

const UserPage: FC<UserPageProps> = ({ profile, userReviewsAndCases }) => {
  return (
    <>
      <div className="page-max-w w-full mt-12 ">
        <h1 className="text-display-sm sm:text-display-md 2xl:text-display-lg uppercase">
          Hi {profile.username}!
        </h1>
        <p className="text-body-md max-w-xl xl:max-w-3xl mx-auto lg:mx-0 mt-4">
          Herzlich willkommen auf deinem Dashboard. Du kannst dir deine gelösten
          und ungelösten Fälle ansehen und neue Fälle bearbeiten. Unten findest
          du Vorschläge für Fälle, die deine Hilfe benötigen.
        </p>
      </div>

      <div className="page-max-w w-full mt-12">
        <UserSettings />
      </div>

      {userReviewsAndCases && (
        <div className=" mt-12 lg:mt-24">
          <h1 className="page-max-w text-display-sm sm:text-display-sm 2xl:text-display-md">
            Deine eingereichten Fälle
          </h1>
          <ArchiveList
            {...reviewsAndCasesListConfig}
            items={userReviewsAndCases ?? []}
            className="mt-8 mb-12 lg:mb-24"
            pageSize={3}
            showPageNumbers
            syncWithURL={false}
          />
        </div>
      )}
    </>
  );
};

export default UserPage;
