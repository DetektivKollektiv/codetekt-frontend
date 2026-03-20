'use client';

import { BadgeList } from '@/components/ui/badge-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShareButton } from '@/components/ui/share-button';
import { AggregatedReviews } from '@/lib/queries/getAggregatedReviews';
import { getLocalDate } from '@/lib/utils';
import { getCaseCategoryName } from '@/lib/utils/get-case-category-name';
import { getCaseKeywords } from '@/lib/utils/get-case-keywords';
import { getCaseTitle } from '@/lib/utils/get-case-title';
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

  const reviewData = caseItem.data;
  if (!reviewData) return null;
  const ogData = caseItem.cases.open_graph_data;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow lg:h-[22rem] w-full flex">
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
              category={getCaseCategoryName(caseItem) || undefined}
              keywords={getCaseKeywords(caseItem)}
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
          {caseItem.case_id && (
            <Evaluation
              caseId={caseItem.case_id}
              ratingStyle={ratingStyle}
              warningTags={getWarningTags(reviewData)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
