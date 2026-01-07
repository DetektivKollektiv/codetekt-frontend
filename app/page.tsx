import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="h-full flex-1 bg-gradient-neutral-coral">
      <div className="h-[80lvh] flex  items-center overflow-hidden relative">
        <div className="page-max-w w-full z-10">
          <h2 className="text-display-eyebrow uppercase">
            Trust-Checking von codetekt
          </h2>
          <h1 className="text-display-sm md:text-display-md 2xl:text-display-lg uppercase">
            Gemeinsam gegen <br />
            Falsch&shy;informationen
          </h1>
          <p className="text-body-md max-w-xl xl:max-w-3xl">
            Bei codetekt kannst du digitale Informationen auf
            Vertrauenswürdigkeit prüfen lassen.
            <br className="hidden xl:block" />
            Reiche Fälle ein oder werde selbst Detektiv*in und verbessere deine
            Recherche-Fähigkeiten.
          </p>
          <div className="mt-6">
            <Link href="/auth/sign-up">
              <Button size="lg" variant={'destructive'}>
                Detektiv*in werden
              </Button>
            </Link>
          </div>
        </div>
        <Image
          src="/images/title.svg"
          alt="Title Illustration"
          width={600}
          height={400}
          className="ml-auto hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-2/5 xl:w-2/5 2xl:w-1/3"
        />
      </div>
    </main>
  );
}
