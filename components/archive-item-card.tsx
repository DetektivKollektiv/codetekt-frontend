'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getTrustLevel } from '@/lib/utils/trust-level';
import { getWarningTags } from '@/lib/utils/warning-tags';
import { Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useState } from 'react';
import { Badge } from './ui/badge';
import { BadgeList } from './ui/badge-list';
import { Button } from './ui/button';

interface ReviewData {
  fields: Record<string, any>;
  metadata: {
    content_type: string[];
    keyword_type: string[];
  };
}

interface ArchiveItemCardProps {
  caseItem: {
    case_id: string;
    result_score: number;
    data: any; // Json type from Supabase
    cases: {
      id: string;
      content: string;
      open_graph_data: {
        og_image: string | null;
        og_title: string | null;
        og_description: string | null;
      } | null;
    };
  };
}

export const ArchiveItemCard: FC<ArchiveItemCardProps> = ({ caseItem }) => {
  const [imageError, setImageError] = useState(false);
  const trustLevel = getTrustLevel(caseItem.result_score);

  // Type assertion for data field (Json type from Supabase)
  const reviewData = caseItem.data as ReviewData;
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
          <div className="w-full lg:w-72 flex-shrink-0 space-y-4 bg-secondary text-secondary-foreground p-4 rounded-lg h-48 lg:h-auto">
            <div>
              <h4 className="text-sm font-semibold mb-2">Bewertung</h4>
              <Badge
                className={cn(
                  trustLevel.colorClass,
                  'w-full justify-center pointer-events-none'
                )}
              >
                {trustLevel.label}
              </Badge>
            </div>

            {warningTags.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">
                  Tags zur Bewertung
                </h4>
                <div className="break-words min-w-0 hyphens-auto text-destructive text-body-sm">
                  {warningTags.slice(0, 4).map((tag, idx) => (
                    <span className="" key={tag}>
                      {tag}
                      {idx < warningTags.slice(0, 4).length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
