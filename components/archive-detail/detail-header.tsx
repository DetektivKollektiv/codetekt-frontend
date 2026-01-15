'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { AggregatedReview } from '@/lib/queries/getAggregatedReview';
import { getLocalDate } from '@/lib/utils';
import { ArrowLeft, LinkIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ImagePlaceholder from '../image-placeholder';

interface DetailHeaderProps {
  aggregatedReview: NonNullable<AggregatedReview>;
}

export function DetailHeader({ aggregatedReview }: DetailHeaderProps) {
  const caseData = aggregatedReview.cases;
  const ogData = caseData.open_graph_data;
  const reviewData = aggregatedReview.data;

  const title = ogData?.og_title || caseData.content || 'Titel nicht verfügbar';
  const description =
    ogData?.og_description ||
    caseData.content ||
    'Keine Beschreibung verfügbar';
  const imageUrl = ogData?.og_image;

  const contentType = reviewData?.metadata?.content_type || [];
  const keywordType = reviewData?.metadata?.keyword_type || [];

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
      <h1 className="text-display-sm sm:text-display-md 2xl:text-display-lg uppercase">
        Fall {caseData.case_number}
      </h1>

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
                <h2 className="text-heading-xl leading-tight">{title}</h2>
              </div>

              <p className="text-body-md text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>

            {/* Right: Image and metadata */}
            <div className="space-y-4">
              {/* Image or placeholder */}
              {imageUrl ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={imageUrl}
                    alt={ogData?.og_image_alt || title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-muted flex items-center justify-center relative">
                  <ImagePlaceholder
                    width={640}
                    height={360}
                    seed={caseData.case_number!}
                    className="rounded-lg aspect-video max-w-full opacity-20 absolute inset-0 z-0"
                  />
                  <p className="text-body-md text-foreground font-bold z-10">
                    Kein Bild verfügbar
                  </p>
                </div>
              )}

              {/* Tags zum Inhalt */}
              <div className="space-y-2">
                <p className="text-body-sm font-medium">Tags zum Inhalt</p>
                <div className="flex flex-wrap gap-2">
                  {contentType.map((type) => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                  {keywordType.map((keyword) => (
                    <Badge key={keyword} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Hinterlegter Link if content is URL */}
              {caseData.content_type === 'url' && (
                <div className="space-y-2">
                  <p className="text-body-sm font-medium">Hinterlegter Link:</p>
                  <a
                    href={caseData.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-body-sm text-primary hover:underline break-all flex items-start gap-2"
                  >
                    <LinkIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{caseData.content}</span>
                  </a>
                </div>
              )}

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
