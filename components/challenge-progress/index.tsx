import { Card, CardContent } from '@/components/ui/card';
import type { ChallengeProgress } from '@/lib/queries/getChallengeProgress';
import { cn } from '@/lib/utils';
import {
  debugChallengeProgress,
  debugUserResolvedPoints,
} from './challenge-progress-debug-data';
import { DailyGoalsSection } from './daily-goals-section';
import { getChallengePeriodState } from './get-challenge-period-state';
import { LeaderboardSection } from './leaderboard-section';
import { ProgressOverviewSection } from './progress-overview-section';

interface ChallengeProgressSectionProps {
  challengeProgress?: ChallengeProgress | null;
  className?: string;
}

export function ChallengeProgressSection({
  challengeProgress,
  className,
}: ChallengeProgressSectionProps) {
  void challengeProgress;

  const visibleChallengeProgress = debugChallengeProgress;
  const periodState = getChallengePeriodState(
    visibleChallengeProgress.startsOn,
    visibleChallengeProgress.endsOn,
  );

  return (
    <Card
      className={cn(
        'relative w-full overflow-hidden border-none bg-brand-coral text-brand-darkblue shadow-md',
        className,
      )}
    >
      <ProgressOverviewSection
        challengeProgress={visibleChallengeProgress}
        displayedDay={periodState.displayedDay}
        totalDays={periodState.totalDays}
        userResolvedPoints={debugUserResolvedPoints}
      />

      <CardContent className="p-5 sm:p-6 lg:p-10">
        <div className="mb-8 h-px bg-brand-darkblue/25 lg:mb-10" />
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <DailyGoalsSection
            completedDayLimit={periodState.completedDayLimit}
            currentDay={periodState.currentDay}
            dailyGoals={visibleChallengeProgress.dailyGoals}
            dailyResolvedCases={
              visibleChallengeProgress.dailyResolvedCases
            }
            endDate={periodState.endDate}
            startDate={periodState.startDate}
          />
          <LeaderboardSection
            leaderboard={visibleChallengeProgress.leaderboard}
          />
        </div>
      </CardContent>
    </Card>
  );
}
