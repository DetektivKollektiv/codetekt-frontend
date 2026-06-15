import { cn } from '@/lib/utils';
import {
  dailyGoalStatusStyles,
  type DailyGoalStatus,
} from './daily-goal-item';

interface DailyGoalLegendProps {
  dailyGoals: [number, number, number];
}

export function DailyGoalLegend({ dailyGoals }: DailyGoalLegendProps) {
  const items = [
    {
      label: `<${dailyGoals[0]} Fälle`,
      status: 'open',
    },
    {
      label: `${dailyGoals[0]}+ Fälle`,
      status: 'first',
    },
    {
      label: `${dailyGoals[1]}+ Fälle`,
      status: 'second',
    },
    {
      label: `${dailyGoals[2]}+ Fälle`,
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
              'size-3 rounded-full',
              dailyGoalStatusStyles[item.status],
            )}
            aria-hidden="true"
          />
          <span className="whitespace-nowrap text-meta font-bold text-brand-darkblue/65">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
