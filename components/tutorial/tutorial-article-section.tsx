'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TutorialContentData } from '@/lib/schemas';
import { TutorialCarousel } from './tutorial-carousel';
import { TutorialSection } from './tutorial-section';

interface TutorialArticleSectionProps {
  articles: TutorialContentData['blogArticles'];
}

export function TutorialArticleSection({
  articles,
}: TutorialArticleSectionProps) {
  return (
    <TutorialSection
      title="Hilfe zum Nachlesen"
      description="Auf unseren Hilfeseiten kannst du nachlesen, wie die Plattform funktioniert und du findest Hintergrundinfos und Tipps für den Check der einzelnen Trust-Checking-Kriterien"
    >
      <TutorialCarousel
        options={{
          align: 'start',
          slidesToScroll: 1,
          dragFree: false,
        }}
      >
        {articles.map((article) => (
          <Card
            className="min-w-0 flex-[0_0_100%] overflow-hidden md:flex-[0_0_calc(50%-0.5rem)]"
            key={article.id}
          >
            <CardContent className="flex h-full flex-col gap-4 p-4 lg:p-6">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                <Image
                  src={article.imageUrl}
                  alt={article.imageAlt ?? article.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold leading-tight">
                    {article.title}
                  </h3>
                </div>
              </div>
              <div className="mt-auto">
                <Button asChild variant="secondary">
                  <Link
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {article.buttonLabel ?? 'Artikel öffnen'}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </TutorialCarousel>
    </TutorialSection>
  );
}
