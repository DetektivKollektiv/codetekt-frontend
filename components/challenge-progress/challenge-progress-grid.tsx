import type { CSSProperties } from 'react';

import type { ChallengeProgress } from '@/lib/queries/getChallengeProgress';
import { cn } from '@/lib/utils';
import { ChallengeCompletedMarker } from './challenge-completed-marker';
import { MilestoneMarker } from './milestone-marker';
import { ProgressLegend } from './progress-legend';
import { TrustSharesCounter } from './trust-shares-counter';

const CHALLENGE_GRID_ROW_COUNTS = {
  mobile: 5,
  tablet: 5,
  desktop: 5,
} as const;
const CHALLENGE_GRID_COLUMN_GAP = 'clamp(0.25rem, 0.55vw, 0.5rem)';

interface ChallengeProgressGridProps {
  milestones: ChallengeProgress['milestones'];
  totalResolvedCases: number;
  totalTarget: number;
  trustShares: {
    count: number;
    description: string;
    title: string;
  };
  userResolvedPoints: ReadonlySet<number>;
}

export function ChallengeProgressGrid({
  milestones,
  totalResolvedCases,
  totalTarget,
  trustShares,
  userResolvedPoints,
}: ChallengeProgressGridProps) {
  const isChallengeCompleted = totalResolvedCases >= totalTarget;
  const markerMilestones = milestones.slice(1);
  const currentMilestone = markerMilestones.reduce<
    ChallengeProgress['milestones'][number] | null
  >(
    (current, milestone) =>
      totalResolvedCases >= milestone.value ? milestone : current,
    null,
  );
  const challengeGridDesktopColumns = Math.ceil(
    totalTarget / CHALLENGE_GRID_ROW_COUNTS.desktop,
  );
  const challengeGridMobileColumns = Math.ceil(
    totalTarget / CHALLENGE_GRID_ROW_COUNTS.mobile,
  );
  const challengeGridTabletColumns = Math.ceil(
    totalTarget / CHALLENGE_GRID_ROW_COUNTS.tablet,
  );
  const progressPoints = Array.from(
    { length: totalTarget },
    (_, index) => index + 1,
  );

  return (
    <div className="absolute inset-x-5 bottom-7 z-20 sm:inset-x-6 lg:inset-x-12">
      <div className="grid items-end gap-16 md:grid-cols-2 md:gap-0">
        <div className="min-w-0">
          <div className="relative">
            <div
              className="absolute inset-0 z-0 hidden md:grid"
              style={{
                columnGap: CHALLENGE_GRID_COLUMN_GAP,
                gridTemplateColumns: `repeat(${challengeGridDesktopColumns}, minmax(0, 1fr))`,
              }}
            >
              {markerMilestones.map((milestone) => (
                <MilestoneMarker
                  key={milestone.value}
                  achieved={totalResolvedCases >= milestone.value}
                  column={Math.ceil(
                    milestone.value / CHALLENGE_GRID_ROW_COUNTS.desktop,
                  )}
                  columnGap={CHALLENGE_GRID_COLUMN_GAP}
                  milestone={milestone}
                />
              ))}
            </div>

            {isChallengeCompleted ? (
              <div className="absolute inset-0 z-20">
                <ChallengeCompletedMarker
                  resolvedCases={totalResolvedCases}
                  totalTarget={totalTarget}
                />
              </div>
            ) : currentMilestone ? (
              <div className="absolute inset-0 z-20 sm:hidden">
                <MilestoneMarker
                  achieved
                  milestone={currentMilestone}
                  variant="centered"
                />
              </div>
            ) : null}

            <div
              className="relative z-10 grid grid-flow-col gap-y-[clamp(0.4rem,0.75vw,0.7rem)] [grid-template-columns:repeat(var(--challenge-grid-mobile-columns),minmax(0,1fr))] [grid-template-rows:repeat(var(--challenge-grid-mobile-rows),minmax(0,1fr))] sm:[grid-template-columns:repeat(var(--challenge-grid-tablet-columns),minmax(0,1fr))] sm:[grid-template-rows:repeat(var(--challenge-grid-tablet-rows),minmax(0,1fr))] xl:[grid-template-columns:repeat(var(--challenge-grid-desktop-columns),minmax(0,1fr))] xl:[grid-template-rows:repeat(var(--challenge-grid-desktop-rows),minmax(0,1fr))]"
              style={
                {
                  columnGap: CHALLENGE_GRID_COLUMN_GAP,
                  '--challenge-grid-desktop-columns':
                    challengeGridDesktopColumns,
                  '--challenge-grid-mobile-columns':
                    challengeGridMobileColumns,
                  '--challenge-grid-tablet-columns':
                    challengeGridTabletColumns,
                  '--challenge-grid-desktop-rows':
                    CHALLENGE_GRID_ROW_COUNTS.desktop,
                  '--challenge-grid-mobile-rows':
                    CHALLENGE_GRID_ROW_COUNTS.mobile,
                  '--challenge-grid-tablet-rows':
                    CHALLENGE_GRID_ROW_COUNTS.tablet,
                } as CSSProperties
              }
              role="progressbar"
              aria-label={`${totalResolvedCases} von ${totalTarget} Fällen gelöst`}
              aria-valuemin={0}
              aria-valuemax={totalTarget}
              aria-valuenow={totalResolvedCases}
            >
              {progressPoints.map((point) => {
                const isResolved = point <= totalResolvedCases;
                const isResolvedByUser =
                  isResolved && userResolvedPoints.has(point);

                return (
                  <span
                    key={point}
                    className={cn(
                      'aspect-square w-full rounded-full',
                      isResolvedByUser
                        ? 'bg-brand-green'
                        : isResolved
                          ? 'bg-brand-purple-dark'
                          : 'border border-neutral-0 bg-transparent',
                    )}
                    aria-hidden="true"
                  />
                );
              })}
            </div>
          </div>
          <div className="mt-5 md:hidden">
            <ProgressLegend />
          </div>
        </div>
        <TrustSharesCounter {...trustShares} />
      </div>
    </div>
  );
}
