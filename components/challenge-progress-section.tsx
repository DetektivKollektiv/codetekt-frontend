import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
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
import Image from 'next/image';

interface ChallengeProgressSectionProps {
  challengeProgress?: ChallengeProgress | null;
  className?: string;
}

type DailyGoalStatus = 'open' | 'three' | 'five' | 'ten';

const dailyGoalStatusStyles: Record<DailyGoalStatus, string> = {
  open: 'bg-neutral-500/55',
  three: 'bg-brand-orange',
  five: 'bg-brand-yellow',
  ten: 'bg-brand-green',
};

const CHALLENGE_GRID_ROWS = 5;
const screenshotUserResolvedPoints = new Set([27, 52, 54, 73]);

const challengePeople = [
  {
    src: '/images/community_challenge/Person_1.svg',
    width: 366,
    height: 576,
    className: 'h-[25rem]',
  },
  {
    src: '/images/community_challenge/Person_2.svg',
    width: 448,
    height: 628,
    className: 'h-[27rem]',
  },
  {
    src: '/images/community_challenge/Person_3.svg',
    width: 335,
    height: 553,
    className: 'h-[25rem]',
  },
  {
    src: '/images/community_challenge/Person_4.svg',
    width: 448,
    height: 600,
    className: 'h-[26rem]',
  },
] as const;

const milestoneBurstClipPath =
  'polygon(50% 0%, 58% 10%, 70% 4%, 73% 18%, 86% 15%, 85% 30%, 98% 35%, 89% 46%, 100% 56%, 87% 64%, 94% 78%, 79% 79%, 78% 94%, 64% 88%, 54% 100%, 46% 89%, 32% 97%, 28% 83%, 14% 85%, 16% 70%, 2% 65%, 11% 54%, 0% 44%, 13% 36%, 6% 22%, 21% 21%, 22% 6%, 36% 12%)';

const screenshotChallengeProgress: ChallengeProgress = {
  id: 'screenshot-challenge',
  eyebrow: 'Landtagswahlen 2026',
  title: 'Community Challenge',
  startsOn: '2026-05-21',
  endsOn: '2026-06-14',
  totalResolvedCases: 126,
  totalTarget: 200,
  milestones: [0, 50, 100, 150, 200],
  dailyGoals: [3, 5, 10],
  descriptionColumns: [
    'In der Community Challenge wollen wir gemeinsam 200 Fälle lösen und jeden Tag neue Tagesziele erreichen.',
    'Zusätzlich zählen Ziele für bestimmte Tags. Das Leaderboard zeigt die aktivsten co:detectives, der erste Platz bekommt ein Geschenk.',
  ],
  dailyResolvedCases: [
    { date: '2026-05-21', resolvedCases: 6 },
    { date: '2026-05-22', resolvedCases: 8 },
    { date: '2026-05-23', resolvedCases: 5 },
    { date: '2026-05-24', resolvedCases: 12 },
    { date: '2026-05-25', resolvedCases: 7 },
    { date: '2026-05-26', resolvedCases: 11 },
    { date: '2026-05-27', resolvedCases: 13 },
    { date: '2026-05-28', resolvedCases: 5 },
    { date: '2026-05-29', resolvedCases: 10 },
    { date: '2026-05-30', resolvedCases: 12 },
    { date: '2026-05-31', resolvedCases: 9 },
    { date: '2026-06-01', resolvedCases: 14 },
    { date: '2026-06-02', resolvedCases: 0 },
    { date: '2026-06-03', resolvedCases: 0 },
    { date: '2026-06-04', resolvedCases: 0 },
    { date: '2026-06-05', resolvedCases: 0 },
    { date: '2026-06-06', resolvedCases: 0 },
    { date: '2026-06-07', resolvedCases: 0 },
    { date: '2026-06-08', resolvedCases: 0 },
    { date: '2026-06-09', resolvedCases: 0 },
    { date: '2026-06-10', resolvedCases: 0 },
    { date: '2026-06-11', resolvedCases: 0 },
    { date: '2026-06-12', resolvedCases: 0 },
    { date: '2026-06-13', resolvedCases: 0 },
    { date: '2026-06-14', resolvedCases: 0 },
  ],
  tagGoals: [
    {
      label: 'Landtagswahl 2026',
      resolvedCases: 13,
      tagValue: 'Landtagswahl 2026',
      target: 12,
    },
    {
      label: 'KI-Fakes',
      resolvedCases: 11,
      tagValue: 'KI-Fakes',
      target: 12,
    },
    {
      label: 'Demokratie',
      resolvedCases: 7,
      tagValue: 'Demokratie',
      target: 12,
    },
  ],
  leaderboard: [
    {
      userId: 'screenshot-user-1',
      username: 'Ada',
      reviewedCases: 34,
      activeDays: 10,
    },
    {
      userId: 'screenshot-user-2',
      username: 'Mika',
      reviewedCases: 29,
      activeDays: 9,
    },
    {
      userId: 'screenshot-user-3',
      username: 'Noor',
      reviewedCases: 24,
      activeDays: 8,
    },
    {
      userId: 'screenshot-user-4',
      username: 'Leonie',
      reviewedCases: 21,
      activeDays: 7,
    },
    {
      userId: 'screenshot-user-5',
      username: 'Samir',
      reviewedCases: 18,
      activeDays: 6,
    },
  ],
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getProgressPercent = (value: number, target: number) => {
  if (target <= 0) return 0;

  return Math.min(Math.round((value / target) * 100), 100);
};

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

function MilestoneLabel({
  achieved,
  milestone,
}: {
  achieved: boolean;
  milestone: number;
}) {
  const label = (
    <>
      <span className="text-[1.75rem] font-black leading-none tabular-nums">
        {milestone}
      </span>
      <span className="mt-1 text-meta font-black uppercase leading-none">
        Fälle
      </span>
    </>
  );

  if (!achieved) {
    return (
      <div className="flex size-[5.5rem] flex-col items-center justify-center text-neutral-0">
        {label}
      </div>
    );
  }

  return (
    <div
      className="flex size-[5.5rem] items-center justify-center bg-brand-yellow"
      style={{ clipPath: milestoneBurstClipPath }}
    >
      <div className="flex size-[4.25rem] flex-col items-center justify-center rounded-full bg-brand-darkblue text-neutral-0">
        {label}
      </div>
    </div>
  );
}

export function ChallengeProgressSection({
  challengeProgress,
  className,
}: ChallengeProgressSectionProps) {
  void challengeProgress;

  const visibleChallengeProgress = screenshotChallengeProgress;
  const startDate = parseDateOnly(visibleChallengeProgress.startsOn);
  const endDate = parseDateOnly(visibleChallengeProgress.endsOn);
  const today = startOfLocalDay(new Date());
  const totalDays = Math.max(getDayDifference(startDate, endDate) + 1, 0);
  const daysSinceStart = getDayDifference(startDate, today);
  const isDuringChallenge = daysSinceStart >= 0 && daysSinceStart < totalDays;
  const currentDay = isDuringChallenge ? daysSinceStart + 1 : null;
  const displayedDay =
    currentDay ?? (daysSinceStart < 0 ? 0 : Math.max(totalDays, 0));
  const completedDayLimit =
    currentDay === null ? (daysSinceStart < 0 ? 0 : totalDays) : currentDay - 1;
  const startDateLabel = formatDateRangeDate(startDate);
  const endDateLabel = formatDateRangeDate(endDate);
  const progressPoints = Array.from(
    { length: visibleChallengeProgress.totalTarget },
    (_, index) => index + 1,
  );
  const dailyProgress = visibleChallengeProgress.dailyResolvedCases.map(
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
    {
      label: `<${visibleChallengeProgress.dailyGoals[0]} Fälle`,
      status: 'open',
    },
    {
      label: `${visibleChallengeProgress.dailyGoals[0]}+ Fälle`,
      status: 'three',
    },
    {
      label: `${visibleChallengeProgress.dailyGoals[1]}+ Fälle`,
      status: 'five',
    },
    {
      label: `${visibleChallengeProgress.dailyGoals[2]}+ Fälle`,
      status: 'ten',
    },
  ] satisfies { label: string; status: DailyGoalStatus }[];

  return (
    <Card
      className={cn(
        'relative w-full overflow-hidden rounded-[1.75rem] border-none bg-brand-coral text-brand-darkblue shadow-md',
        className,
      )}
    >
      <section className="relative overflow-hidden bg-brand-darkblue text-neutral-0">
        <div className="relative z-30 px-5 pb-8 pt-8 sm:px-6 lg:px-12 lg:pb-10 lg:pt-12">
          <div className="flex items-start justify-between gap-8">
            <div>
              <p className="text-display-eyebrow uppercase text-neutral-0/70">
                Community Challenge zu den {visibleChallengeProgress.eyebrow}
              </p>
              <h2 className="mt-2 text-display-sm uppercase sm:text-display-md 2xl:text-display-lg">
                Gemeinsam zur {visibleChallengeProgress.totalTarget}
              </h2>
            </div>
            <div className="shrink-0 rounded-2xl bg-neutral-0 px-4 py-2 text-heading-sm font-black leading-none text-brand-darkblue">
              Tag <span className="tabular-nums">{displayedDay}</span>
              <span className="text-brand-darkblue/45">
                /<span className="tabular-nums">{totalDays}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="relative h-[31rem]">
          <div
            className="absolute inset-x-8 bottom-0 top-0 z-0 grid grid-cols-4 items-end lg:inset-x-12"
            aria-hidden="true"
          >
            {challengePeople.map((person) => (
              <div
                key={person.src}
                className="flex h-full items-end justify-center"
              >
                <Image
                  src={person.src}
                  alt=""
                  width={person.width}
                  height={person.height}
                  sizes="(min-width: 1024px) 20vw, 15rem"
                  className={cn(
                    'w-auto max-w-none object-contain object-bottom',
                    person.className,
                  )}
                />
              </div>
            ))}
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background:
                'linear-gradient(180deg, hsl(var(--brand-yellow) / 0) 0%, hsl(var(--brand-coral) / 0.5) 55%, hsl(var(--brand-coral)) 100%)',
            }}
            aria-hidden="true"
          />

          <div className="absolute inset-x-5 bottom-7 z-20 sm:inset-x-6 lg:inset-x-12">
            <div className="absolute inset-0 z-0">
              {visibleChallengeProgress.milestones.slice(1).map((milestone) => {
                const achieved =
                  visibleChallengeProgress.totalResolvedCases >= milestone;

                return (
                  <div
                    key={milestone}
                    className="absolute bottom-[-0.25rem] flex h-[17rem] -translate-x-1/2 flex-col items-center"
                    style={{
                      left: `${getProgressPercent(
                        milestone,
                        visibleChallengeProgress.totalTarget,
                      )}%`,
                    }}
                  >
                    <MilestoneLabel achieved={achieved} milestone={milestone} />
                    <span
                      className={cn(
                        'mt-2 w-1 flex-1 rounded-full',
                        achieved ? 'bg-brand-yellow' : 'bg-neutral-0/35',
                      )}
                      aria-hidden="true"
                    />
                  </div>
                );
              })}
            </div>

            <div
              className="relative z-10 grid grid-flow-col gap-x-[clamp(0.25rem,0.55vw,0.5rem)] gap-y-[clamp(0.4rem,0.75vw,0.7rem)]"
              style={{
                gridTemplateColumns: `repeat(${Math.ceil(
                  visibleChallengeProgress.totalTarget / CHALLENGE_GRID_ROWS,
                )}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${CHALLENGE_GRID_ROWS}, minmax(0, 1fr))`,
              }}
              role="progressbar"
              aria-label={`${visibleChallengeProgress.totalResolvedCases} von ${visibleChallengeProgress.totalTarget} Fällen gelöst`}
              aria-valuemin={0}
              aria-valuemax={visibleChallengeProgress.totalTarget}
              aria-valuenow={visibleChallengeProgress.totalResolvedCases}
            >
              {progressPoints.map((point) => {
                const isResolved =
                  point <= visibleChallengeProgress.totalResolvedCases;
                const isResolvedByUser =
                  isResolved && screenshotUserResolvedPoints.has(point);

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
        </div>

        <div className="relative z-20 grid gap-8 bg-brand-coral px-5 pb-9 pt-4 text-brand-darkblue sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:px-12 lg:pb-11">
          <p className="max-w-xl text-body-md text-brand-darkblue/80">
            Löst gemeinsam {visibleChallengeProgress.totalTarget} Fälle,
            erreicht tägliche Ziele und kämpft um die Spitze des Leaderboards.
            Der erste Platz wird belohnt.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {[
              {
                label: 'Von dir gelöst',
                className: 'bg-brand-green',
              },
              {
                label: 'Gelöst',
                className: 'bg-brand-purple-dark',
              },
              {
                label: 'Ungelöst',
                className: 'bg-neutral-0/55',
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className={cn(
                    'size-[clamp(1rem,1.6vw,1.3rem)] rounded-full',
                    item.className,
                  )}
                  aria-hidden="true"
                />
                <span className="whitespace-nowrap text-body-sm font-bold">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CardContent className="p-5 sm:p-6 lg:p-10">
        <div className="mb-8 h-px bg-brand-darkblue/25 lg:mb-10" />
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
                      visibleChallengeProgress.dailyGoals,
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
                  {visibleChallengeProgress.tagGoals.map((goal) => {
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
                      {visibleChallengeProgress.leaderboard.length > 0 ? (
                        visibleChallengeProgress.leaderboard.map(
                          (user, index) => (
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
                          ),
                        )
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
