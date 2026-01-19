import { z } from 'zod';

// Comment content validation with German error messages
export const commentContentSchema = z
  .string()
  .min(10, 'Kommentar muss mindestens 10 Zeichen lang sein')
  .max(5000, 'Kommentar darf maximal 5000 Zeichen lang sein')
  .trim();

// Form schema for creating a comment
export const createCommentFormSchema = z.object({
  content: commentContentSchema,
  case_id: z.string().uuid('Ungültige Fall-ID'),
});

// Database insert schema (what gets sent to Supabase)
export const commentInsertSchema = z.object({
  content: z.string(),
  case_id: z.string().uuid(),
  author_id: z.string().uuid(),
});

// Type exports
export type CreateCommentFormData = z.infer<typeof createCommentFormSchema>;
export type CommentInsertData = z.infer<typeof commentInsertSchema>;
