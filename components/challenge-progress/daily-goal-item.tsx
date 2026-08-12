import { cn } from '@/lib/utils';

export type DailyGoalStatus = 'open' | 'first' | 'second' | 'third';

export const dailyGoalStatusStyles: Record<DailyGoalStatus, string> = {
  open: 'bg-neutral-0/55',
  first: 'bg-brand-darkblue',
  second: 'bg-brand-darkblue',
  third: 'bg-brand-darkblue',
};

export const dailyGoalStatusEmojis: Record<DailyGoalStatus, string> = {
  open: '',
  first: '🔥',
  second: '⭐',
  third: '💎',
};

interface DailyGoalItemProps {
  countdown?: number;
  day: number;
  isCurrentDay: boolean;
  resolvedCases: number;
  status: DailyGoalStatus;
}

export function DailyGoalItem({
  countdown,
  day,
  isCurrentDay,
  resolvedCases,
  status,
}: DailyGoalItemProps) {
  const emoji = dailyGoalStatusEmojis[status];

  return (
    <div className="flex items-center justify-center">
      <span
        className={cn(
          'flex size-7 items-center justify-center rounded-full text-[0.875rem] font-black leading-none sm:size-8 sm:text-[1rem]',
          dailyGoalStatusStyles[status],
          countdown !== undefined &&
            'border border-neutral-0 bg-transparent text-neutral-0',
          isCurrentDay &&
            'ring-2 ring-brand-darkblue/45 ring-offset-2 ring-offset-brand-coral',
        )}
        aria-label={`Tag ${day}: ${resolvedCases} gelöste Fälle`}
      >
        {emoji ? (
          <span aria-hidden="true">{emoji}</span>
        ) : countdown ? (
          <span aria-hidden="true">{countdown}</span>
        ) : null}
        <span className="sr-only">{resolvedCases} gelöste Fälle</span>
      </span>
    </div>
  );
}
