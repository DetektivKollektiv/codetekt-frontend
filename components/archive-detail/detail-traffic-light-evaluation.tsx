'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ReviewAggregationData } from '@/lib/schemas/aggregation-schemas';
import {
  getDistributionData,
  getRatingStyle,
} from '@/lib/utils/rating-helpers';

interface DetailTrafficLightEvaluationProps {
  field: Extract<
    ReviewAggregationData['questions'][number]['fields'][number],
    { type: 'traffic-light' }
  >;
}

export function DetailTrafficLightEvaluation({
  field,
}: DetailTrafficLightEvaluationProps) {
  const distributionData = getDistributionData(field);

  console.log('Distribution Data:', distributionData);
  const average = field.average;
  const ratingStyle = getRatingStyle(average);

  return (
    <Card
      className="h-full flex-[0_0_100%] md:flex-[0_0_calc(50%-0.5rem)] lg:flex-[0_0_calc(33.333%-0.667rem)] min-w-0"
      key={field.id}
    >
      <CardContent className="p-6 space-y-4">
        {/* Question section */}
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
            Frage
          </p>
          <p className="font-medium leading-relaxed line-clamp-3 h-20 text-ellipsis">
            {field.question}
          </p>
        </div>

        <Separator />

        {/* Rating badge section */}
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
            Hinweis
          </p>
          <div className="flex items-center gap-2">
            <Badge
              className="text-sm font-semibold px-3 py-2 w-full justify-center"
              style={{
                backgroundColor: ratingStyle.background,
                color: ratingStyle.text,
              }}
            >
              {ratingStyle.label}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Distribution section */}
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Einschätzung
          </p>
          <div className="space-y-2">
            {distributionData.map((entry) => (
              <div key={entry.level} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{entry.label}</span>
                  <span className="font-semibold">
                    {entry.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${entry.percentage.toFixed(0)}%`,
                      backgroundColor: entry.backgroundColor,
                      color: entry.textColor,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
