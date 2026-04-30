'use client';

import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface TutorialVideoSource {
  src: string;
  type: string;
}

interface TutorialVideoPlayerProps {
  poster: string;
  sources: TutorialVideoSource[];
  title: string;
}

export function TutorialVideoPlayer({
  poster,
  sources,
  title,
}: TutorialVideoPlayerProps) {
  const [hasStartedLoading, setHasStartedLoading] = useState(false);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!hasStartedLoading) return;

    const video = videoRef.current;
    if (!video) return;

    video.load();
  }, [hasStartedLoading]);

  useEffect(() => {
    if (!hasStartedLoading || !shouldAutoplay) return;

    const video = videoRef.current;
    if (!video) return;

    const tryPlay = async () => {
      try {
        await video.play();
      } catch {
        setShouldAutoplay(false);
      }
    };

    void tryPlay();
  }, [hasStartedLoading, shouldAutoplay]);

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
      <video
        ref={videoRef}
        controls={hasStartedLoading}
        playsInline
        preload="none"
        poster={poster}
        className="h-full w-full"
        onPause={() => setShouldAutoplay(false)}
      >
        {hasStartedLoading
          ? sources.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))
          : null}
        Dein Browser unterstützt dieses Video nicht.
      </video>

      {!hasStartedLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 p-4">
          <Button
            type="button"
            size="lg"
            className="gap-3 rounded-full px-6"
            aria-label={`${title} laden und abspielen`}
            onClick={() => {
              setShouldAutoplay(true);
              setHasStartedLoading(true);
            }}
          >
            <PlayCircle className="size-5" />
            Abspielen
          </Button>
        </div>
      ) : null}
    </div>
  );
}
