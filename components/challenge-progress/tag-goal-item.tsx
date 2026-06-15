import type { ChallengeTagGoal } from '@/lib/queries/getChallengeProgress';

interface TagGoalItemProps {
  goal: ChallengeTagGoal;
}

export function TagGoalItem({ goal }: TagGoalItemProps) {
  const progress =
    goal.target <= 0
      ? 0
      : Math.min(Math.round((goal.resolvedCases / goal.target) * 100), 100);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <p className="text-heading-sm font-black text-brand-darkblue/65">
          {goal.label}
        </p>
        <p className="shrink-0 text-heading-sm font-black tabular-nums">
          {goal.resolvedCases}
          <span className="text-brand-darkblue/45">/{goal.target}</span>
        </p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-brand-darkblue/25">
        <div
          className="h-full rounded-full bg-brand-darkblue"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
