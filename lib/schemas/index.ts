// Re-export all schemas for backwards compatibility and easy imports

// Answer schemas
export {
  chipAnswerSchema,
  likertScaleAnswerSchema,
  multiLineTextAnswerSchema,
  reviewAnswerSchema,
  textAreaAnswerSchema,
  trafficLightAnswerSchema,
  type ReviewAnswer,
} from './answer-schemas.ts';

// Condition schemas
export {
  comparisonConditionSchema,
  conditionSchema,
  equalsConditionSchema,
  type Condtion,
} from './condition-schemas.ts';

// Option schemas
export {
  chipOptionSchema,
  likertScaleOptionSchema,
  multiLineTextOptionSchema,
  textAreaOptionSchema,
  trafficLightOptionSchema,
} from './option-schemas.ts';

// Field schemas
export {
  baseFieldSchema,
  chipFieldSchema,
  fieldSchema,
  likertScaleFieldSchema,
  multiLineTextFieldSchema,
  textAreaFieldSchema,
  trafficLightFieldSchema,
  type Field,
} from './field-schemas.ts';

// Template schemas
export {
  reviewTemplateSchema,
  type ReviewTemplateData,
} from './template-schemas.ts';

// Aggregation schemas
export {
  aggregationFieldValueSchema,
  reviewAggregationSchema,
  type ReviewAggregationData,
} from './aggregation-schemas.ts';

// Review schemas
export {
  inProgressReviewAnswerSchema,
  submittedReviewAnswerSchema,
  type InProgressReviewAnswerData,
  type SubmittedReviewAnswerData,
} from './review-schemas.ts';

// Open Graph schemas
export {
  ogImageObjectSchema,
  openGraphDataSchema,
  setOpenGraphDataRequestSchema,
  urlSchema,
  type OgImageObject,
  type OpenGraphData,
  type SetOpenGraphDataRequest,
} from './open-graph-schemas.ts';

// Case schemas
export {
  caseInsertSchema,
  contentTypeSchema,
  createCaseFormSchema,
  legalAcceptanceSchema,
  textContentSchema,
  urlContentSchema,
  type CaseInsertData,
  type ContentType,
  type CreateCaseFormData,
} from './case-schemas';
