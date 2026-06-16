import Image from 'next/image';

interface ShareImagePreviewProps {
  caseId: string;
}

export function ShareImagePreview({ caseId }: ShareImagePreviewProps) {
  const imageUrl = `/api/cases/${caseId}/share-image`;

  return (
    <section className="page-max-w space-y-4">
      <div>
        <p className="text-display-eyebrow uppercase text-muted-foreground">
          Debug
        </p>
        <h2 className="text-heading-xl">Share-Pic Vorschau</h2>
        <p className="text-body-sm text-muted-foreground">
          Serverseitig generiertes PNG in 1080 × 1920 Pixeln.
        </p>
      </div>

      <a href={imageUrl} target="_blank" rel="noreferrer">
        <Image
          src={imageUrl}
          alt="Vorschau des generierten Share-Pics"
          width={1080}
          height={1920}
          unoptimized
          className="w-full max-w-[540px] h-auto rounded-lg border bg-brand-darkblue"
        />
      </a>
    </section>
  );
}
