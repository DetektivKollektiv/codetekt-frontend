'use client';
import { aggregatedReviewsListConfig } from '@/lib/config/archive-list-configs';
import { AggregatedReviews } from '@/lib/queries/getAggregatedReviews';
import { FC } from 'react';
import { ArchiveList } from './archive-list';

interface ArchivePageProps {
  aggregatedReviews: AggregatedReviews;
}

const ArchivePage: FC<ArchivePageProps> = ({ aggregatedReviews }) => {
  return (
    <>
      <div className="page-max-w w-full mt-12 ">
        <h1 className="text-display-sm sm:text-display-md 2xl:text-display-lg uppercase">
          Gelöste Fälle
        </h1>
      </div>
      <ArchiveList
        {...aggregatedReviewsListConfig}
        items={aggregatedReviews ?? []}
        className="mt-12 mb-12 lg:mb-24"
        pageSize={10}
        showPageNumbers
      />
    </>
  );
};

export default ArchivePage;
