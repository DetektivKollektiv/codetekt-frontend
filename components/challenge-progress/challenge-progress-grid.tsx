import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';
import { MilestoneMarker } from './milestone-marker';

const CHALLENGE_GRID_ROW_COUNTS = {
  mobile: 10,
  tablet: 5,
  desktop: 5,
} as const;
const CHALLENGE_GRID_COLUMN_GAP = 'clamp(0.25rem, 0.55vw, 0.5rem)';

interface ChallengeProgressGridProps {
  milestones: number[];
  totalResolvedCases: number;
  totalTarget: number;
  userResolvedPoints: ReadonlySet<number>;
}

export function ChallengeProgressGrid({
  milestones,
  totalResolvedCases,
  totalTarget,
  userResolvedPoints,
}: ChallengeProgressGridProps) {
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
      <div
        className="absolute inset-0 z-0 grid"
        style={{
          columnGap: CHALLENGE_GRID_COLUMN_GAP,
          gridTemplateColumns: `repeat(${challengeGridDesktopColumns}, minmax(0, 1fr))`,
        }}
      >
        {milestones.slice(1).map((milestone) => (
          <MilestoneMarker
            key={milestone}
            achieved={totalResolvedCases >= milestone}
            column={Math.ceil(milestone / CHALLENGE_GRID_ROW_COUNTS.desktop)}
            columnGap={CHALLENGE_GRID_COLUMN_GAP}
            isFinalMilestone={milestone === totalTarget}
            milestone={milestone}
          />
        ))}
      </div>

      <div
        className="relative z-10 grid grid-flow-col gap-y-[clamp(0.4rem,0.75vw,0.7rem)] [grid-template-columns:repeat(var(--challenge-grid-mobile-columns),minmax(0,1fr))] [grid-template-rows:repeat(var(--challenge-grid-mobile-rows),minmax(0,1fr))] sm:[grid-template-columns:repeat(var(--challenge-grid-tablet-columns),minmax(0,1fr))] sm:[grid-template-rows:repeat(var(--challenge-grid-tablet-rows),minmax(0,1fr))] xl:[grid-template-columns:repeat(var(--challenge-grid-desktop-columns),minmax(0,1fr))] xl:[grid-template-rows:repeat(var(--challenge-grid-desktop-rows),minmax(0,1fr))]"
        style={
          {
            columnGap: CHALLENGE_GRID_COLUMN_GAP,
            '--challenge-grid-desktop-columns': challengeGridDesktopColumns,
            '--challenge-grid-mobile-columns': challengeGridMobileColumns,
            '--challenge-grid-tablet-columns': challengeGridTabletColumns,
            '--challenge-grid-desktop-rows': CHALLENGE_GRID_ROW_COUNTS.desktop,
            '--challenge-grid-mobile-rows': CHALLENGE_GRID_ROW_COUNTS.mobile,
            '--challenge-grid-tablet-rows': CHALLENGE_GRID_ROW_COUNTS.tablet,
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
          const isResolvedByUser = isResolved && userResolvedPoints.has(point);

          return (
            <span
              key={point}
              className={cn(
                'aspect-square w-full rounded-full',
                isResolvedByUser
                  ? 'bg-brand-green'
                  : isResolved
                    ? 'bg-brand-purple-dark'
                    : 'bg-neutral-0/55',
              )}
              aria-hidden="true"
            />
          );
        })}
      </div>
    </div>
  );
}
