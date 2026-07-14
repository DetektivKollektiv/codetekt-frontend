import { cn } from '@/lib/utils';
import {
  dailyGoalStatusEmojis,
  dailyGoalStatusStyles,
  type DailyGoalStatus,
} from './daily-goal-item';

interface DailyGoalLegendProps {
  dailyGoals: [number, number, number];
}

export function DailyGoalLegend({ dailyGoals }: DailyGoalLegendProps) {
  const items = [
    {
      label: `ab ${dailyGoals[0]} Fall`,
      status: 'first',
    },
    {
      label: `ab ${dailyGoals[1]} Fällen`,
      status: 'second',
    },
    {
      label: `ab ${dailyGoals[2]} Fällen`,
      status: 'third',
    },
  ] satisfies { label: string; status: DailyGoalStatus }[];

  return (
    <div className="no-scrollbar flex flex-nowrap gap-4 overflow-x-auto 2xl:justify-end">
      {items.map((item) => (
        <div
          key={item.status}
          className="flex shrink-0 items-center gap-2"
        >
          <span
            className={cn(
              'flex size-5 items-center justify-center rounded-full text-[0.7rem] leading-none',
              dailyGoalStatusStyles[item.status],
            )}
            aria-hidden="true"
          >
            {dailyGoalStatusEmojis[item.status]}
          </span>
          <span className="whitespace-nowrap text-meta font-bold text-brand-darkblue/65">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
