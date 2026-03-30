'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { AggregatedReview } from '@/lib/queries/getAggregatedReview';
import { getLocalDate } from '@/lib/utils';
import { getCaseCategoryName } from '@/lib/utils/get-case-category-name';
import { getCaseKeywords } from '@/lib/utils/get-case-keywords';
import { getCaseTitle } from '@/lib/utils/get-case-title';
import { ArrowLeft, Edit, LinkIcon } from 'lucide-react';
import Link from 'next/link';
import ImagePlaceholder from '../image-placeholder';
import { HelpButton } from '../ui/help-button';
import { ShareButton } from '../ui/share-button';

interface DetailHeaderProps {
  aggregatedReview: NonNullable<AggregatedReview>;
  hasSubmittedByCurrentUser: boolean;
}

export function DetailHeader({
  aggregatedReview,
  hasSubmittedByCurrentUser,
}: DetailHeaderProps) {
  const caseData = aggregatedReview.cases;
  const ogData = caseData.open_graph_data;

  const description =
    ogData?.og_description ||
    caseData.content ||
    'Keine Beschreibung verfügbar';

  const category = getCaseCategoryName(caseData);

  return (
    <div className="space-y-6 page-max-w">
      {/* Back button */}
      <Link href="/archive">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zum Archive
        </Button>
      </Link>

      {/* Case number title */}
      <div className="flex flex-col gap-2 md:flex-row w-full justify-between md:items-end">
        <h1 className="text-display-sm sm:text-display-md 2xl:text-display-lg uppercase">
          Fall {caseData.case_number}
        </h1>
        <div className="flex gap-2">
          {!hasSubmittedByCurrentUser && (
            <Link href={`/review/${aggregatedReview.case_id}`}>
              <Button variant={'outline'} size={'sm'}>
                <Edit className="w-4 h-4 mr-2" />
                Fall bearbeiten
              </Button>
            </Link>
          )}
          <ShareButton caseId={aggregatedReview.case_id} size={'sm'} />
          <HelpButton />
        </div>
      </div>

      {/* Main content card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Text content */}
            <div className="space-y-4">
              <p className="text-body-sm text-muted-foreground uppercase tracking-wide">
                Infos zum Fall
              </p>

              <div>
                <h2 className="text-heading-xl leading-tight">
                  {getCaseTitle(aggregatedReview)}
                </h2>
              </div>

              {aggregatedReview.cases.content_type === 'url' ? (
                <Link
                  href={aggregatedReview.cases.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-body-md text-primary underline
        break-all leading-relaxed"
                >
                  <LinkIcon className="w-4 h-4 mr-2 flex-shrink-0 inline mb-0.5" />
                  {description}
                </Link>
              ) : (
                <p className="text-body-md text-muted-foreground leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Right: Image and metadata */}
            <div className="space-y-4">
              {/* Image or placeholder */}

              <div className="aspect-video rounded-lg bg-muted flex items-center justify-center relative overflow-hidden">
                <ImagePlaceholder
                  seed={caseData.case_number!}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Tags zum Inhalt */}
              <div className="space-y-2">
                <p className="text-body-sm font-medium">Tags zum Inhalt</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{category}</Badge>
                  <p>•</p>
                  {getCaseKeywords(aggregatedReview).map((keyword, index) => (
                    <Badge key={index} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Datum */}
              <div className="space-y-2">
                <p className="text-body-sm font-medium">Datum</p>
                <p className="text-body-sm text-muted-foreground">
                  Einreichung: {getLocalDate(caseData.submitted_at)}
                </p>
                <p className="text-body-sm text-muted-foreground">
                  Zuletzt bearbeitet:{' '}
                  {getLocalDate(aggregatedReview.calculated_at)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
