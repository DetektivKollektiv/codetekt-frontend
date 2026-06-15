import type { ChallengeProgress } from '@/lib/queries/getChallengeProgress';
import { format, parseISO } from 'date-fns';
import {
  DailyGoalItem,
  type DailyGoalStatus,
} from './daily-goal-item';
import { DailyGoalLegend } from './daily-goal-legend';

interface DailyGoalsSectionProps {
  completedDayLimit: number;
  currentDay: number | null;
  dailyGoals: ChallengeProgress['dailyGoals'];
  dailyResolvedCases: ChallengeProgress['dailyResolvedCases'];
  endDate: Date;
  startDate: Date;
}

function getDailyGoalStatus(
  resolvedCases: number,
  dailyGoals: ChallengeProgress['dailyGoals'],
): DailyGoalStatus {
  if (resolvedCases >= dailyGoals[2]) return 'third';
  if (resolvedCases >= dailyGoals[1]) return 'second';
  if (resolvedCases >= dailyGoals[0]) return 'first';
  return 'open';
}

export function DailyGoalsSection({
  completedDayLimit,
  currentDay,
  dailyGoals,
  dailyResolvedCases,
  endDate,
  startDate,
}: DailyGoalsSectionProps) {
  return (
    <section>
      <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
          <h3 className="whitespace-nowrap text-heading-lg font-black tracking-normal">
            Tagesziele
          </h3>
          <p className="whitespace-nowrap text-heading-lg font-black tracking-normal text-brand-darkblue/45">
            {format(startDate, 'dd.MM.')} bis {format(endDate, 'dd.MM.')}
          </p>
        </div>
        <DailyGoalLegend dailyGoals={dailyGoals} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2 xl:justify-between">
        {dailyResolvedCases.map((day, index) => {
          const dayNumber = index + 1;
          const isCurrentDay = dayNumber === currentDay;
          const isFutureDay =
            dayNumber > completedDayLimit && !isCurrentDay;

          return (
            <DailyGoalItem
              key={day.date}
              day={dayNumber}
              displayDate={format(parseISO(day.date), 'd.M.')}
              isCompletedDay={dayNumber <= completedDayLimit}
              isCurrentDay={isCurrentDay}
              resolvedCases={day.resolvedCases}
              status={
                isFutureDay
                  ? 'open'
                  : getDailyGoalStatus(day.resolvedCases, dailyGoals)
              }
            />
          );
        })}
      </div>
    </section>
  );
}
