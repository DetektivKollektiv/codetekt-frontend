import { z } from 'zod';

// Comment content validation with German error messages
export const commentContentSchema = z
  .string()
  .min(10, 'Kommentar muss mindestens 10 Zeichen lang sein')
  .max(5000, 'Kommentar darf maximal 5000 Zeichen lang sein')
  .trim();

export const COMMENT_REPORT_REASON_MIN_LENGTH = 4;
export const COMMENT_REPORT_REASON_MAX_LENGTH = 500;

export const commentReportReasonSchema = z
  .string()
  .min(
    COMMENT_REPORT_REASON_MIN_LENGTH,
    `Mindestens ${COMMENT_REPORT_REASON_MIN_LENGTH} Zeichen.`,
  )
  .max(
    COMMENT_REPORT_REASON_MAX_LENGTH,
    `Maximal ${COMMENT_REPORT_REASON_MAX_LENGTH} Zeichen.`,
  )
  .trim();

export const createCommentReportSchema = z.object({
  commentId: z.string().uuid('Ungültige Kommentar-ID'),
  reason: commentReportReasonSchema,
});

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
export type CreateCommentReportData = z.infer<typeof createCommentReportSchema>;
