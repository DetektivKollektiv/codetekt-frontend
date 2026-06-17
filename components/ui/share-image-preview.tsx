import Image from 'next/image';

interface ShareImagePreviewProps {
  caseId: string;
}

function ShareFrame({
  imageUrl,
  variant,
}: {
  imageUrl: string;
  variant: 'story-left' | 'post' | 'story-right';
}) {
  const isPost = variant === 'post';

  return (
    <div
      className="relative flex w-[34%] shrink-0 flex-col gap-2"
      style={{ transform: 'rotate(8deg)' }}
    >
      <div
        className={`relative overflow-hidden rounded-lg bg-brand-darkblue ${
          isPost ? 'aspect-[4/5]' : 'aspect-[9/16]'
        }`}
      >
        {isPost ? (
          <div className="absolute inset-x-2 top-2 h-1 rounded-full bg-neutral-400 z-10" />
        ) : (
          <>
            <div className="absolute left-2 top-2 size-3 rounded-full bg-neutral-400" />
            <div className="absolute right-3 top-3 h-1 w-2/3 rounded-full bg-neutral-400" />
          </>
        )}
        <Image
          src={imageUrl}
          alt=""
          width={1080}
          height={1920}
          unoptimized
          className={
            isPost
              ? 'absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[74%] rounded-sm'
              : 'absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[68%] rounded-sm'
          }
        />
      </div>

      {isPost && (
        <div className="flex items-center gap-2">
          <div className="size-4 rounded-full bg-neutral-400" />
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-1.5 w-full rounded-full bg-neutral-400" />
            <div className="h-1.5 w-2/3 rounded-full bg-neutral-400" />
          </div>
        </div>
      )}

      {!isPost && variant === 'story-right' && (
        <div className="absolute bottom-4 left-3 flex items-center gap-2">
          <div className="size-4 rounded-full bg-neutral-400" />
          <div className="flex flex-col gap-1">
            <div className="h-1.5 w-14 rounded-full bg-neutral-400" />
            <div className="h-1.5 w-10 rounded-full bg-neutral-400" />
          </div>
        </div>
      )}
    </div>
  );
}

export function ShareImagePreview({ caseId }: ShareImagePreviewProps) {
  const imageUrl = `/api/cases/${caseId}/share-image`;

  return (
    <div className="flex aspect-video w-full items-center justify-center gap-3 overflow-hidden rounded-lg border bg-muted-foreground px-3 py-4">
      <ShareFrame imageUrl={imageUrl} variant="story-left" />
      <ShareFrame imageUrl={imageUrl} variant="post" />
      <ShareFrame imageUrl={imageUrl} variant="story-right" />
    </div>
  );
}
