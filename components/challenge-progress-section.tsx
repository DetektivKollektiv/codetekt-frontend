import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ChallengeProgress } from '@/lib/queries/getChallengeProgress';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ChallengeProgressSectionProps {
  challengeProgress: ChallengeProgress;
  className?: string;
}

type DailyGoalStatus = 'open' | 'three' | 'five' | 'ten';

const dailyGoalStatusStyles: Record<DailyGoalStatus, string> = {
  open: 'bg-neutral-500/55',
  three: 'bg-brand-orange',
  five: 'bg-brand-yellow',
  ten: 'bg-brand-green',
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getProgressPercent = (value: number, target: number) => {
  if (target <= 0) return 0;

  return Math.min(Math.round((value / target) * 100), 100);
};

const getSegmentProgressPercent = (value: number, start: number, end: number) =>
  getProgressPercent(Math.max(value - start, 0), end - start);

const getDailyGoalStatus = (
  resolvedCases: number,
  dailyGoals: [number, number, number],
): DailyGoalStatus => {
  if (resolvedCases >= dailyGoals[2]) return 'ten';
  if (resolvedCases >= dailyGoals[1]) return 'five';
  if (resolvedCases >= dailyGoals[0]) return 'three';
  return 'open';
};

const parseDateOnly = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getDayDifference = (startDate: Date, endDate: Date) =>
  Math.floor((endDate.getTime() - startDate.getTime()) / MS_PER_DAY);

const formatDateRangeDate = (date: Date) =>
  `${String(date.getDate()).padStart(2, '0')}.${String(
    date.getMonth() + 1,
  ).padStart(2, '0')}.`;

const formatDotDate = (date: Date) =>
  `${date.getDate()}.${date.getMonth() + 1}`;

const startOfLocalDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getInitials = (username: string) =>
  username
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export function ChallengeProgressSection({
  challengeProgress,
  className,
}: ChallengeProgressSectionProps) {
  const startDate = parseDateOnly(challengeProgress.startsOn);
  const endDate = parseDateOnly(challengeProgress.endsOn);
  const today = startOfLocalDay(new Date());
  const totalDays = Math.max(getDayDifference(startDate, endDate) + 1, 0);
  const daysSinceStart = getDayDifference(startDate, today);
  const isDuringChallenge = daysSinceStart >= 0 && daysSinceStart < totalDays;
  const currentDay = isDuringChallenge ? daysSinceStart + 1 : null;
  const displayedDay =
    currentDay ?? (daysSinceStart < 0 ? 0 : Math.max(totalDays, 0));
  const completedDayLimit =
    currentDay === null
      ? daysSinceStart < 0
        ? 0
        : totalDays
      : currentDay - 1;
  const startDateLabel = formatDateRangeDate(startDate);
  const endDateLabel = formatDateRangeDate(endDate);
  const milestoneSegments = challengeProgress.milestones
    .slice(1)
    .map((milestone, index) => ({
      start: challengeProgress.milestones[index],
      end: milestone,
    }));
  const dailyProgress = challengeProgress.dailyResolvedCases.map(
    (day, index) => {
      const date = parseDateOnly(day.date);

      return {
        day: index + 1,
        displayDate: formatDotDate(date),
        resolvedCases: day.resolvedCases,
      };
    },
  );
  const dailyGoalLegend = [
    { label: `<${challengeProgress.dailyGoals[0]} Fälle`, status: 'open' },
    { label: `${challengeProgress.dailyGoals[0]}+ Fälle`, status: 'three' },
    { label: `${challengeProgress.dailyGoals[1]}+ Fälle`, status: 'five' },
    { label: `${challengeProgress.dailyGoals[2]}+ Fälle`, status: 'ten' },
  ] satisfies { label: string; status: DailyGoalStatus }[];

  return (
    <Card
      className={cn(
        'relative w-full overflow-hidden rounded-lg bg-brand-coral text-brand-darkblue shadow-md',
        className,
      )}
    >
      <CardHeader className="p-5 pb-0 sm:p-6 sm:pb-0 lg:p-10 lg:pb-0">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div>
            <p className="text-meta font-bold uppercase tracking-normal text-brand-darkblue/65">
              {challengeProgress.eyebrow} •{' '}
              <span className="text-brand-darkblue/85">
                Tag {displayedDay} von {totalDays}
              </span>
            </p>
            <CardTitle className="mt-2 text-display-sm uppercase tracking-normal sm:text-display-md">
              {challengeProgress.title}
            </CardTitle>
          </div>
          <div className="lg:text-right">
            <p className="text-meta font-bold uppercase tracking-normal text-brand-darkblue/65">
              FÄLLE GELÖST
            </p>
            <p className="mt-2 text-display-sm font-black leading-none tracking-normal tabular-nums sm:text-display-md">
              {challengeProgress.totalResolvedCases}
              <span className="text-brand-darkblue/45">
                /{challengeProgress.totalTarget}
              </span>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 lg:p-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-body-sm font-black tabular-nums">0</span>
          {milestoneSegments.map((segment) => (
            <div
              key={segment.end}
              className="contents"
              aria-label={`${segment.start} bis ${segment.end} Fälle`}
            >
              <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-brand-darkblue/25">
                <div
                  className="h-full rounded-full bg-brand-darkblue"
                  style={{
                    width: `${getSegmentProgressPercent(
                      challengeProgress.totalResolvedCases,
                      segment.start,
                      segment.end,
                    )}%`,
                  }}
                />
              </div>
              <span className="text-body-sm font-black tabular-nums">
                {segment.end}
              </span>
            </div>
          ))}
        </div>

        <CardDescription className="mt-8 grid gap-5 text-body-md font-semibold text-brand-darkblue/85 md:grid-cols-2 lg:mt-10">
          {challengeProgress.descriptionColumns.map((description) => (
            <p key={description}>{description}</p>
          ))}
        </CardDescription>

        <div className="my-8 h-px bg-brand-darkblue/25 lg:my-10" />

        <div className="grid gap-8 ">
          <section>
            <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                <h3 className="whitespace-nowrap text-heading-lg font-black tracking-normal">
                  Tagesziele
                </h3>
                <p className="whitespace-nowrap text-heading-lg font-black tracking-normal text-brand-darkblue/45">
                  {startDateLabel} bis {endDateLabel}
                </p>
              </div>
              <div className="no-scrollbar flex flex-nowrap gap-4 overflow-x-auto 2xl:justify-end ">
                {dailyGoalLegend.map((item) => (
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
            </div>

            <div className="mt-6 flex flex-wrap gap-2 xl:justify-between">
              {dailyProgress.map((day) => {
                const isCurrentDay = day.day === currentDay;
                const isFutureDay =
                  day.day > completedDayLimit && !isCurrentDay;
                const status = isFutureDay
                  ? 'open'
                  : getDailyGoalStatus(
                      day.resolvedCases,
                      challengeProgress.dailyGoals,
                    );
                const isCompletedDay = day.day <= completedDayLimit;

                return (
                  <div
                    key={day.day}
                    className="flex items-center justify-center"
                  >
                    <span
                      className={cn(
                        'flex size-7 items-center justify-center rounded-full text-[0.625rem] font-black leading-none tabular-nums sm:size-8',
                        dailyGoalStatusStyles[status],
                        isCurrentDay &&
                          'ring-2 ring-brand-darkblue/45 ring-offset-2 ring-offset-brand-coral',
                      )}
                      aria-label={`Tag ${day.day}: ${day.resolvedCases} gelöste Fälle`}
                    >
                      {isCompletedDay && (
                        <Check
                          className="size-3 text-brand-darkblue"
                          aria-hidden="true"
                        />
                      )}
                      {isCurrentDay && day.displayDate}
                      <span className="sr-only">
                        {day.resolvedCases} gelöste Fälle
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="border-t border-brand-darkblue/25 pt-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
              <div>
                <h3 className="text-heading-lg font-black tracking-normal">
                  Tag-Ziele
                </h3>
                <div className="mt-6 flex flex-col gap-6">
                  {challengeProgress.tagGoals.map((goal) => {
                    const progress = getProgressPercent(
                      goal.resolvedCases,
                      goal.target,
                    );

                    return (
                      <div key={goal.tagValue} className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-heading-sm font-black text-brand-darkblue/65">
                            {goal.label}
                          </p>
                          <p className="shrink-0 text-heading-sm font-black tabular-nums">
                            {goal.resolvedCases}
                            <span className="text-brand-darkblue/45">
                              /{goal.target}
                            </span>
                          </p>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-brand-darkblue/25">
                          <div
                            className="h-full rounded-full bg-brand-darkblue"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-brand-darkblue/25 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                <h3 className="text-heading-lg font-black tracking-normal">
                  Leaderboard
                </h3>
                <div className="relative mt-5 max-h-72 overflow-y-auto no-scrollbar">
                  <Table>
                    <TableHeader className="sticky top-0 bg-brand-coral [&_tr>th:first-child]:rounded-tl-md [&_tr>th:last-child]:rounded-tr-md">
                      <TableRow className="border-brand-darkblue/20">
                        <TableHead className="w-9 bg-brand-coral text-brand-darkblue/65">
                          #
                        </TableHead>
                        <TableHead className="bg-brand-coral text-brand-darkblue/65">
                          co:detectives
                        </TableHead>
                        <TableHead className="bg-brand-coral text-right text-brand-darkblue/65">
                          Fälle
                        </TableHead>
                        <TableHead className="bg-brand-coral text-right text-brand-darkblue/65">
                          Tage
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {challengeProgress.leaderboard.length > 0 ? (
                        challengeProgress.leaderboard.map((user, index) => (
                          <TableRow
                            key={user.userId}
                            className="border-brand-darkblue/15"
                          >
                            <TableCell className="font-black tabular-nums">
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="size-8">
                                  <AvatarFallback className="bg-brand-darkblue text-meta font-black text-brand-coral">
                                    {getInitials(user.username)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-bold">
                                  {user.username}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-black tabular-nums">
                              {user.reviewedCases}
                            </TableCell>
                            <TableCell className="text-right font-black tabular-nums text-brand-darkblue/65">
                              {user.activeDays}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow className="border-brand-darkblue/15">
                          <TableCell
                            colSpan={4}
                            className="py-6 text-center font-bold text-brand-darkblue/65"
                          >
                            Noch keine Challenge-Aktivitäten
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <div className="sticky bottom-0 h-6 bg-gradient-to-t from-brand-coral to-brand-coral/0" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
