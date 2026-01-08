import { z } from 'zod';

// Content type enum matching database constraint
export const contentTypeSchema = z.enum(['url', 'text']);

// URL validation schema with German error messages
export const urlContentSchema = z
  .string()
  .url('Bitte gib eine gültige URL ein')
  .min(1, 'URL ist erforderlich')
  .max(2048, 'URL ist zu lang');

// Text content validation
export const textContentSchema = z
  .string()
  .min(10, 'Text muss mindestens 10 Zeichen lang sein')
  .max(5000, 'Text darf maximal 5000 Zeichen lang sein')
  .trim();

// Legal acceptance checkboxes (both required)
export const legalAcceptanceSchema = z.object({
  privacy: z.boolean().refine((val) => val === true, {
    message: 'Du musst die Datenschutzerklärung akzeptieren',
  }),
  terms: z.boolean().refine((val) => val === true, {
    message: 'Du musst die Nutzungsbedingungen akzeptieren',
  }),
});

// Main form schema with conditional validation
export const createCaseFormSchema = z
  .object({
    content_type: contentTypeSchema,
    content: z.string().min(1, 'Inhalt ist erforderlich'),
    legal: legalAcceptanceSchema,
  })
  .superRefine((data, ctx) => {
    // Conditional validation based on content_type
    if (data.content_type === 'url') {
      const result = urlContentSchema.safeParse(data.content);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content'],
          message: result.error.errors[0].message,
        });
      }
    } else if (data.content_type === 'text') {
      const result = textContentSchema.safeParse(data.content);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content'],
          message: result.error.errors[0].message,
        });
      }
    }
  });

// Database insert schema (what gets sent to Supabase)
export const caseInsertSchema = z.object({
  content: z.string(),
  content_type: contentTypeSchema,
  submitted_by: z.string().uuid(),
  template_version: z.number().int().positive(),
});

// Type exports
export type CreateCaseFormData = z.infer<typeof createCaseFormSchema>;
export type CaseInsertData = z.infer<typeof caseInsertSchema>;
export type ContentType = z.infer<typeof contentTypeSchema>;
