interface ChallengeHeaderProps {
  descriptionColumns: string[];
  displayedDay: number;
  eyebrow: string;
  title: string;
  totalDays: number;
}

export function ChallengeHeader({
  descriptionColumns,
  displayedDay,
  eyebrow,
  title,
  totalDays,
}: ChallengeHeaderProps) {
  return (
    <div className="relative z-30 px-5 pb-8 pt-8 sm:px-6 lg:px-12 lg:pb-10 lg:pt-12">
      <div className="flex flex-col md:flex-row items-start justify-between gap-8">
        <div>
          <p className="text-display-eyebrow uppercase text-neutral-0/70">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-display-sm uppercase sm:text-display-md 2xl:text-display-lg">
            {title}
          </h2>
          <div className="mt-2 grid max-w-3xl gap-2 text-body-md md:grid-cols-2">
            {descriptionColumns.map((description) => (
              <p key={description}>{description}</p>
            ))}
          </div>
        </div>
        <div className="ml-auto order-first shrink-0 rounded-2xl bg-neutral-0 px-4 py-2 text-heading-sm font-black leading-none text-brand-darkblue md:order-none">
          Tag <span className="tabular-nums">{displayedDay}</span>
          <span className="text-brand-darkblue/45">
            /<span className="tabular-nums">{totalDays}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
