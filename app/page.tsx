import { ArchiveList } from '@/components/archive-list';
import { Button } from '@/components/ui/button';
import { getAggregatedReviews } from '@/lib/queries/getAggregatedReviews';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await getAggregatedReviews(supabase);

  if (error) {
    throw error;
  }

  return (
    <main className="h-full flex-1">
      <div className="pb-12 bg-gradient-neutral-coral">
        <div className="lg:h-[80lvh] pt-24 overflow-hidden relative flex-col lg:flex-row justify-center flex lg:items-center">
          <div className="page-max-w w-full z-10 space-y-12 ">
            <div className="text-center lg:text-left">
              <h2 className="text-display-eyebrow uppercase">
                Trust-Checking von codetekt
              </h2>
              <h1 className="text-display-sm sm:text-display-md 2xl:text-display-lg uppercase">
                Gemeinsam gegen <br />
                Falsch&shy;informationen
              </h1>
              <p className="text-body-md max-w-xl xl:max-w-3xl mx-auto lg:mx-0">
                Bei codetekt kannst du digitale Informationen auf
                Vertrauenswürdigkeit prüfen lassen.{' '}
                <br className="hidden xl:block" />
                Reiche Fälle ein oder werde selbst Detektiv*in und verbessere
                deine Recherche-Fähigkeiten.
              </p>
              <div className="mt-6">
                <Link href="/auth/sign-up">
                  <Button size="lg" variant={'default'}>
                    Detektiv*in werden
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <Image
            src="/images/title.svg"
            alt="Title Illustration"
            width={600}
            height={400}
            className="lg:hidden self-center w-full max-w-2xl px-12 mt-24 mb-12"
          />
          <Image
            src="/images/title.svg"
            alt="Title Illustration"
            width={600}
            height={400}
            className="ml-auto hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-2/5 xl:w-2/5 2xl:w-1/3"
          />
        </div>
        <div className="page-max-w">
          <div className="w-full rounded-lg bg-background p-5 page-max-w">
            <h3 className="text-display-eyebrow uppercase">
              Unsere Partner*innen, Unterstützer*innen und Netzwerke
            </h3>
            <div className="flex mt-6 overflow-x-scroll justify-around space-x-6 no-scrollbar ">
              <Image
                src="/images/logo_dpl.png"
                alt="DPL Logos"
                width={0}
                height={0}
                sizes="10vw"
                className="saturate-0 h-12 w-auto"
              />
              <Image
                src="/images/logo_mabb.png"
                alt="DPL Logos"
                width={0}
                height={0}
                sizes="10vw"
                className="saturate-0 h-12 w-auto"
              />
              <Image
                src="/images/logo_campact.png"
                alt="DPL Logos"
                width={0}
                height={0}
                sizes="10vw"
                className="saturate-0 h-12 w-auto"
              />
              <Image
                src="/images/logo_berlin.png"
                alt="DPL Logos"
                width={0}
                height={0}
                sizes="10vw"
                className="saturate-0 h-12 w-auto"
              />
              <Image
                src="/images/logo_anstossdemokratie.png"
                alt="DPL Logos"
                width={0}
                height={0}
                sizes="10vw"
                className="saturate-0 h-12 w-auto"
              />
              <Image
                src="/images/logo_mitwirken.svg"
                alt="DPL Logos"
                width={0}
                height={0}
                sizes="10vw"
                className="saturate-0 h-12 w-auto"
              />
              <Image
                src="/images/logo_dda.png"
                alt="DPL Logos"
                width={0}
                height={0}
                sizes="10vw"
                className="saturate-0 h-12 w-auto"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="page-max-w mt-12 lg:mt-24">
        <h1 className="text-display-sm sm:text-display-sm 2xl:text-display-md uppercase ">
          Gelöste Fälle
        </h1>
      </div>

      <ArchiveList
        className="mt-8 lg:mb-24 mb-12"
        initialData={data ?? []}
        pageSize={5}
        syncWithURL={false}
        showPageNumbers
      />
    </main>
  );
}
