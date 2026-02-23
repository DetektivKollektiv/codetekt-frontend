'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { AggregatedReviews } from '@/lib/queries/getAggregatedReviews';
import { UserCases } from '@/lib/queries/getUserCases';
import { FC, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

interface UserStatisticsProps {
  ownUserAggregatedReviews: AggregatedReviews;
  ownUserPendingCases: UserCases;
  userReviews: NonNullable<
    Awaited<
      ReturnType<typeof import('@/lib/queries/getUserReviews').getUserReviews>
    >['data']
  >;
}

const getMilestoneName = (count: number): string | null => {
  if (count >= 100) return 'Meisterdetektiv';
  if (count >= 50) return 'Experte';
  if (count >= 25) return 'Fortgeschritten';
  if (count >= 10) return 'Erfahren';
  if (count >= 5) return 'Anfänger';
  return null;
};

const UserStatistics: FC<UserStatisticsProps> = ({
  ownUserAggregatedReviews,
  ownUserPendingCases,
  userReviews,
}) => {
  const chartData = useMemo(() => {
    // Combine all activities with dates
    const activities: { date: Date; type: 'case' | 'review' }[] = [];

    // Add submitted cases
    [...ownUserAggregatedReviews, ...ownUserPendingCases].forEach((item) => {
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
  }, [ownUserAggregatedReviews, ownUserPendingCases, userReviews]);

  const totalCases =
    ownUserAggregatedReviews.length + ownUserPendingCases.length;
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
    <Card className="overflow-hidden w-2/3">
      <CardHeader className="pt-0 px-0 ">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-start">
          {/* Left side - Title and current level */}
          <div className="p-4 border-b h-full text-muted-foreground">
            Aktuelle Stufe:{' '}
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
        <div className="grid grid-cols-2">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-12">
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 24,
                  left: 12,
                  right: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="displayMonth"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  angle={0}
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
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              Noch keine Aktivitäten vorhanden
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatistics;
