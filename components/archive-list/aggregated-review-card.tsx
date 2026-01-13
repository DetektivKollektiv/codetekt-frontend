'use client';

import { BadgeList } from '@/components/ui/badge-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AggregatedReviews } from '@/lib/queries/getAggregatedReviews';
import { getLocalDate } from '@/lib/utils';
import { getTrustLevel } from '@/lib/utils/trust-level';
import { getWarningTags } from '@/lib/utils/warning-tags';
import { Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useState } from 'react';
import CardText from './card-text';
import Evaluation from './evaluation';

interface AggregatedReviewCardProps {
  caseItem: AggregatedReviews[number];
}

export const AggregatedReviewCard: FC<AggregatedReviewCardProps> = ({
  caseItem,
}) => {
  const [imageError, setImageError] = useState(false);
  const trustLevel = getTrustLevel(caseItem.result_score);

  // Type assertion for data field (Json type from Supabase)
  const reviewData = caseItem.data;
  if (!reviewData) return null;
  const warningTags = getWarningTags(reviewData.fields || {});
  const ogData = caseItem.cases.open_graph_data;

  // Safely access metadata with fallbacks
  const contentType = reviewData.metadata?.content_type || [];
  const keywordType = reviewData.metadata?.keyword_type || [];

  const handleShare = () => {
    // Placeholder for share functionality
    console.log('Share case:', caseItem.case_id);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow lg:h-72 w-full flex">
      <CardContent className="p-4 lg:p-6 w-full">
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Left: Image */}
          <div className="aspect-video lg:aspect-[4/3] flex-shrink-0">
            {ogData?.og_image && !imageError ? (
              <Image
                src={ogData.og_image}
                alt={ogData.og_title || 'Case thumbnail'}
                width={424}
                height={238}
                className="w-full h-full object-cover rounded-lg aspect-video lg:aspect-[4/3]"
                unoptimized={true}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className=" aspect-video lg:aspect-[4/3] flex-shrink-0 bg-gradient-brand rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  Kein Bild verfügbar
                </span>
              </div>
            )}
          </div>

          {/* Middle: Content */}
          <div className="flex-1 space-y-4 flex flex-col">
            {/* Badges */}
            <BadgeList contentType={contentType} keywordType={keywordType} />

            {/* Title & Description */}
            <CardText
              date={getLocalDate(caseItem.calculated_at!)}
              title={
                'Fall ' +
                caseItem.cases.case_number +
                (ogData?.og_title ? ': ' + ogData?.og_title : '')
              }
              description={ogData?.og_description ?? caseItem.cases.content}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 flex-1 items-end">
              <Link href={`/archive/${caseItem.case_id}`}>
                <Button variant={'destructive'}>Fall ansehen</Button>
              </Link>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
                Fall teilen
              </Button>
            </div>
          </div>

          {/* Right: Evaluation */}
          <Evaluation trustLevel={trustLevel} warningTags={warningTags} />
        </div>
      </CardContent>
    </Card>
  );
};
