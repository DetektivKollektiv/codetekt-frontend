'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ReviewAggregationData } from '@/lib/schemas/aggregation-schemas';

interface DetailTextEvaluationProps {
  field: Extract<
    ReviewAggregationData['questions'][number]['fields'][number],
    { type: 'text' | 'text-area' }
  >;
}

export function DetailTextEvaluation({ field }: DetailTextEvaluationProps) {
  return (
    <Card className="h-full w-full" key={field.id}>
      <CardContent className="p-6 space-y-4">
        {/* Question section */}
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
            Frage
          </p>
          <p className="font-medium leading-relaxed">{field.question}</p>
        </div>

        <Separator />

        {/* Answers section */}
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Antworten ({field.answer_values.length})
          </p>
          <div className="gap-3 grid-cols-1 md:grid-cols-2 grid">
            {field.answer_values.length > 0 ? (
              field.answer_values.map((answer, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted/50 rounded-md border border-border"
                >
                  <p className="text-xs text-muted-foreground font-medium mb-2">
                    {answer.user_name || 'Unbekannt'}
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {answer.value}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Keine Antworten vorhanden
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
