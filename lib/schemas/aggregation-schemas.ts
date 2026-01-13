import { z } from 'zod';
import {
  chipAnswerSchema,
  multyLineTextAnswerSchema,
} from './answer-schemas';

// Schema for aggregated field values
export const aggregationFieldValueSchema = z.object({
  counts: z.object({
    0: z.number(),
    1: z.number(),
    2: z.number(),
    3: z.number(),
  }),
  percentages: z.object({
    0: z.number(),
    1: z.number(),
    2: z.number(),
    3: z.number(),
  }),
  average: z.number(),
  warnings: z.array(z.string()),
});

// Review aggregation schema
export const reviewAggregationSchema = z.object({
  metadata: z.object({
    keyword_type: multyLineTextAnswerSchema,
    content_type: chipAnswerSchema,
  }),
  fields: z.record(z.string(), aggregationFieldValueSchema),
});

export type ReviewAggregationData = z.infer<typeof reviewAggregationSchema>;
