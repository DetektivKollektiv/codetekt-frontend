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
  value: Field['answer_value'],
) => {
  const schema = getFieldAnswerSchema(field.type);
  return schema.safeParse(value);
};

/**
 * Build InProgressReviewAnswer object from the review template
 * Maps field IDs to their answer values
 */
export const buildInProgressReviewAnswerData = (
  reviewTemplate: NonNullable<ReviewTemplate>,
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
      result.error,
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
  data: InProgressReviewAnswer,
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
  reviewTemplate: NonNullable<ReviewTemplate>,
): Map<string, string> => {
  const errors = new Map<string, string>();

  reviewTemplate.forEach((question) => {
    question.fields.forEach((field) => {
      if ('answer_value' in field) {
        const result = validateFieldValue(field, field.answer_value);
        if (!result.success) {
          errors.set(
            field.id,
            result.error.issues[0]?.message || 'Invalid value',
          );
        }
      }
    });
  });

  return errors;
};

/**
 * Validation state for a question
 */
export type QuestionValidationState = 'error' | 'success' | 'incomplete';

/**
 * Get validation state for all questions
 * Returns a Map of question IDs to their validation state
 */
export const getQuestionsValidationState = (
  reviewTemplate: NonNullable<ReviewTemplate>,
  data: InProgressReviewAnswer,
): Map<string, QuestionValidationState> => {
  const validationStates = new Map<string, QuestionValidationState>();

  // Validate the complete data against submitted schema
  const validationResult = submittedReviewAnswerSchema.safeParse(data);

  // Get field IDs with errors
  const errorFieldIds = new Set<string>();
  if (!validationResult.success) {
    validationResult.error.issues.forEach((issue) => {
      if (issue.path[0]) {
        errorFieldIds.add(issue.path[0] as string);
      }
    });
  }

  // Determine state for each question
  reviewTemplate.forEach((question) => {
    // Get visible fields (those that are shown)
    const visibleFields = question.fields.filter(
      (field) => field.is_shown === true || field.is_shown === undefined,
    );
    if (visibleFields.length === 0) {
      // No visible fields, skip this question
      return;
    }

    // Check if any visible field has an error
    const hasError = visibleFields.some((field) => errorFieldIds.has(field.id));

    if (hasError) {
      validationStates.set(question.id, 'error');
      return;
    }

    // Check if all visible fields have valid answers
    const allFieldsValid = visibleFields.every((field) => {
      if (!('answer_value' in field)) return false;

      // Check if field has a value (not null/undefined/empty)
      const hasValue =
        field.answer_value !== null &&
        field.answer_value !== undefined &&
        field.answer_value !== '';

      if (!hasValue) return false;

      // Validate the field value against its schema
      const result = validateFieldValue(field, field.answer_value);
      return result.success;
    });

    if (allFieldsValid) {
      validationStates.set(question.id, 'success');
    } else {
      validationStates.set(question.id, 'incomplete');
    }
  });

  return validationStates;
};
