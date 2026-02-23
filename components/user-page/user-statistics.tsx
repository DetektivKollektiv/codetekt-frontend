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
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from 'recharts';

interface UserStatisticsProps {
  ownUserAggregatedReviews: AggregatedReviews;
  ownUserPendingCases: UserCases;
  userReviews: NonNullable<
    Awaited<
      ReturnType<typeof import('@/lib/queries/getUserReviews').getUserReviews>
    >['data']
  >;
}

const MILESTONES = [5, 10, 25, 50, 100] as const;

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

    // Group by month and calculate cumulative totals
    const monthlyData: Record<
      string,
      { month: string; total: number; displayMonth: string }
    > = {};

    let cumulativeTotal = 0;

    activities.forEach((activity) => {
      const monthKey = `${activity.date.getFullYear()}-${String(activity.date.getMonth() + 1).padStart(2, '0')}`;
      const displayMonth = activity.date.toLocaleDateString('de-DE', {
        month: 'short',
        year: 'numeric',
      });

      cumulativeTotal++;

      monthlyData[monthKey] = {
        month: monthKey,
        displayMonth,
        total: cumulativeTotal,
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
    total: {
      label: 'Aktivitäten',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  // Custom label component to show only milestones
  const CustomLabel = (props: any) => {
    const { x, y, value } = props;

    // Only show label if this value is a milestone
    if (!MILESTONES.includes(value)) {
      return null;
    }

    return (
      <g>
        <circle cx={x} cy={y} r={6} fill="hsl(var(--primary))" />
        <text
          x={x}
          y={y - 12}
          fill="hsl(var(--foreground))"
          textAnchor="middle"
          fontSize={12}
          fontWeight="bold"
        >
          {value}
        </text>
      </g>
    );
  };

  return (
    <Card className="overflow-hidden w-2/3">
      <CardHeader className="pt-0 px-0 ">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-start">
          {/* Left side - Title and current level */}
          <div className="p-4 border-b h-full text-muted-foreground">
            Aktuelle Stufe:{' '}
            <p className=" text-display-md">
              {currentMilestone ? (
                <span className="font-bold text-primary">
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
              <div className="text-display-lg md:text-5xl font-bold tabular-nums">
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
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-12">
              <LineChart
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
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Line
                  dataKey="total"
                  type="monotone"
                  stroke="var(--color-total)"
                  strokeWidth={2}
                  dot={{
                    fill: 'var(--color-total)',
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                >
                  <LabelList content={<CustomLabel />} />
                </Line>
              </LineChart>
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
