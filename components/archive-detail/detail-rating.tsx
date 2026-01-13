'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRatingInfo } from '@/lib/utils/rating-helpers';
import { CheckCircle2, AlertCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { AggregatedReview } from '@/lib/queries/getAggregatedReview';

interface DetailRatingProps {
  aggregatedReview: NonNullable<AggregatedReview>;
}

export function DetailRating({ aggregatedReview }: DetailRatingProps) {
  const score = Number(aggregatedReview.result_score);
  const ratingInfo = getRatingInfo(score);

  const getIcon = () => {
    switch (ratingInfo.key) {
      case 'trusted':
        return <CheckCircle2 className="w-16 h-16" />;
      case 'mostly-trusted':
        return <AlertCircle className="w-16 h-16" />;
      case 'mostly-untrusted':
        return <AlertTriangle className="w-16 h-16" />;
      case 'untrusted':
        return <XCircle className="w-16 h-16" />;
    }
  };

  return (
    <Card
      className="border-2"
      style={{
        borderColor: ratingInfo.gradientFrom,
        background: `linear-gradient(135deg, ${ratingInfo.gradientFrom}15, ${ratingInfo.gradientTo}15)`,
      }}
    >
      <CardHeader>
        <CardTitle>Bewertung des Falls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Icon */}
          <div
            className="flex-shrink-0"
            style={{ color: ratingInfo.gradientFrom }}
          >
            {getIcon()}
          </div>

          {/* Rating info */}
          <div className="flex-1 text-center md:text-left">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  Vertrauenswürdigkeit
                </p>
                <h2
                  className="text-3xl md:text-4xl font-bold mt-1"
                  style={{ color: ratingInfo.gradientFrom }}
                >
                  {ratingInfo.label}
                </h2>
              </div>

              <div className="flex items-baseline gap-2 justify-center md:justify-start">
                <span className="text-5xl font-bold">
                  {score.toFixed(1)}
                </span>
                <span className="text-2xl text-muted-foreground">/ 3.0</span>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                Diese Bewertung basiert auf den aggregierten Einschätzungen von{' '}
                {aggregatedReview.reviewer_ids.length} Reviewer
                {aggregatedReview.reviewer_ids.length !== 1 ? 'n' : ''}.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
