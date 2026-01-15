'use client';

import { BadgeList } from '@/components/ui/badge-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OpenCases } from '@/lib/queries/getOpenCases';
import { UserCases } from '@/lib/queries/getUserCases';
import { getCaseTitle, getLocalDate } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useState } from 'react';
import CardText from './card-text';
import NoEvaluation from './no-evaluation';

interface CaseCardProps {
  caseItem: UserCases[number] | OpenCases[number];
}

export const CaseCard: FC<CaseCardProps> = ({ caseItem }) => {
  const [imageError, setImageError] = useState(false);

  // Type assertion for data field (Json type from Supabase)
  const ogData = caseItem.open_graph_data;

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
            <CardText
              date={getLocalDate(caseItem.submitted_at!)}
              title={getCaseTitle(caseItem)}
              description={ogData?.og_description ?? caseItem.content}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 flex-1 items-end">
              {'review_answers_in_progress' in caseItem &&
              caseItem.review_answers_in_progress &&
              caseItem.review_answers_in_progress.length > 0 ? (
                <Link href={`/review/${caseItem.id}`}>
                  <Button variant={'default'}>Bewertung bearbeiten</Button>
                </Link>
              ) : (
                <Link href={`/review/${caseItem.id}`}>
                  <Button variant={'default'}>Fall bewerten</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Right: Evaluation */}
          <NoEvaluation />
        </div>
      </CardContent>
    </Card>
  );
};
