'use client';

import { Button } from '@/components/ui/button';
import { useAuth, type AuthQueryData } from '@/components/provider/auth-provider';
import {
  ChallengeIntroCard,
  ChallengeIntroSeenMarker,
} from '@/components/challenge-progress/challenge-intro-dialog';
import type { ChallengeProgress } from '@/lib/queries/getChallengeProgress';
import { updateProfile } from '@/lib/queries/updateProfile';
import { TutorialContentData } from '@/lib/schemas';
import type { Tables } from '@/lib/types/database.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TutorialArticleSection } from './tutorial-article-section';
import { TutorialCommunityCard } from './tutorial-community-card';
import { TutorialFaqSection } from './tutorial-faq-section';
import { TutorialVideoSection } from './tutorial-video-section';

interface TutorialPageContentProps {
  challengeProgress: ChallengeProgress | null;
  tutorialContent: TutorialContentData;
  requiresConfirmation: boolean;
}

export function TutorialPageContent({
  challengeProgress,
  tutorialContent,
  requiresConfirmation,
}: TutorialPageContentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { auth, client } = useAuth();
  const { user } = auth;

  const tutorialReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('Nutzerprofil konnte nicht geladen werden');
      }

      const { data, error } = await updateProfile(client, user.id, {
        tutorial_completed_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      return data as Tables<'profiles'>;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData<AuthQueryData>(
        ['auth'],
        (currentAuth) =>
          currentAuth
            ? {
                ...currentAuth,
                profile: updatedProfile,
              }
            : currentAuth,
      );
      queryClient.setQueryData<Tables<'profiles'> | null>(
        ['profile', updatedProfile.id],
        updatedProfile,
      );
      toast.success('Tutorial als gelesen markiert.');
      router.push('/');
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Tutorial konnte nicht gespeichert werden.');
    },
  });

  const renderActionButton = () =>
    requiresConfirmation ? (
      <Button
        onClick={() => tutorialReadMutation.mutate()}
        disabled={tutorialReadMutation.isPending}
        variant="secondary"
        className="w-full sm:w-auto"
      >
        {tutorialReadMutation.isPending
          ? 'Wird gespeichert...'
          : 'Tutorial gelesen'}
      </Button>
    ) : null;

  return (
    <div className="min-h-full overflow-x-hidden">
      <section className="relative bg-gradient-neutral-coral">
        <div className="relative flex flex-col justify-center overflow-hidden lg:flex-row lg:items-center">
          <div className="page-max-w z-10 w-full py-12 lg:py-20">
            <div className="max-w-2xl space-y-6 text-center lg:text-left">
              <h2 className="text-display-eyebrow uppercase">Tutorial</h2>
              <h1 className="text-display-sm uppercase sm:text-display-md 2xl:text-display-lg">
                So funktioniert die Plattform
              </h1>
              <p className="text-body-md mx-auto max-w-xl xl:max-w-2xl lg:mx-0">
                {requiresConfirmation ? (
                  <>
                    Herzlich willkommen auf unserer Trust-Checking-Plattform,
                    co:detective! Wir haben dir hier die wichtigsten
                    Informationen zusammengestellt, die du brauchst, um zu
                    verstehen, wie die Plattform funktioniert und worauf du
                    achten musst, wenn du als co:detective selbst Fälle checken
                    willst. Schau dir dazu gerne die Videos an, lies die Artikel
                    oder stöbere in den FAQs. Wenn du bereit bist loszulegen,
                    klicke unten auf “Tutorial gelesen”. Melde dich auch gerne
                    auf unserem{' '}
                    <a
                      href="https://discord.gg/fFABTPSxXA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4"
                    >
                      Discord-Server
                    </a>{' '}
                    an, um dich mit anderen co:detectives und dem codetekt-Team
                    auszutauschen. Viel Spaß beim Trust-Checken und danke für
                    deinen Einsatz gegen Falschinformationen!
                  </>
                ) : (
                  'Auf dieser Seite findest du Videos und Artikel, die die Funktionsweise der Trust-Checking-Plattform erklären. Außerdem findest du Antworten zu häufig gestellten Fragen.'
                )}
              </p>
              {requiresConfirmation ? (
                <div className="flex justify-center lg:justify-start">
                  {renderActionButton()}
                </div>
              ) : null}
            </div>
          </div>
          {/* <Image
            src="/images/title.svg"
            alt="Tutorial Illustration"
            width={600}
            height={400}
            className="self-center w-full max-w-2xl px-12 pb-12 lg:hidden"
          /> */}
        </div>
        <Image
          src="/images/title.svg"
          alt="Tutorial Illustration"
          width={600}
          height={400}
          className="pointer-events-none absolute right-0 top-12 z-0 hidden w-2/5 lg:block xl:w-2/5 2xl:w-1/3"
        />
      </section>

      <div className="page-max-w flex flex-col gap-10 py-10 lg:py-12">
        <TutorialVideoSection />
        {challengeProgress ? (
          <>
            <ChallengeIntroSeenMarker
              visibleFrom={challengeProgress.visibleFrom}
            />
            <ChallengeIntroCard intro={challengeProgress.intro} />
          </>
        ) : null}
        <TutorialArticleSection articles={tutorialContent.blogArticles} />
        <TutorialFaqSection faqItems={tutorialContent.faqItems} />
        <TutorialCommunityCard communityCard={tutorialContent.communityCard} />
        {requiresConfirmation ? (
          <div className="flex justify-center lg:justify-start">
            {renderActionButton()}
          </div>
        ) : null}
      </div>
    </div>
  );
}
