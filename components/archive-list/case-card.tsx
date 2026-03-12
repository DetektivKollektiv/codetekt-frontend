'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OpenCases } from '@/lib/queries/getOpenCases';
import { UserCases } from '@/lib/queries/getUserCases';
import { getLocalDate } from '@/lib/utils';
import { getCaseTitle } from '@/lib/utils/get-case-title';
import Link from 'next/link';
import { FC } from 'react';
import ImagePlaceholder from '../image-placeholder';
import { BadgeList } from '../ui/badge-list';
import CardText from './card-text';
import NoEvaluation from './no-evaluation';

interface CaseCardProps {
  caseItem: UserCases[number] | OpenCases[number];
}

export const CaseCard: FC<CaseCardProps> = ({ caseItem }) => {
  // Type assertion for data field (Json type from Supabase)
  const ogData =
    'open_graph_data' in caseItem ? caseItem.open_graph_data : undefined;

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
              seed={caseItem.case_number!}
            />
          </div>

          {/* Middle: Content */}
          <div className="flex-1 space-y-4 flex flex-col">
            {/* Badges */}
            <div className="opacity-40">
              <BadgeList
                category={'Bewertungen unveröffentlicht'}
                keywordType={[]}
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
              <Link href={`/review/${caseItem.id}`}>
                <Button variant={'default'}>Fall bearbeiten</Button>
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
