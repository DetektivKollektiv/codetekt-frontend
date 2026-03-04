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
import { UserReviews } from '@/lib/queries/getUserReviews';
import { getShortUsername } from '@/lib/utils/get-short-username';
import { FC, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

interface UserStatisticsProps {
  leaderboard: Leaderboard;
  userCases: UserCases;
  userReviews: UserReviews;
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

const UserStatistics: FC<UserStatisticsProps> = ({
  leaderboard,
  userCases,
  userReviews,
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
    userReviews.forEach((review) => {
      if (review.created_at) {
        activities.push({
          date: new Date(review.created_at),
          type: 'review',
        });
      }
    });

    // Sort by date
    activities.sort((a, b) => a.date.getTime() - b.date.getTime());

    if (activities.length === 0) {
      return [];
    }

    // Group by month and calculate cumulative totals for each type
    const monthlyData: Record<
      string,
      { month: string; cases: number; reviews: number; displayMonth: string }
    > = {};

    let cumulativeCases = 0;
    let cumulativeReviews = 0;

    activities.forEach((activity) => {
      const monthKey = `${activity.date.getFullYear()}-${String(activity.date.getMonth() + 1).padStart(2, '0')}`;
      const displayMonth = activity.date.toLocaleDateString('de-DE', {
        month: 'short',
        year: 'numeric',
      });

      if (activity.type === 'case') {
        cumulativeCases++;
      } else {
        cumulativeReviews++;
      }

      monthlyData[monthKey] = {
        month: monthKey,
        displayMonth,
        cases: cumulativeCases,
        reviews: cumulativeReviews,
      };
    });

    // Return only the last 4 months
    const allMonths = Object.values(monthlyData);
    return allMonths.slice(-4);
  }, [userCases, userReviews]);

  const totalCases = userCases.length;
  const totalReviews = userReviews.length;
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
              <div className="text-display-lg md:text-5xl font-bold tabular-nums text-brand-yellow-dark">
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
                  dataKey="displayMonth"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  angle={0}
                  interval={0}
                  tick={(props) => {
                    const { x, y, payload, index, visibleTicksCount } = props;
                    let textAnchor: 'start' | 'middle' | 'end' = 'middle';
                    if (index === 0) {
                      textAnchor = 'start';
                    } else if (index === visibleTicksCount - 1) {
                      textAnchor = 'end';
                    }
                    return (
                      <text
                        x={x}
                        y={y}
                        dy={16}
                        textAnchor={textAnchor}
                        fill="currentColor"
                        className="text-xs fill-muted-foreground"
                      >
                        {payload.value}
                      </text>
                    );
                  }}
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
                  type="natural"
                  fill="url(#fillCases)"
                  fillOpacity={0.4}
                  stroke="var(--color-cases)"
                />
                <Area
                  dataKey="reviews"
                  type="natural"
                  fill="url(#fillReviews)"
                  fillOpacity={0.4}
                  stroke="var(--color-reviews)"
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
                  <TableHead className="bg-muted">Benutzer</TableHead>
                  <TableHead className="text-right text-brand-coral bg-muted">
                    Eingereicht
                  </TableHead>
                  <TableHead className="text-right text-brand-yellow-dark bg-muted">
                    Bewertet
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
                    <TableCell className="text-right font-semibold">
                      {user.cases_count}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {user.reviews_count}
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
