'use client';

import { BadgeList } from '@/components/ui/badge-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShareButton } from '@/components/ui/share-button';
import { AggregatedReviews } from '@/lib/queries/getAggregatedReviews';
import { getLocalDate } from '@/lib/utils';
import { getCaseTitle } from '@/lib/utils/get-case-title';
import { getCategoryName } from '@/lib/utils/get-category-name';
import { getRatingStyle, getWarningTags } from '@/lib/utils/rating-helpers';
import Link from 'next/link';
import { FC } from 'react';
import ImagePlaceholder from '../image-placeholder';
import CardText from './card-text';
import Evaluation from './evaluation';

interface AggregatedReviewCardProps {
  caseItem: NonNullable<AggregatedReviews[number]>;
}

export const AggregatedReviewCard: FC<AggregatedReviewCardProps> = ({
  caseItem,
}) => {
  const ratingStyle = getRatingStyle(caseItem.result_score || 0);

  // Type assertion for data field (Json type from Supabase)
  const reviewData = caseItem.data;
  if (!reviewData) return null;
  const ogData = caseItem.cases.open_graph_data;

  // Safely access metadata with fallbacks
  const category = caseItem.cases.case_categories?.value;
  const keywordType = reviewData.metadata?.keyword_type || [];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow lg:h-72 w-full flex">
      <CardContent className="p-4 lg:p-6 w-full">
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Left: Image */}
          <div className="aspect-video lg:aspect-[4/3] flex-shrink-0">
            <ImagePlaceholder
              width={317}
              height={238}
              className="rounded-lg w-full h-full object-cover aspect-video lg:aspect-[4/3]"
              seed={caseItem.cases.case_number!}
            />
          </div>

          {/* Middle: Content */}
          <div className="flex-1 space-y-4 flex flex-col">
            {/* Badges */}
            <BadgeList
              category={category && getCategoryName(category)}
              keywordType={keywordType}
            />

            {/* Title & Description */}
            <CardText
              date={getLocalDate(caseItem.calculated_at!)}
              title={getCaseTitle(caseItem)}
              description={ogData?.og_description ?? caseItem.cases.content}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 flex-1 items-end">
              <Link href={`/archive/${caseItem.case_id}`}>
                <Button variant={'destructive'}>Fall ansehen</Button>
              </Link>
              <ShareButton size={'lg'} caseId={caseItem.case_id || ''} />
            </div>
          </div>

          {/* Right: Evaluation */}
          <Evaluation
            ratingStyle={ratingStyle}
            warningTags={getWarningTags(reviewData)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
