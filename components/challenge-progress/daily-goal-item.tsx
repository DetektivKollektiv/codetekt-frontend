import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export type DailyGoalStatus = 'open' | 'first' | 'second' | 'third';

export const dailyGoalStatusStyles: Record<DailyGoalStatus, string> = {
  open: 'bg-neutral-500/55',
  first: 'bg-brand-orange',
  second: 'bg-brand-yellow',
  third: 'bg-brand-green',
};

interface DailyGoalItemProps {
  day: number;
  displayDate: string;
  isCompletedDay: boolean;
  isCurrentDay: boolean;
  resolvedCases: number;
  status: DailyGoalStatus;
}

export function DailyGoalItem({
  day,
  displayDate,
  isCompletedDay,
  isCurrentDay,
  resolvedCases,
  status,
}: DailyGoalItemProps) {
  return (
    <div className="flex items-center justify-center">
      <span
        className={cn(
          'flex size-7 items-center justify-center rounded-full text-[0.625rem] font-black leading-none tabular-nums sm:size-8',
          dailyGoalStatusStyles[status],
          isCurrentDay &&
            'ring-2 ring-brand-darkblue/45 ring-offset-2 ring-offset-brand-coral',
        )}
        aria-label={`Tag ${day}: ${resolvedCases} gelöste Fälle`}
      >
        {isCompletedDay ? (
          <Check
            className="size-3 text-brand-darkblue"
            aria-hidden="true"
          />
        ) : null}
        {isCurrentDay ? displayDate : null}
        <span className="sr-only">{resolvedCases} gelöste Fälle</span>
      </span>
    </div>
  );
}
