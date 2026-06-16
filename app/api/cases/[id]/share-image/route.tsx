import { getAggregatedReview } from '@/lib/queries/getAggregatedReview';
import { getShareImageData } from '@/lib/share-image/share-image-data';
import { ShareImageTemplate } from '@/lib/share-image/share-image-template';
import { createClient } from '@/lib/supabase/server';
import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const EFFRA_FONTS = [
  {
    weight: 400 as const,
    filename: 'effra-400.otf',
  },
  {
    weight: 500 as const,
    filename: 'effra-500.otf',
  },
  {
    weight: 700 as const,
    filename: 'effra-700.otf',
  },
  {
    weight: 900 as const,
    filename: 'effra-900.otf',
  },
];

const effraFontsPromise = Promise.all(
  EFFRA_FONTS.map(async ({ weight, filename }) => ({
      name: 'Effra',
      data: await readFile(
        join(process.cwd(), 'public', 'fonts', 'effra', filename),
      ),
      weight,
      style: 'normal' as const,
    })),
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: aggregatedReview, error } = await getAggregatedReview(
    supabase,
    id,
  );

  if (error) {
    return new Response('Share-Bild konnte nicht erstellt werden.', {
      status: 500,
    });
  }

  if (!aggregatedReview) {
    return new Response('Fall nicht gefunden.', { status: 404 });
  }

  const shareImageData = getShareImageData(aggregatedReview);
  const origin = new URL(request.url).origin;
  const fonts = await effraFontsPromise;

  return new ImageResponse(
    <ShareImageTemplate
      data={shareImageData}
      logoUrl={`${origin}/images/codetekt_logo_wei%C3%9F.svg`}
      folderUrl={`${origin}/images/Ordner.svg`}
    />,
    {
      width: 1080,
      height: 1920,
      fonts,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Disposition': `inline; filename="fall-${shareImageData.caseNumber}.png"`,
      },
    },
  );
}
