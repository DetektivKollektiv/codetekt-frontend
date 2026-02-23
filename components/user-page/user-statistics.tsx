'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { UserCases } from '@/lib/queries/getUserCases';
import { UserReviews } from '@/lib/queries/getUserReviews';
import { getShortUsername } from '@/lib/utils/get-short-username';
import { FC, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

interface UserStatisticsProps {
  userCases: UserCases;
  userReviews: UserReviews;
}

const getMilestoneName = (count: number): string | null => {
  if (count >= 100) return 'Meisterdetektiv';
  if (count >= 50) return 'Experte';
  if (count >= 25) return 'Fortgeschritten';
  if (count >= 10) return 'Erfahren';
  if (count >= 5) return 'Anfänger';
  return null;
};

const leaderBoardData = [
  { username: 'Anna', cases: 20, reviews: 15 },
  { username: 'Ben', cases: 15, reviews: 10 },
  { username: 'Clara', cases: 10, reviews: 5 },
  { username: 'David', cases: 5, reviews: 2 },
].sort((a, b) => b.cases + b.reviews - (a.cases + a.reviews));

const UserStatistics: FC<UserStatisticsProps> = ({
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

    return Object.values(monthlyData);
  }, [userCases, userReviews]);

  const totalCases = userCases.length;
  const totalReviews = userReviews.length;
  const totalActivities = totalCases + totalReviews;
  const currentMilestone = getMilestoneName(totalActivities);

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
    <Card className="overflow-hidden ">
      <CardHeader className="pt-0 px-0 ">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-start">
          {/* Left side - Title and current level */}
          <div className="p-4 border-b h-full text-muted-foreground text-body-sm">
            Aktuelle Stufe
            <p className=" text-display-md">
              {currentMilestone ? (
                <span className="font-bold text-foreground">
                  {currentMilestone}
                </span>
              ) : (
                'Erreiche 5 Aktivitäten für deine erste Stufe'
              )}
            </p>
          </div>

          {/* Right side - Big numbers */}
          <div className="grid grid-cols-2 bg-muted">
            <div className="text-left border-l border-b p-5">
              <div className="text-muted-foreground text-sm mb-1">
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
              <div className="text-display-lg md:text-5xl font-bold tabular-nums text-brand-yellow">
                {totalReviews}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-12 relative">
          <div>
            <h3 className="text-heading-md text-muted-foreground font-semibold mb-6">
              Aktivitätsverlauf
            </h3>
            {chartData.length > 0 ? (
              <ChartContainer
                config={chartConfig}
                className="min-h-12 focus:outline-none"
              >
                <AreaChart
                  className="focus:outline-none"
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
                    <linearGradient
                      id="fillReviews"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
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
              <div className="flex items-center justify-center  text-muted-foreground">
                Noch keine Aktivitäten vorhanden
              </div>
            )}
          </div>
          <div className="absolute w-px bg-border h-full left-1/2"></div>
          <div>
            <h3 className="text-heading-md text-muted-foreground font-semibold mb-2">
              Leaderboard
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Benutzer</TableHead>
                  <TableHead className="text-right text-brand-coral">
                    Eingereicht
                  </TableHead>
                  <TableHead className="text-right text-brand-yellow">
                    Bewertet
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderBoardData.map((user, index) => (
                  <TableRow key={user.username}>
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
                    <TableCell className="text-right font-semibold ">
                      {user.cases}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {user.reviews}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatistics;
