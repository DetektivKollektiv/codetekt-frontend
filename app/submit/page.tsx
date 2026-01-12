import { CreateCaseForm } from '@/components/create-case-form';
import { getAuth } from '@/lib/supabase/getAuth';
import Image from 'next/image';

export default async function SubmitPage() {
  const { user, isAuthenticated } = await getAuth();

  return (
    <div className="w-full h-full flex-1 relative">
      <div className="bg-gradient-neutral-coral h-full py-12 lg:py-24">
        <div className="flex-col lg:flex-row justify-center flex lg:items-center">
          <div className="page-max-w w-full z-10 space-y-12 ">
            <div>
              {/* <h2 className="text-display-eyebrow uppercase">
                Trust-Checking von codetekt
              </h2> */}
              <h1 className="text-display-sm sm:text-display-md 2xl:text-display-lg uppercase">
                Fall einreichen
              </h1>
              <p className="text-body-md max-w-xl xl:max-w-3xl ">
                Hier kannst du Inhalte zur Überprüfung einreichen – etwa
                Behauptungen aus Gesprächen, Online-Artikel, Social-Media-Posts
                oder Messenger-Nachrichten. Wir leiten deinen Fall direkt an
                unsere Detektiv*innen weiter, die ihn prüfen und bewerten.
              </p>
            </div>
          </div>
          <Image
            src="/images/lady-detective.svg"
            alt="Title Illustration"
            width={600}
            height={400}
            className="ml-auto hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-1/3 xl:w-1/3 2xl:w-1/4"
          />
        </div>
        {/* Fall einreichen Form */}
        <div className="page-max-w mt-12">
          <div className="lg:max-w-xl xl:max-w-2xl">
            {user && (
              <CreateCaseForm user={user} isAuthenticated={isAuthenticated} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
