import { aggregatedReviewQuery } from '@/lib/queries/getAggregatedReview';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';

interface SuccesCardProps {
  caseId: string;
  openCasesHref?: string;
}

const gifPaths = [
  { path: '/gifs/Danke.gif', width: 512, height: 512 },
  { path: '/gifs/Herz.gif', width: 512, height: 804 },
  { path: '/gifs/Trump.gif', width: 512, height: 512 },
];

const getDeterministicGif = (id: string) => {
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }

  return gifPaths[hash % gifPaths.length];
};

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

  const randomGif = getDeterministicGif(caseId);

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
          Geschafft! Danke für deine Bewertung! 🎉
        </CardTitle>
        <CardDescription className="max-w-xl">
          Dank deines Einsatzes wurde das Internet gerade ein kleines bisschen
          vertrauenswürdiger! <br />
          {hasAggregatedReview
            ? 'Wenn du sehen willst, wie andere co:detectives den Fall bewertet haben, kannst du dir direkt die Details anschauen. Oder du machst einfach direkt mit dem nächsten Fall weiter!'
            : 'Die Bewertungen anderer co:detectives werden gerade noch zusammengetragen. Schau gerne später nochmal vorbei, um die Details zu sehen. Oder du machst einfach direkt mit dem nächsten Fall weiter!'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-12 md:space-y-8 flex-1 flex items-center justify-center">
        <Image
          src={randomGif.path}
          alt="Success"
          unoptimized
          width={randomGif.width}
          height={randomGif.height}
          className="h-auto w-auto max-h-96 max-w-96 object-contain"
        />
      </CardContent>
      <CardFooter className="mt-auto flex flex-col justify-end gap-2">
        {hasAggregatedReview && (
          <Link href={`/archive/${caseId}`} className="w-full">
            <Button variant={'default'} size={'default'} className="w-full">
              Zum Fall
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
