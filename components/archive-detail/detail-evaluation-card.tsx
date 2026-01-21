'use client';

import type { ReviewAggregationData } from '@/lib/schemas/aggregation-schemas';
import { DetailTextEvaluation } from './detail-text-evaluation';
import { DetailTrafficLightEvaluation } from './detail-traffic-light-evaluation';

interface DetailEvaluationCardProps {
  field: ReviewAggregationData['questions'][number]['fields'][number];
}

export function DetailEvaluationCard({ field }: DetailEvaluationCardProps) {
  if (field.type === 'traffic-light') {
    return <DetailTrafficLightEvaluation field={field} />;
  }

  if (field.type === 'text' || field.type === 'text-area') {
    return <DetailTextEvaluation field={field} />;
  }

  return null;
}
