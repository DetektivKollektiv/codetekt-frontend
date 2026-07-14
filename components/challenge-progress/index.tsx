'use client';

import { Card, CardContent } from '@/components/ui/card';
import { hasSeenChallengeIntroForVisibilityWindow } from '@/lib/challenge-intro';
import type { ChallengeProgress } from '@/lib/queries/getChallengeProgress';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { ChallengeIntroDialog } from './challenge-intro-dialog';
import { DailyGoalsSection } from './daily-goals-section';
import { getChallengePeriodState } from './get-challenge-period-state';
import { LeaderboardSection } from './leaderboard-section';
import { ProgressOverviewSection } from './progress-overview-section';

interface ChallengeProgressSectionProps {
  challengeIntroSeenAt?: string | null;
  challengeProgress?: ChallengeProgress | null;
  className?: string;
}

export function ChallengeProgressSection({
  challengeIntroSeenAt,
  challengeProgress,
  className,
}: ChallengeProgressSectionProps) {
  const shouldShowIntroDialog =
    challengeProgress !== null &&
    challengeProgress !== undefined &&
    challengeIntroSeenAt !== undefined &&
    !hasSeenChallengeIntroForVisibilityWindow({
      seenAt: challengeIntroSeenAt,
      visibleFrom: challengeProgress.visibleFrom,
    });

  const userResolvedPoints = useMemo(
    () => new Set(challengeProgress?.userResolvedPoints ?? []),
    [challengeProgress?.userResolvedPoints],
  );

  if (!challengeProgress) {
    return null;
  }

  const periodState = getChallengePeriodState(
    challengeProgress.startsOn,
    challengeProgress.endsOn,
  );

  return (
    <>
      {shouldShowIntroDialog ? (
        <ChallengeIntroDialog
          key={`${challengeProgress.id}:${challengeProgress.visibleFrom}`}
          intro={challengeProgress.intro}
          visibleFrom={challengeProgress.visibleFrom}
        />
      ) : null}

      <Card
        className={cn(
          'relative w-full overflow-hidden border-none bg-brand-coral text-brand-darkblue shadow-md',
          className,
        )}
      >
        <ProgressOverviewSection
          challengeProgress={challengeProgress}
          displayedDay={periodState.displayedDay}
          totalDays={periodState.totalDays}
          userResolvedPoints={userResolvedPoints}
        />

        <CardContent className="p-5 sm:p-6 lg:p-10 lg:pt-8">
          <div className="mb-8 h-px bg-brand-darkblue/25 lg:mb-10" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-10">
            <div className="flex flex-col gap-8">
              <DailyGoalsSection
                completedDayLimit={periodState.completedDayLimit}
                currentDay={periodState.currentDay}
                dailyGoals={challengeProgress.dailyGoals}
                dailyResolvedCases={challengeProgress.dailyResolvedCases}
                endDate={periodState.endDate}
                startDate={periodState.startDate}
              />
            </div>
            <LeaderboardSection leaderboard={challengeProgress.leaderboard} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
