import { z } from 'zod';
import { fieldSchema } from './field-schemas';

// Review template schema
export const reviewTemplateSchema = z.object({
  id: z.string(),
  metadata: z.object({
    title: z.string(),
    text: z.string(),
    help_url: z.string(),
    indent_level: z.number().optional(),
  }),
  fields: z.array(fieldSchema),
});

export type ReviewTemplateData = z.infer<typeof reviewTemplateSchema>;
