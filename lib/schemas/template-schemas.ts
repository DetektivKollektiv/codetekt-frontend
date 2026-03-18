import { z } from 'zod';
import { fieldSchema } from './field-schemas';

export const reviewTemplateMetadataSchema = z.object({
  title: z.string(),
  text: z.string(),
  help_url: z.string(),
  indent_level: z.number().optional(),
});

// Review template schema
export const reviewTemplateSchema = z.object({
  id: z.string(),
  metadata: reviewTemplateMetadataSchema,
  fields: z.array(fieldSchema),
});

export type ReviewTemplateData = z.infer<typeof reviewTemplateSchema>;
export type ReviewTemplateMetadataData = z.infer<
  typeof reviewTemplateMetadataSchema
>;
