import { cn } from '@/lib/utils';
import { MilestoneLabel } from './milestone-label';

interface MilestoneMarkerProps {
  achieved: boolean;
  column: number;
  columnGap: string;
  isFinalMilestone: boolean;
  milestone: number;
}

export function MilestoneMarker({
  achieved,
  column,
  columnGap,
  isFinalMilestone,
  milestone,
}: MilestoneMarkerProps) {
  return (
    <div
      className="relative h-0 w-0 self-end justify-self-end"
      data-milestone={milestone}
      style={{
        gridColumn: column,
        gridRow: 1,
        transform: isFinalMilestone
          ? undefined
          : `translateX(calc(${columnGap} / 2))`,
      }}
    >
      <div className="absolute bottom-[-0.25rem] left-1/2 flex h-56 -translate-x-1/2 flex-col items-center lg:h-64 xl:h-[18rem]">
        <MilestoneLabel
          achieved={achieved}
          milestone={milestone}
          className={cn(isFinalMilestone && '-translate-x-1/3')}
        />
        <span
          className={cn(
            'mt-2 w-0.5 flex-1 rounded-full',
            achieved ? 'bg-brand-coral' : 'bg-neutral-0/35',
            isFinalMilestone && 'hidden',
          )}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
