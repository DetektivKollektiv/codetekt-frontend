import { ReviewTemplate } from '../queries/getReviewTemplate';
import {
  chipAnswerSchema,
  likertScaleAnswerSchema,
  multiLineTextAnswerSchema,
  textAnswerSchema,
  textAreaAnswerSchema,
  trafficLightAnswerSchema,
} from '../schemas/answer-schemas';
import { Field } from '../schemas/field-schemas';
import {
  InProgressReviewAnswer,
  inProgressReviewAnswerSchema,
  submittedReviewAnswerSchema,
} from '../schemas/review-schemas';

/**
 * Get the appropriate Zod schema for a field based on its type
 */
export const getFieldAnswerSchema = (fieldType: Field['type']) => {
  switch (fieldType) {
    case 'multi-line-text':
      return multiLineTextAnswerSchema;
    case 'chip':
      return chipAnswerSchema;
    case 'traffic-light':
      return trafficLightAnswerSchema;
    case 'likert-scale':
      return likertScaleAnswerSchema;
    case 'text-area':
      return textAreaAnswerSchema;
    case 'text':
      return textAnswerSchema;
    default:
      // This should never happen with discriminated union
      throw new Error(`Unknown field type: ${fieldType}`);
  }
};

/**
 * Validate a single field value
 * Returns { success: true, data } or { success: false, error }
 */
export const validateFieldValue = (
  field: Field,
  value: Field['answer_value']
) => {
  const schema = getFieldAnswerSchema(field.type);
  return schema.safeParse(value);
};

/**
 * Build InProgressReviewAnswer object from the review template
 * Maps field IDs to their answer values
 */
export const buildInProgressReviewAnswerData = (
  reviewTemplate: NonNullable<ReviewTemplate>
): InProgressReviewAnswer => {
  const data: Record<string, unknown> = {};

  reviewTemplate.forEach((question) => {
    question.fields.forEach((field) => {
      // Only include fields that have an answer_value (even if null)
      if ('answer_value' in field) {
        data[field.id] = field.answer_value;
      }
    });
  });

  // Validate against the schema to ensure it matches the expected structure
  const result = inProgressReviewAnswerSchema.safeParse(data);

  if (!result.success) {
    console.error(
      'Failed to build in-progress review answer data:',
      result.error
    );
    // Return the data anyway, but log the error
    return data as InProgressReviewAnswer;
  }

  return result.data;
};

/**
 * Validate the complete InProgressReviewAnswer object
 * Returns validation result with any errors
 */
export const validateInProgressReviewAnswer = (
  data: InProgressReviewAnswer
) => {
  return inProgressReviewAnswerSchema.safeParse(data);
};

/**
 * Validate the complete review answer as a submitted review
 * Returns validation result with any errors based on stricter requirements
 */
export const validateSubmittedReviewAnswer = (data: InProgressReviewAnswer) => {
  return submittedReviewAnswerSchema.safeParse(data);
};

/**
 * Get validation errors for all fields in the review template
 * Returns a map of field IDs to error messages
 */
export const getFieldValidationErrors = (
  reviewTemplate: NonNullable<ReviewTemplate>
): Map<string, string> => {
  const errors = new Map<string, string>();

  reviewTemplate.forEach((question) => {
    question.fields.forEach((field) => {
      if ('answer_value' in field) {
        const result = validateFieldValue(field, field.answer_value);
        if (!result.success) {
          errors.set(
            field.id,
            result.error.issues[0]?.message || 'Invalid value'
          );
        }
      }
    });
  });

  return errors;
};

/**
 * Get question IDs that have validation errors based on submitted schema
 * Returns a Set of question IDs
 */
export const getQuestionsWithSubmittedValidationErrors = (
  reviewTemplate: NonNullable<ReviewTemplate>,
  data: InProgressReviewAnswer
): Set<string> => {
  const questionIdsWithErrors = new Set<string>();

  // First, validate the complete data
  const validationResult = submittedReviewAnswerSchema.safeParse(data);

  console.log('Validation result:', validationResult);

  if (validationResult.success) {
    return questionIdsWithErrors; // No errors
  }

  // Map field IDs from errors to question IDs
  const errorFieldIds = new Set(
    validationResult.error.issues.map((issue) => issue.path[0] as string)
  );

  // Find which questions contain these fields
  reviewTemplate.forEach((question) => {
    const hasErrorField = question.fields.some((field) =>
      errorFieldIds.has(field.id)
    );
    if (hasErrorField) {
      questionIdsWithErrors.add(question.id);
    }
  });

  return questionIdsWithErrors;
};
