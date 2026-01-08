import Image from 'next/image';

export default function SubmitPage() {
  return (
    <div className="w-full h-full flex-1">
      <div className="pb-12 bg-gradient-neutral-coral h-full">
        <div className="pt-24 overflow-hidden relative flex-col lg:flex-row justify-center flex lg:items-center">
          <div className="page-max-w w-full z-10 space-y-12 ">
            <div className="text-center lg:text-left">
              {/* <h2 className="text-display-eyebrow uppercase">
                Trust-Checking von codetekt
              </h2> */}
              <h1 className="text-display-sm sm:text-display-md 2xl:text-display-lg uppercase">
                Fall einreichen
              </h1>
              <p className="text-body-md max-w-xl xl:max-w-3xl mx-auto lg:mx-0">
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
            className="lg:hidden self-center w-full max-w-2xl px-12 mt-24 mb-12"
          />
          <Image
            src="/images/lady-detective.svg"
            alt="Title Illustration"
            width={600}
            height={400}
            className="ml-auto hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-2/5 xl:w-2/5 2xl:w-1/3"
          />
        </div>
      </div>
      {/* Fall einreichen Form */}
    </div>
  );
}
