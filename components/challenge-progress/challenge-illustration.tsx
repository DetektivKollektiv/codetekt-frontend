'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const challengePeople = [
  {
    src: '/images/community_challenge/Person_1.svg',
    width: 366,
    height: 576,
    className: 'h-[29rem]',
  },
  {
    src: '/images/community_challenge/Person_2.svg',
    width: 448,
    height: 628,
    className: 'h-[34rem]',
  },
  {
    src: '/images/community_challenge/Person_3.svg',
    width: 335,
    height: 553,
    className: 'h-[28rem]',
  },
  {
    src: '/images/community_challenge/Person_4.svg',
    width: 448,
    height: 600,
    className: 'h-[29rem]',
  },
] as const;

const mobileChallengePeople = challengePeople.filter(
  (_, index) => index % 2 === 0,
);

export function ChallengeIllustration() {
  const [isDesktop, setIsDesktop] = useState(false);
  const visibleChallengePeople = isDesktop
    ? challengePeople
    : mobileChallengePeople;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleChange = () => setIsDesktop(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return (
    <>
      <div
        className="absolute inset-x-8 bottom-0 top-0 z-0 grid grid-cols-2 items-end md:grid-cols-4 lg:inset-x-12"
        aria-hidden="true"
      >
        {visibleChallengePeople.map((person) => (
          <div
            key={person.src}
            className="flex h-full items-end justify-center"
          >
            <Image
              src={person.src}
              alt=""
              width={person.width}
              height={person.height}
              sizes="(min-width: 1024px) 20vw, 15rem"
              className={cn(
                'translate-y-4 w-auto max-w-none object-contain object-bottom',
                person.className,
              )}
            />
          </div>
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(180deg, hsl(var(--brand-yellow) / 0) 0%, hsl(var(--brand-coral) / 0.5) 55%, hsl(var(--brand-coral)) 100%)',
        }}
        aria-hidden="true"
      />
    </>
  );
}
