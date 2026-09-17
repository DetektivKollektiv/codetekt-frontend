import { getAggregatedReview } from '@/lib/queries/getAggregatedReview';
import { getShareImageData } from '@/lib/share-image/share-image-data';
import { ShareImageTemplate } from '@/lib/share-image/share-image-template';
import { createClient } from '@/lib/supabase/server';
import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const EFFRA_FONTS = [
  {
    weight: 400,
    filename: 'effra-400.otf',
  },
  {
    weight: 500,
    filename: 'effra-500.otf',
  },
  {
    weight: 700,
    filename: 'effra-700.otf',
  },
  {
    weight: 900,
    filename: 'effra-900.otf',
  },
] as const;

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

const shareImageAssetsPromise = Promise.all(
  ['codetekt_logo_weiß.svg', 'Ordner.svg'].map((filename) =>
    readFile(join(process.cwd(), 'public', 'images', filename)),
  ),
).then(([logo, folder]) => ({
  logoUrl: `data:image/svg+xml;base64,${logo.toString('base64')}`,
  folderUrl: `data:image/svg+xml;base64,${folder.toString('base64')}`,
}));

export async function GET(
  _request: Request,
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
  const [fonts, { logoUrl, folderUrl }] = await Promise.all([
    effraFontsPromise,
    shareImageAssetsPromise,
  ]);

  return new ImageResponse(
    <ShareImageTemplate
      data={shareImageData}
      logoUrl={logoUrl}
      folderUrl={folderUrl}
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
