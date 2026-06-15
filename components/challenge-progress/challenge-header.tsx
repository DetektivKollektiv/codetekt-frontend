interface ChallengeHeaderProps {
  displayedDay: number;
  eyebrow: string;
  totalDays: number;
  totalTarget: number;
}

export function ChallengeHeader({
  displayedDay,
  eyebrow,
  totalDays,
  totalTarget,
}: ChallengeHeaderProps) {
  return (
    <div className="relative z-30 px-5 pb-8 pt-8 sm:px-6 lg:px-12 lg:pb-10 lg:pt-12">
      <div className="flex items-start justify-between gap-8">
        <div>
          <p className="text-display-eyebrow uppercase text-neutral-0/70">
            Community Challenge zu den {eyebrow}
          </p>
          <h2 className="mt-2 text-display-sm uppercase sm:text-display-md 2xl:text-display-lg">
            Gemeinsam zur {totalTarget}
          </h2>
        </div>
        <div className="shrink-0 rounded-2xl bg-neutral-0 px-4 py-2 text-heading-sm font-black leading-none text-brand-darkblue">
          Tag <span className="tabular-nums">{displayedDay}</span>
          <span className="text-brand-darkblue/45">
            /<span className="tabular-nums">{totalDays}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
