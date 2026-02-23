import { AggregatedReviews } from '@/lib/queries/getAggregatedReviews';
import { UserCases } from '@/lib/queries/getUserCases';
import { FC } from 'react';

interface UserStatisticsProps {
  ownUserAggregatedReviews: AggregatedReviews;
  ownUserPendingCases: UserCases;
}

const UserStatistics: FC<UserStatisticsProps> = ({
  ownUserAggregatedReviews,
  ownUserPendingCases,
}) => {
  const ownUserReviewsCount = ownUserAggregatedReviews.length;
  const ownUserCasesCount = ownUserPendingCases.length;

  return (
    <div>
      {ownUserReviewsCount} Reviews, {ownUserCasesCount} Cases
    </div>
  );
};

export default UserStatistics;
