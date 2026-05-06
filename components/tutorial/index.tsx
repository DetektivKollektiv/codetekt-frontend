'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { TutorialContentData } from '@/lib/schemas';
import Image from 'next/image';
import { TutorialArticleSection } from './tutorial-article-section';
import { TutorialCommunityCard } from './tutorial-community-card';
import { TutorialFaqSection } from './tutorial-faq-section';
import { TutorialVideoSection } from './tutorial-video-section';

interface TutorialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutorialContent: TutorialContentData;
  requiresConfirmation: boolean;
  isSaving: boolean;
  onConfirmRead: () => void;
}

export function TutorialDialog({
  open,
  onOpenChange,
  tutorialContent,
  requiresConfirmation,
  isSaving,
  onConfirmRead,
}: TutorialDialogProps) {
  const actionLabel = requiresConfirmation
    ? isSaving
      ? 'Wird gespeichert...'
      : 'Tutorial schließen'
    : 'Tutorial schließen';

  const renderActionButton = () =>
    requiresConfirmation ? (
      <Button
        onClick={onConfirmRead}
        disabled={isSaving}
        variant="secondary"
        className="w-full sm:w-auto"
      >
        {actionLabel}
      </Button>
    ) : (
      <DialogClose asChild>
        <Button variant="secondary" className="w-full sm:w-auto">
          {actionLabel}
        </Button>
      </DialogClose>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="left-0 top-0 flex h-[100dvh] max-h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 flex-col overflow-hidden rounded-none border-0 p-0 sm:max-w-none"
        showCloseButton={false}
        onEscapeKeyDown={(event) => {
          if (requiresConfirmation) {
            event.preventDefault();
          }
        }}
        onInteractOutside={(event) => {
          if (requiresConfirmation) {
            event.preventDefault();
          }
        }}
      >
        <DialogTitle className="sr-only">Tutorial</DialogTitle>
        <DialogDescription className="sr-only">
          So funktioniert die Plattform.
        </DialogDescription>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
          <section className="relative bg-gradient-neutral-coral">
            <div className="relative flex flex-col justify-center overflow-hidden lg:flex-row lg:items-center">
              <div className="page-max-w z-10 w-full py-12 lg:py-20">
                <div className="max-w-2xl space-y-6 text-center lg:text-left">
                  <h2 className="text-display-eyebrow uppercase">Tutorial</h2>
                  <h1 className="text-display-sm uppercase sm:text-display-md 2xl:text-display-lg">
                    So funktioniert die Plattform
                  </h1>
                  <p className="text-body-md max-w-xl xl:max-w-2xl mx-auto lg:mx-0">
                    {requiresConfirmation ? (
                      <>
                        Herzlich willkommen auf unserer
                        Trust-Checking-Plattform, co:detective! Wir haben dir
                        hier die wichtigsten Informationen zusammengestellt,
                        die du brauchst, um zu verstehen, wie die Plattform
                        funktioniert und worauf du achten musst, wenn du als
                        co:detective selbst Fälle checken willst. Schau dir
                        dazu gerne die Videos an, lies die Artikel oder stöbere
                        in den FAQs. Wenn du bereit bist loszulegen, klicke
                        unten auf “Tutorial schließen”. Melde dich auch gerne
                        auf unserem{' '}
                        <a
                          href="https://discord.gg/fFABTPSxXA"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-4"
                        >
                          Discord-Server
                        </a>{' '}
                        an, um dich mit anderen co:detectives und dem
                        codetekt-Team auszutauschen. Viel Spaß beim
                        Trust-Checken und danke für deinen Einsatz gegen
                        Falschinformationen!
                      </>
                    ) : (
                      'Auf dieser Seite findest du Videos und Artikel, die die Funktionsweise der Trust-Checking-Plattform erklären. Außerdem findest du Antworten zu häufig gestellten Fragen.'
                    )}
                  </p>
                  {!requiresConfirmation ? (
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
            <TutorialArticleSection articles={tutorialContent.blogArticles} />
            <TutorialFaqSection faqItems={tutorialContent.faqItems} />
            <TutorialCommunityCard
              communityCard={tutorialContent.communityCard}
            />
            <div className="flex justify-center lg:justify-start">
              {renderActionButton()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
