'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TutorialContentData } from '@/lib/schemas';

interface TutorialCommunityCardProps {
  communityCard: TutorialContentData['communityCard'];
}

export function TutorialCommunityCard({
  communityCard,
}: TutorialCommunityCardProps) {
  return (
    <Card className="px-6 py-8 md:px-8 md:py-10">
      <div className="flex flex-col-reverse items-center gap-8 lg:flex-row lg:justify-between">
        <CardContent className="flex-1 p-0">
          <CardHeader className="flex flex-col gap-4 p-0 text-center lg:text-left">
            <CardTitle>{communityCard.title}</CardTitle>
            <p className="text-body-lg text-muted-foreground">
              {communityCard.description}
            </p>
          </CardHeader>
          <div className="mt-6 flex justify-center lg:justify-start">
            <Button asChild>
              <Link
                href={communityCard.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {communityCard.buttonLabel}
              </Link>
            </Button>
          </div>
        </CardContent>
        <div className="flex w-full justify-center lg:w-auto">
          <Image
            src={communityCard.illustrationSrc}
            alt={communityCard.illustrationAlt ?? communityCard.title}
            width={320}
            height={240}
            className="w-48 md:w-64"
          />
        </div>
      </div>
    </Card>
  );
}
