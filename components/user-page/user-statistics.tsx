'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Leaderboard } from '@/lib/queries/getLeaderboard';
import { UserCases } from '@/lib/queries/getUserCases';
import { UserReviewAnswersSubmitted } from '@/lib/queries/getUserReviewAnswers';
import { getShortUsername } from '@/lib/utils/get-short-username';
import { FC, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

const MAX_VISIBLE_DAYS = 30;

interface UserStatisticsProps {
  leaderboard: Leaderboard;
  userCases: UserCases;
  userReviewAnswersSubmitted: UserReviewAnswersSubmitted;
}

const getMilestoneName = (count: number): string => {
  if (count >= 100) return 'Meisterdetektiv';
  if (count >= 50) return 'Experte';
  if (count >= 25) return 'Fortgeschritten';
  if (count >= 10) return 'Erfahren';
  return 'Anfänger';
};

const getNextMilestone = (
  currentCount: number,
): { name: string; threshold: number } | null => {
  if (currentCount < 10) return { name: 'Erfahren', threshold: 10 };
  if (currentCount < 25) return { name: 'Fortgeschritten', threshold: 25 };
  if (currentCount < 50) return { name: 'Experte', threshold: 50 };
  if (currentCount < 100) return { name: 'Meisterdetektiv', threshold: 100 };
  return null;
};

const toDayKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromDayKey = (dayKey: string): Date => {
  const [year, month, day] = dayKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const UserStatistics: FC<UserStatisticsProps> = ({
  leaderboard,
  userCases,
  userReviewAnswersSubmitted,
}) => {
  const chartData = useMemo(() => {
    // Combine all activities with dates
    const activities: { date: Date; type: 'case' | 'review' }[] = [];

    // Add submitted cases
    userCases.forEach((item) => {
      if ('submitted_at' in item && item.submitted_at) {
        activities.push({
          date: new Date(item.submitted_at),
          type: 'case',
        });
      }
    });

    // Add reviews
    userReviewAnswersSubmitted.forEach((review) => {
      if (review.submitted_at) {
        activities.push({
          date: new Date(review.submitted_at),
          type: 'review',
        });
      }
    });

    // Sort by date
    activities.sort((a, b) => a.date.getTime() - b.date.getTime());

    if (activities.length === 0) {
      return [];
    }

    // Group by day and calculate cumulative totals for each type
    const dailyData: Record<
      string,
      {
        day: string;
        cases: number;
        reviews: number;
        displayDay: string;
        hasCaseEvent: boolean;
        hasReviewEvent: boolean;
      }
    > = {};

    const dailyIncrements: Record<string, { cases: number; reviews: number }> =
      {};

    activities.forEach((activity) => {
      const dayKey = toDayKey(activity.date);
      if (!dailyIncrements[dayKey]) {
        dailyIncrements[dayKey] = { cases: 0, reviews: 0 };
      }

      if (activity.type === 'case') {
        dailyIncrements[dayKey].cases += 1;
      } else {
        dailyIncrements[dayKey].reviews += 1;
      }
    });

    let cumulativeCases = 0;
    let cumulativeReviews = 0;

    const firstDate = startOfDay(activities[0].date);
    const today = startOfDay(new Date());
    const lastActivityDate = startOfDay(activities[activities.length - 1].date);
    const lastDate =
      lastActivityDate.getTime() > today.getTime() ? lastActivityDate : today;

    for (
      let currentDate = new Date(firstDate);
      currentDate <= lastDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const dayDate = new Date(currentDate);
      const dayKey = toDayKey(dayDate);
      const displayDay = dayDate.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
      });

      cumulativeCases += dailyIncrements[dayKey]?.cases ?? 0;
      cumulativeReviews += dailyIncrements[dayKey]?.reviews ?? 0;

      dailyData[dayKey] = {
        day: dayKey,
        displayDay,
        cases: cumulativeCases,
        reviews: cumulativeReviews,
        hasCaseEvent: (dailyIncrements[dayKey]?.cases ?? 0) > 0,
        hasReviewEvent: (dailyIncrements[dayKey]?.reviews ?? 0) > 0,
      };
    }

    // Return all days between first activity and today, limited to the latest visible range
    const allDays = Object.values(dailyData);
    const visibleDays = allDays.slice(-MAX_VISIBLE_DAYS);

    const firstVisibleDay = visibleDays[0];
    if (!firstVisibleDay) {
      return visibleDays;
    }

    const baselineDate = fromDayKey(firstVisibleDay.day);
    baselineDate.setDate(baselineDate.getDate() - 1);
    const firstVisibleIncrements = dailyIncrements[firstVisibleDay.day] ?? {
      cases: 0,
      reviews: 0,
    };

    const baselineDay = {
      day: toDayKey(baselineDate),
      displayDay: baselineDate.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
      }),
      cases: firstVisibleDay.cases - firstVisibleIncrements.cases,
      reviews: firstVisibleDay.reviews - firstVisibleIncrements.reviews,
      hasCaseEvent: false,
      hasReviewEvent: false,
    };

    return [baselineDay, ...visibleDays];
  }, [userCases, userReviewAnswersSubmitted]);

  const totalCases = userCases.length;
  const totalReviews = userReviewAnswersSubmitted.length;
  const totalActivities = totalCases + totalReviews;
  const currentMilestone = getMilestoneName(totalActivities);
  const nextMilestone = getNextMilestone(totalActivities);
  const activitiesUntilNext = nextMilestone
    ? nextMilestone.threshold - totalActivities
    : 0;

  const chartConfig = {
    cases: {
      label: 'Eingereichte Fälle',
      color: 'hsl(var(--brand-coral))',
    },
    reviews: {
      label: 'Bewertete Fälle',
      color: 'hsl(var(--brand-yellow))',
    },
  } satisfies ChartConfig;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Cell 1 — Stage + Numbers */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] lg:grid-cols-1 xl:grid-cols-[1fr_auto] items-start">
          {/* Left side - Title and current level */}
          <div className="p-4 border-b h-full">
            {nextMilestone && (
              <div className="flex space-x-1">
                <p className="text-muted-foreground text-body-sm">
                  Noch <b className="text-foreground">{activitiesUntilNext}</b>{' '}
                  Fälle für{' '}
                  <b className="text-foreground">{nextMilestone.name}</b>
                </p>
              </div>
            )}
            <p className="text-display-sm">
              <span className="font-bold text-foreground">
                {currentMilestone}
              </span>
            </p>
          </div>

          {/* Right side - Big numbers */}
          <div className="grid grid-cols-2 bg-muted h-full">
            <div className="text-left border-l border-b p-5">
              <div className="text-muted-foreground text-sm mb-1 whitespace-nowrap">
                Eingereichte Fälle
              </div>
              <div className="text-display-lg md:text-5xl font-bold tabular-nums text-brand-coral">
                {totalCases}
              </div>
            </div>
            <div className="text-left border-l border-b p-5">
              <div className="text-muted-foreground text-sm mb-1">
                Bewertete Fälle
              </div>
              <div className="text-display-lg md:text-5xl font-bold tabular-nums">
                {totalReviews}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Cell 2 — Empty (desktop only) */}
      <div className="hidden lg:block" />

      {/* Cell 3 — Aktivitätsverlauf */}
      <Card className="flex flex-col">
        <CardContent className="pt-6 flex flex-col flex-1">
          <h3 className="text-heading-md text-muted-foreground font-semibold mb-6">
            Einreichungen & Bewertungen
          </h3>
          {chartData.length > 0 ? (
            <ChartContainer
              config={chartConfig}
              className="min-h-40 lg:min-h-80 max-h-60 lg:max-h-96 w-full focus:outline-none overflow-visible"
            >
              <AreaChart
                className="focus:outline-none overflow-visible"
                accessibilityLayer
                data={chartData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="displayDay"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  angle={0}
                  interval={0}
                  tick={{ className: 'text-xs fill-muted-foreground' }}
                  tickFormatter={(value, index) =>
                    index === 0 || index === chartData.length - 1 ? value : ''
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <defs>
                  <linearGradient id="fillCases" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-cases)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-cases)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillReviews" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-reviews)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-reviews)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="cases"
                  type="monotoneX"
                  fill="url(#fillCases)"
                  fillOpacity={0.4}
                  stroke="var(--color-cases)"
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const pointKey = `case-dot-${payload?.day ?? `${cx}-${cy}`}`;

                    if (!payload?.hasCaseEvent) {
                      return <g key={pointKey} />;
                    }

                    return (
                      <circle
                        key={pointKey}
                        cx={cx}
                        cy={cy}
                        r={3}
                        fill="var(--color-cases)"
                      />
                    );
                  }}
                />
                <Area
                  dataKey="reviews"
                  type="monotoneX"
                  fill="url(#fillReviews)"
                  fillOpacity={0.4}
                  stroke="var(--color-reviews)"
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const pointKey = `review-dot-${payload?.day ?? `${cx}-${cy}`}`;

                    if (!payload?.hasReviewEvent) {
                      return <g key={pointKey} />;
                    }

                    return (
                      <circle
                        key={pointKey}
                        cx={cx}
                        cy={cy}
                        r={3}
                        fill="var(--color-reviews)"
                      />
                    );
                  }}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="h-full flex items-center justify-center flex-1">
              <div className="text-muted-foreground">
                Noch keine Aktivitäten vorhanden
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cell 4 — Leaderboard */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-heading-md text-muted-foreground font-semibold mb-5">
            Leaderboard
          </h3>
          <div className="relative lg:max-h-[20rem] h-full overflow-y-auto no-scrollbar">
            <Table>
              <TableHeader className="sticky top-0 bg-muted z-10 [&_tr>th:first-child]:rounded-tl-md [&_tr>th:last-child]:rounded-tr-md">
                <TableRow>
                  <TableHead className="w-[40px] bg-muted"></TableHead>
                  <TableHead className="bg-muted">co:detectives</TableHead>
                  <TableHead className="text-right bg-muted pr-2">
                    Bewertet
                  </TableHead>
                  <TableHead className="text-right bg-muted pl-2">
                    Level
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="relative">
                {leaderboard.map((user, index) => (
                  <TableRow key={user.user_id} className="first:mt-12">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-heading-md text-primary-foreground">
                            {getShortUsername(user.username)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.username}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-semibold pr-2">
                      {user.reviews_count}
                    </TableCell>
                    <TableCell className="text-right pl-2">
                      {getMilestoneName(user.reviews_count)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="h-6 bg-gradient-to-t from-neutral-0 to-neutral-0/0 sticky left-0 right-0 bottom-0 w-full"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStatistics;
