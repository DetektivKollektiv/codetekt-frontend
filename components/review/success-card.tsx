import Image from 'next/image';
import { FC, useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { aggregatedReviewQuery } from '@/lib/queries/getAggregatedReview';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';

interface SuccesCardProps {
  caseId: string;
  openCasesHref?: string;
}

const SuccesCard: FC<SuccesCardProps> = ({
  caseId,
  openCasesHref = '/#open-cases',
}) => {
  const supabase = createClient();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const { data: aggregatedCase } = useQuery({
    ...aggregatedReviewQuery(supabase, caseId),
    enabled: Boolean(caseId),
    refetchInterval: (query) => (query.state.data ? false : 2000),
    refetchIntervalInBackground: true,
  });

  const hasAggregatedReview = Boolean(aggregatedCase);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({
        width: document.documentElement.clientWidth,
        height: window.innerHeight,
      });
    }
  }, []);

  return (
    <Card className="pt-6 flex flex-col">
      <Confetti
        width={dimensions.width}
        height={dimensions.height}
        numberOfPieces={1600}
        recycle={false}
        colors={['#6E4BFA', '#FFEB66', '#FF7268', '#140735']}
      />

      <CardHeader className="relative">
        <CardTitle className=" text-display-sm">
          Danke für dein Engagement!
        </CardTitle>
        <CardDescription className="max-w-xl">
          Der Fall wurde erfolgreich abgeschlossen und alle Änderungen wurden
          gespeichert.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-12 md:space-y-8 flex-1 flex items-center justify-center">
        <Image
          src={'/images/unterstuetzen.svg'}
          alt="Success"
          width={400 * 1.5}
          height={300 * 1.5}
        />
      </CardContent>
      <CardFooter className="mt-auto flex flex-col justify-end gap-2">
        {hasAggregatedReview && (
          <Link href={`/archive/${caseId}`} className="w-full">
            <Button variant={'default'} size={'default'} className="w-full">
              Zum Archivfall
            </Button>
          </Link>
        )}

        <Link href={openCasesHref} className="w-full">
          <Button variant={'outline'} size={'default'} className="w-full">
            Weitere Fälle bearbeiten
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default SuccesCard;
