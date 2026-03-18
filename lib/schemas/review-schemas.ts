import { z } from 'zod';
import {
  chipAnswerSchema,
  multiLineTextAnswerSchema,
  textAnswerSchema,
  textAreaAnswerSchema,
  trafficLightAnswerSchema,
} from './answer-schemas';

const submittedReviewCommentSchema = z
  .union([z.literal(''), z.string().min(10)])
  .nullable()
  .optional();

export const submittedReviewAnswerSatireSchema = z
  .object({
    comment: submittedReviewCommentSchema,
  })
  .strict();

export const submittedReviewAnswerReportSchema = z
  .object({
    content_accuracy: trafficLightAnswerSchema,
    content_sources: trafficLightAnswerSchema,
    content_language: trafficLightAnswerSchema,
    content_clarity: trafficLightAnswerSchema,
    content_references: trafficLightAnswerSchema,
    content_logic: trafficLightAnswerSchema,
    content_advertising: trafficLightAnswerSchema,
    content_rhetorical_manipulation: trafficLightAnswerSchema,
    content_objective_no_hate_no_panic: trafficLightAnswerSchema,
    content_headline_matches_article: trafficLightAnswerSchema,
    content_claims_not_debunked: trafficLightAnswerSchema,

    media_objectivity: trafficLightAnswerSchema,
    media_no_ai_or_staging_doubts: trafficLightAnswerSchema,
    media_visualizations_not_distorted: trafficLightAnswerSchema,
    media_visualization_data_traceable: trafficLightAnswerSchema,

    source_claims_supported: trafficLightAnswerSchema,
    source_listed_and_verifiable: trafficLightAnswerSchema,
    source_claims_match_originals: trafficLightAnswerSchema,
    source_experts_verified: trafficLightAnswerSchema,
    quotes_experts_reputation: trafficLightAnswerSchema,

    quotes_identifiable_persons: trafficLightAnswerSchema,
    quotes_context_accurate: trafficLightAnswerSchema,

    comment: submittedReviewCommentSchema,
  })
  .strict();

export const submittedReviewAnswerOpinionSchema = z
  .object({
    content_sources: trafficLightAnswerSchema,
    content_language: trafficLightAnswerSchema,
    content_clarity: trafficLightAnswerSchema,
    content_references: trafficLightAnswerSchema,
    content_logic: trafficLightAnswerSchema,
    content_advertising: trafficLightAnswerSchema,
    content_rhetorical_manipulation: trafficLightAnswerSchema,
    content_objective_no_hate_no_panic: trafficLightAnswerSchema,
    content_headline_matches_article: trafficLightAnswerSchema,
    content_claims_not_debunked: trafficLightAnswerSchema,

    media_objectivity: trafficLightAnswerSchema,
    media_no_ai_or_staging_doubts: trafficLightAnswerSchema,
    media_visualizations_not_distorted: trafficLightAnswerSchema,
    media_visualization_data_traceable: trafficLightAnswerSchema,

    source_claims_supported: trafficLightAnswerSchema,
    source_listed_and_verifiable: trafficLightAnswerSchema,
    source_claims_match_originals: trafficLightAnswerSchema,
    source_experts_verified: trafficLightAnswerSchema,
    quotes_experts_reputation: trafficLightAnswerSchema,

    quotes_context_accurate: trafficLightAnswerSchema,

    comment: submittedReviewCommentSchema,
  })
  .strict();

export const submittedReviewAnswerTextMessageSchema = z
  .object({
    content_sources: trafficLightAnswerSchema,
    content_language: trafficLightAnswerSchema,
    content_clarity: trafficLightAnswerSchema,
    content_references: trafficLightAnswerSchema,
    content_logic: trafficLightAnswerSchema,
    content_advertising: trafficLightAnswerSchema,
    content_rhetorical_manipulation: trafficLightAnswerSchema,
    content_objective_no_hate_no_panic: trafficLightAnswerSchema,
    content_headline_matches_article: trafficLightAnswerSchema,
    content_claims_not_debunked: trafficLightAnswerSchema,

    media_objectivity: trafficLightAnswerSchema,
    media_no_ai_or_staging_doubts: trafficLightAnswerSchema,
    media_visualizations_not_distorted: trafficLightAnswerSchema,
    media_visualization_data_traceable: trafficLightAnswerSchema,

    source_claims_supported: trafficLightAnswerSchema,
    source_listed_and_verifiable: trafficLightAnswerSchema,
    source_claims_match_originals: trafficLightAnswerSchema,
    source_experts_verified: trafficLightAnswerSchema,
    quotes_experts_reputation: trafficLightAnswerSchema,

    quotes_identifiable_persons: trafficLightAnswerSchema,
    quotes_context_accurate: trafficLightAnswerSchema,

    comment: submittedReviewCommentSchema,
  })
  .strict();

export const submittedReviewAnswerSchemaMap = {
  report: submittedReviewAnswerReportSchema,
  opinion: submittedReviewAnswerOpinionSchema,
  satire: submittedReviewAnswerSatireSchema,
  text_message: submittedReviewAnswerTextMessageSchema,
} as const;

export const submittedReviewAnswerSchema = z.union([
  submittedReviewAnswerReportSchema,
  submittedReviewAnswerOpinionSchema,
  submittedReviewAnswerSatireSchema,
  submittedReviewAnswerTextMessageSchema,
]);

export type Category = keyof typeof submittedReviewAnswerSchemaMap;

// In-progress schema - all optional (autosave/draft)
export const inProgressReviewAnswerSchema = z
  .object({
    title: textAnswerSchema.optional(),
    keyword_type: multiLineTextAnswerSchema.optional(),
    content_type: chipAnswerSchema.optional(),

    // Inhalt
    content_accuracy: trafficLightAnswerSchema.optional(),
    content_sources: trafficLightAnswerSchema.optional(),
    content_language: trafficLightAnswerSchema.optional(),
    content_clarity: trafficLightAnswerSchema.optional(),
    content_references: trafficLightAnswerSchema.optional(),
    content_logic: trafficLightAnswerSchema.optional(),
    content_advertising: trafficLightAnswerSchema.optional(),
    content_rhetorical_manipulation: trafficLightAnswerSchema.optional(),
    content_objective_no_hate_no_panic: trafficLightAnswerSchema.optional(),
    content_headline_matches_article: trafficLightAnswerSchema.optional(),
    content_claims_not_debunked: trafficLightAnswerSchema.optional(),

    // Bilder/Videos
    media_objectivity: trafficLightAnswerSchema.optional(),
    media_no_ai_or_staging_doubts: trafficLightAnswerSchema.optional(),
    media_visualizations_not_distorted: trafficLightAnswerSchema.optional(),
    media_visualization_data_traceable: trafficLightAnswerSchema.optional(),

    // Quelle
    source_claims_supported: trafficLightAnswerSchema.optional(),
    source_listed_and_verifiable: trafficLightAnswerSchema.optional(),
    source_claims_match_originals: trafficLightAnswerSchema.optional(),
    source_experts_verified: trafficLightAnswerSchema.optional(),

    // Zitate
    quotes_experts_reputation: trafficLightAnswerSchema.optional(),
    quotes_identifiable_persons: trafficLightAnswerSchema.optional(),
    quotes_context_accurate: trafficLightAnswerSchema.optional(),

    comment: textAreaAnswerSchema.optional(),
  })
  .strict();

// Export types
export type SubmittedReviewAnswerSatire = z.infer<
  typeof submittedReviewAnswerSatireSchema
>;
export type SubmittedReviewAnswerReport = z.infer<
  typeof submittedReviewAnswerReportSchema
>;
export type SubmittedReviewAnswerOpinion = z.infer<
  typeof submittedReviewAnswerOpinionSchema
>;
export type SubmittedReviewAnswerTextMessage = z.infer<
  typeof submittedReviewAnswerTextMessageSchema
>;

export type SubmittedReviewAnswer = {
  [K in Category]: z.infer<(typeof submittedReviewAnswerSchemaMap)[K]>;
}[Category];
export type InProgressReviewAnswer = z.infer<
  typeof inProgressReviewAnswerSchema
>;
