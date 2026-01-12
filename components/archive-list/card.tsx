'use client';

import { BadgeList } from '@/components/ui/badge-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AggregatedReviews } from '@/lib/queries/getAggregatedReviews';
import { getTrustLevel } from '@/lib/utils/trust-level';
import { getWarningTags } from '@/lib/utils/warning-tags';
import { Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useState } from 'react';
import Evaluation from './evaluation';

interface ArchiveItemCardProps {
  caseItem: AggregatedReviews[number];
}

export const ArchiveItemCard: FC<ArchiveItemCardProps> = ({ caseItem }) => {
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
            <div>
              <h3 className="text-lg font-semibold line-clamp-2">
                {ogData?.og_title || 'Titel nicht verfügbar'}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                {ogData?.og_description ||
                  'Keine Beschreibung verfügbar. Klicken Sie auf "Fall ansehen" für weitere Details.'}
              </p>
            </div>

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
