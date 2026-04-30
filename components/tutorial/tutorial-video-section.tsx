'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TutorialCarousel } from './tutorial-carousel';
import { TutorialSection } from './tutorial-section';
import { TutorialVideoPlayer } from './tutorial-video-player';

const tutorialVideos = [
  {
    id: 'tutorial-cases',
    title: 'Fälle einreichen und bearbeiten',
    poster: '/images/tutorial_thumbnails/tutorial-platform-cases.jpg',
    sources: [
      {
        src: '/videos/tutorial-platform-cases.webm',
        type: 'video/webm',
      },
      {
        src: '/videos/tutorial-platform-cases.mp4',
        type: 'video/mp4',
      },
    ],
  },
  {
    id: 'tutorial-trust-checking',
    title: 'Trust-Checking verstehen',
    poster: '/images/tutorial_thumbnails/tutorial-platform-trust-checking.jpg',
    sources: [
      {
        src: '/videos/tutorial-platform-trust-checking.webm',
        type: 'video/webm',
      },
      {
        src: '/videos/tutorial-platform-trust-checking.mp4',
        type: 'video/mp4',
      },
    ],
  },
];

export function TutorialVideoSection() {
  return (
    <TutorialSection>
      <TutorialCarousel
        options={{
          align: 'start',
          slidesToScroll: 1,
          dragFree: false,
        }}
      >
        {tutorialVideos.map((video) => (
          <Card
            className="min-w-0 flex-[0_0_100%] overflow-hidden"
            key={video.id}
          >
            <CardHeader className="flex flex-col gap-2">
              <CardTitle>{video.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <TutorialVideoPlayer
                poster={video.poster}
                sources={video.sources}
                title={video.title}
              />
            </CardContent>
          </Card>
        ))}
      </TutorialCarousel>
    </TutorialSection>
  );
}
