'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { FieldDefinition } from '@/lib/config/field-definitions';
import type { ReviewAggregationData } from '@/lib/schemas/aggregation-schemas';
import {
  getDistributionData,
  getRatingLevelColor,
  getRatingLevelLabel,
} from '@/lib/utils/rating-helpers';

interface DetailEvaluationCardProps {
  field: FieldDefinition;
  fieldData: ReviewAggregationData['fields'][string];
}

export function DetailEvaluationCard({
  field,
  fieldData,
}: DetailEvaluationCardProps) {
  const distributionData = getDistributionData(fieldData);
  const average = fieldData.average;

  return (
    <Card className="h-full">
      <CardContent className="p-6 space-y-4">
        {/* Question section */}
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
            Frage
          </p>
          <p className="font-medium leading-relaxed">{field.question}</p>
        </div>

        <Separator />

        {/* Rating badge section */}
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
            Hinweis
          </p>
          <div className="flex items-center gap-2">
            <Badge
              className="text-sm font-semibold px-3 py-1 w-full text-center"
              style={{
                backgroundColor: getRatingLevelColor(
                  Math.round(average) as 0 | 1 | 2 | 3
                ),
              }}
            >
              {getRatingLevelLabel(Math.round(average) as 0 | 1 | 2 | 3)}
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
                  <span className="font-semibold">{entry.percentage}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${entry.percentage}%`,
                      backgroundColor: entry.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warnings if any */}
        {fieldData.warnings && fieldData.warnings.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                Hinweise
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {fieldData.warnings.map((warning, idx) => (
                  <li key={idx} className="text-orange-600">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
