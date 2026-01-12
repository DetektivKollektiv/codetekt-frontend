'use client';

import { BadgeList } from '@/components/ui/badge-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserCases } from '@/lib/queries/getUserCases';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useState } from 'react';
import NoEvaluation from './no-evaluation';

interface CaseCardProps {
  caseItem: UserCases[number];
}

export const CaseCard: FC<CaseCardProps> = ({ caseItem }) => {
  const [imageError, setImageError] = useState(false);

  // Type assertion for data field (Json type from Supabase)
  const ogData = caseItem.open_graph_data;

  const handleShare = () => {
    // Placeholder for share functionality
    console.log('Share case:', caseItem.id);
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
            <div className="opacity-40">
              <BadgeList
                contentType={['Kategorie']}
                keywordType={['Stichwort', 'Stichwort', 'Stichwort']}
              />
            </div>

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
              <Link href={`/archive/${caseItem.id}`}>
                <Button variant={'default'}>Fall bewerten</Button>
              </Link>
            </div>
          </div>

          {/* Right: Evaluation */}
          <NoEvaluation />
        </div>
      </CardContent>
    </Card>
  );
};
