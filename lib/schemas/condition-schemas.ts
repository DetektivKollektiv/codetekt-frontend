import { z } from 'zod';

// Condition schemas for dynamic field behavior (is_disabled, is_required, is_shown, is_disputable)

export const comparisonConditionSchema = z.object({
  field_id: z.string(),
  operator: z.union([z.literal('>'), z.literal('<')]),
  value: z.number(),
});

export const equalsConditionSchema = z.object({
  field_id: z.string(),
  operator: z.literal('equals'),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

export const conditionSchema = z.union([
  comparisonConditionSchema,
  equalsConditionSchema,
]);

export type Condtion = z.infer<typeof conditionSchema>;
