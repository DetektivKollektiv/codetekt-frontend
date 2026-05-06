'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const discordUrl = 'https://discord.gg/fFABTPSxXA';

export function HomeHelpCard() {
  return (
    <Card className="relative w-full overflow-hidden rounded-lg border-none bg-brand-darkblue text-neutral-0 shadow-md">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-brand" />
      <CardContent className="relative z-10 p-0">
        <div className="flex min-h-[184px] items-center p-5 sm:p-6 md:pr-56 lg:min-h-[160px] lg:pr-72">
          <div className="max-w-2xl">
            <p className="text-display-eyebrow uppercase text-neutral-0/70">
              co:detective Support
            </p>
            <h2 className="mt-1 text-heading-lg sm:text-heading-xl">
              Hilfe findest du hier
            </h2>
            <p className="mt-2 text-body-md text-neutral-0/80">
              Im Tutorial findest du Ablauf und Kriterien. Im Discord kannst du
              Fragen stellen und dich mit anderen co:detectives austauschen.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link href="/tutorial">
                  <BookOpen className="size-4" />
                  Zum Tutorial
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-neutral-0/30 bg-neutral-0 text-brand-darkblue hover:bg-neutral-100 hover:text-brand-darkblue"
                asChild
              >
                <Link
                  href={discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" />
                  Zum Discord
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 right-8 hidden h-full items-end justify-end md:flex">
          <Image
            src="/images/projekte.svg"
            alt=""
            width={282}
            height={282}
            className="h-48 w-auto translate-y-4 lg:translate-y-16 lg:h-64"
          />
        </div>
      </CardContent>
    </Card>
  );
}
