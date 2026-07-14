import type { ChallengeProgress } from '@/lib/queries/getChallengeProgress';
import { ChallengeHeader } from './challenge-header';
import { ChallengeIllustration } from './challenge-illustration';
import { ChallengeProgressGrid } from './challenge-progress-grid';
import { ProgressLegend } from './progress-legend';

interface ProgressOverviewSectionProps {
  challengeProgress: ChallengeProgress;
  displayedDay: number;
  totalDays: number;
  userResolvedPoints: ReadonlySet<number>;
}

export function ProgressOverviewSection({
  challengeProgress,
  displayedDay,
  totalDays,
  userResolvedPoints,
}: ProgressOverviewSectionProps) {
  return (
    <section className="relative overflow-hidden bg-brand-darkblue text-neutral-0">
      <ChallengeHeader
        displayedDay={displayedDay}
        eyebrow={challengeProgress.eyebrow}
        totalDays={totalDays}
        totalTarget={challengeProgress.totalTarget}
      />

      <div className="relative h-[26rem]">
        <ChallengeIllustration />
        <ChallengeProgressGrid
          milestones={challengeProgress.milestones}
          totalResolvedCases={challengeProgress.totalResolvedCases}
          totalTarget={challengeProgress.totalTarget}
          userResolvedPoints={userResolvedPoints}
        />
      </div>

      <div className="relative z-20 grid gap-8 bg-brand-coral px-5 pb-9 pt-4 text-brand-darkblue sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:px-12 lg:pb-11">
        <ProgressLegend />
      </div>
    </section>
  );
}
