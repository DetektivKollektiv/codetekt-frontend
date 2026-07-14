'use client';

import SafeRichText from '@/components/safe-rich-text';
import {
  useAuth,
  type AuthQueryData,
} from '@/components/provider/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { hasSeenChallengeIntroForVisibilityWindow } from '@/lib/challenge-intro';
import { updateProfile } from '@/lib/queries/updateProfile';
import type { ChallengeIntroContentData } from '@/lib/schemas';
import type { Tables } from '@/lib/types/database.types';
import { useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface ChallengeIntroContentProps {
  intro: ChallengeIntroContentData;
}

interface ChallengeIntroSeenMarkerProps {
  onProfileUpdated?: (profile: Tables<'profiles'>) => void;
  syncCache?: boolean;
  visibleFrom: string;
}

function updateProfileCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  profile: Tables<'profiles'>,
) {
  queryClient.setQueryData<AuthQueryData>(['auth'], (currentAuth) =>
    currentAuth
      ? {
          ...currentAuth,
          profile,
        }
      : currentAuth,
  );
  queryClient.setQueryData<Tables<'profiles'> | null>(
    ['profile', profile.id],
    profile,
  );
}

export function ChallengeIntroSeenMarker({
  onProfileUpdated,
  syncCache = true,
  visibleFrom,
}: ChallengeIntroSeenMarkerProps) {
  const { auth, client } = useAuth();
  const queryClient = useQueryClient();
  const hasMarkedRef = useRef(false);
  const userId = auth.user?.id;
  const seenAt = auth.profile?.challenge_intro_seen_at;

  useEffect(() => {
    if (
      hasMarkedRef.current ||
      !userId ||
      hasSeenChallengeIntroForVisibilityWindow({ seenAt, visibleFrom })
    ) {
      return;
    }

    hasMarkedRef.current = true;
    const nextSeenAt = new Date().toISOString();

    updateProfile(client, userId, {
      challenge_intro_seen_at: nextSeenAt,
    })
      .then(({ data, error }) => {
        if (error) {
          throw error;
        }

        if (data) {
          const profile = data as Tables<'profiles'>;

          if (syncCache) {
            updateProfileCaches(queryClient, profile);
          }

          onProfileUpdated?.(profile);
        }
      })
      .catch((error: Error) => {
        hasMarkedRef.current = false;
        console.error('Challenge intro seen state could not be saved:', error);
      });
  }, [
    client,
    onProfileUpdated,
    queryClient,
    seenAt,
    syncCache,
    userId,
    visibleFrom,
  ]);

  return null;
}

function ChallengeIntroDetails({ intro }: ChallengeIntroContentProps) {
  return (
    <>
      {intro.sections.map((section, index) => (
        <section key={section.heading ?? index} className="flex flex-col gap-3">
          {section.heading ? (
            <h3 className="text-heading-sm">{section.heading}</h3>
          ) : null}
          <SafeRichText
            value={section.bodyHtml}
            className="flex flex-col gap-3 text-body-md [&_a]:font-semibold [&_a]:text-brand-darkblue [&_p]:m-0"
          />
        </section>
      ))}
    </>
  );
}

export function ChallengeIntroCard({ intro }: ChallengeIntroContentProps) {
  return (
    <Card className="overflow-hidden bg-neutral-0 text-brand-darkblue shadow-md">
      <div className="grid lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="relative flex min-h-72 flex-col overflow-hidden bg-gradient-neutral-coral p-6 lg:min-h-full lg:p-8">
          <CardHeader className="relative z-10 flex flex-col gap-4 p-0 text-left">
            <p className="text-display-eyebrow uppercase">
              {intro.eyebrow}
            </p>
            <CardTitle className="text-heading-xl uppercase sm:text-display-sm lg:text-heading-xl">
              {intro.title}
            </CardTitle>
            <CardDescription className="text-body-md font-medium text-brand-darkblue">
              <SafeRichText
                value={intro.descriptionHtml}
                className="[&_strong]:font-semibold"
              />
            </CardDescription>
          </CardHeader>

          <Image
            src={intro.imageSrc}
            alt={intro.imageAlt ?? ''}
            width={600}
            height={400}
            className="pointer-events-none mt-8 w-full max-w-xs self-center lg:mt-auto lg:max-w-sm"
          />
        </div>

        <CardContent className="flex flex-col gap-5 p-6 lg:p-8">
          <ChallengeIntroDetails intro={intro} />
        </CardContent>
      </div>
    </Card>
  );
}

interface ChallengeIntroDialogProps extends ChallengeIntroContentProps {
  visibleFrom: string;
}

export function ChallengeIntroDialog({
  intro,
  visibleFrom,
}: ChallengeIntroDialogProps) {
  const [open, setOpen] = useState(true);
  const queryClient = useQueryClient();
  const openRef = useRef(open);
  const updatedProfileRef = useRef<Tables<'profiles'> | null>(null);

  const syncUpdatedProfile = () => {
    if (!updatedProfileRef.current) {
      return;
    }

    updateProfileCaches(queryClient, updatedProfileRef.current);
    updatedProfileRef.current = null;
  };

  const handleOpenChange = (nextOpen: boolean) => {
    openRef.current = nextOpen;
    setOpen(nextOpen);

    if (!nextOpen) {
      syncUpdatedProfile();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <ChallengeIntroSeenMarker
        syncCache={false}
        visibleFrom={visibleFrom}
        onProfileUpdated={(profile) => {
          updatedProfileRef.current = profile;

          if (!openRef.current) {
            syncUpdatedProfile();
          }
        }}
      />
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-hidden border-none bg-neutral-0 p-0 text-brand-darkblue sm:max-w-4xl"
      >
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
          >
            <XIcon />
            <span className="sr-only">Schließen</span>
          </Button>
        </DialogClose>

        <div className="grid max-h-[calc(100dvh-2rem)] overflow-y-auto lg:grid-cols-[22rem_minmax(0,1fr)] ">
          <div className="relative flex min-h-72 flex-col overflow-hidden bg-gradient-neutral-coral p-6 pr-14 lg:min-h-full lg:p-8 lg:pr-10">
            <DialogHeader className="relative z-10 flex flex-col gap-4 text-left">
              <p className="text-display-eyebrow uppercase">
                {intro.eyebrow}
              </p>
              <DialogTitle className="text-heading-xl uppercase sm:text-display-sm lg:text-heading-xl">
                {intro.title}
              </DialogTitle>
              <DialogDescription asChild>
                <SafeRichText
                  value={intro.descriptionHtml}
                  className="text-body-md font-medium text-brand-darkblue [&_strong]:font-semibold"
                />
              </DialogDescription>
            </DialogHeader>

            <Image
              src={intro.imageSrc}
              alt={intro.imageAlt ?? ''}
              width={600}
              height={400}
              className="pointer-events-none mt-8 w-full max-w-xs self-center lg:mt-auto lg:max-w-sm"
            />
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="flex flex-col gap-5 p-6 pt-10 lg:p-8 lg:pt-12">
              <ChallengeIntroDetails intro={intro} />
            </div>

            <Separator />

            <DialogFooter className="p-6 sm:justify-end lg:p-8">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Schließen
                </Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
