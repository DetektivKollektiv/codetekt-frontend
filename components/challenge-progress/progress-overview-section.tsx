import type { ChallengeProgress } from '@/lib/queries/getChallengeProgress';
import { ChallengeHeader } from './challenge-header';
import { ChallengeIllustration } from './challenge-illustration';
import { ChallengeMessageCard } from './challenge-message-card';
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
        descriptionColumnsHtml={challengeProgress.descriptionColumnsHtml}
        displayedDay={displayedDay}
        eyebrow={challengeProgress.eyebrow}
        title={challengeProgress.title}
        totalDays={totalDays}
      />

      <div className="relative h-[26rem]">
        <ChallengeIllustration />
        <ChallengeProgressGrid
          milestones={challengeProgress.milestones}
          totalResolvedCases={challengeProgress.totalResolvedCases}
          totalTarget={challengeProgress.totalTarget}
          trustShares={challengeProgress.trustShares}
          userResolvedPoints={userResolvedPoints}
        />
      </div>

      <div className="relative bg-brand-coral px-5 py-4 text-brand-darkblue sm:px-6 lg:px-12 space-y-8">
        <ProgressLegend />
        {challengeProgress.activeMessage ? (
          <div>
            <h3 className="mb-5 text-heading-lg font-black tracking-normal">
              Streak-News
            </h3>
            <ChallengeMessageCard message={challengeProgress.activeMessage} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
