'use client';

import { Button } from '@/components/ui/button';
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
import { XIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const linkClassName = 'font-semibold underline underline-offset-4';

export function ChallengeIntroDialog() {
  return (
    <Dialog defaultOpen>
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
                Community Challenge
              </p>
              <DialogTitle className="text-heading-xl uppercase sm:text-display-sm lg:text-heading-xl">
                Mach’ mit bei unserer Streak-Challenge!
              </DialogTitle>
              <DialogDescription asChild>
                <p className="text-body-md font-medium text-brand-darkblue">
                  Im September wird in vier Bundesländern gewählt und
                  Falschinformationen haben wieder Hochsaison. Sie verunsichern,
                  spalten und beeinflussen Entscheidungen. Unsere Antwort:{' '}
                  <strong className="font-semibold">
                    Flood the zone with trust!
                  </strong>
                </p>
              </DialogDescription>
            </DialogHeader>

            <Image
              src="/images/title.svg"
              alt=""
              width={600}
              height={400}
              className="pointer-events-none mt-8 w-full max-w-xs self-center lg:mt-auto lg:max-w-sm"
            />
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="flex flex-col gap-5 p-6 pt-10 lg:p-8 lg:pt-12">
              <p className="text-body-md">
                Als codetekt-Community prüfen wir deshalb täglich Nachrichten
                auf ihre Vertrauenswürdigkeit und teilen unsere Ergebnisse
                sichtbar mit der Welt. So bleibst du selbst informiert,
                trainierst dein Gespür für Falschinformationen und stärkst
                Nachrichtenkompetenz in deinem Umfeld.
              </p>

              <section className="flex flex-col gap-3">
                <h3 className="text-heading-sm">Checken und gewinnen:</h3>
                <p className="text-body-md">
                  Werde co:detective und checke jeden Tag mindestens eine
                  Nachricht auf unserer Trust-Checking-Plattform. Im{' '}
                  <Link href="/tutorial" className={linkClassName}>
                    Tutorial
                  </Link>{' '}
                  findest du den Einstieg. Ein Trust-Check dauert im Schnitt
                  10-20 Minuten und mit etwas Routine geht dir das Prüfen
                  schnell locker von der Hand.
                </p>
                <p className="text-body-md">
                  Die gelösten Fälle kannst du anschließend teilen: mit deinem
                  Netzwerk auf Social Media, in Gesprächen oder direkt dort, wo
                  Falschinformationen auftauchen - zum Beispiel in
                  Kommentarspalten von Nachrichtenseiten. Nutze dafür die
                  Share-Funktion.
                </p>
                <p className="text-body-md">
                  Die Top-3 co:detectives mit den meisten Checks sowie fünf
                  weitere Teilnehmende, die aus allen Teilnehmenden gelost
                  werden, gewinnen vertrauenswürdige Preise. Mehr Infos folgen.
                </p>
              </section>

              <section className="flex flex-col gap-3">
                <h3 className="text-heading-sm">Fragen?</h3>
                <p className="text-body-md">
                  Tausch dich auf unserem{' '}
                  <a
                    href="https://discord.gg/fFABTPSxXA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClassName}
                  >
                    Discord-Server
                  </a>{' '}
                  mit anderen co:detectives aus oder schreib uns eine{' '}
                  <a href="mailto:info@codetekt.org" className={linkClassName}>
                    Mail
                  </a>
                  .
                </p>
              </section>
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
