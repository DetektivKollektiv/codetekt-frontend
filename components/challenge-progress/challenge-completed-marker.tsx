interface ChallengeCompletedMarkerProps {
  resolvedCases: number;
  totalTarget: number;
}

export function ChallengeCompletedMarker({
  resolvedCases,
  totalTarget,
}: ChallengeCompletedMarkerProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="rounded-2xl border-[0.375rem] border-brand-yellow bg-brand-darkblue px-5 py-3 text-center text-neutral-0 shadow-lg">
        <p className="text-heading-sm font-black leading-none">
          Challenge erfüllt
        </p>
        <p className="mt-1 text-body-sm font-bold leading-tight">
          {resolvedCases}/{totalTarget} Fälle gelöst
        </p>
      </div>
    </div>
  );
}
