import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { Field } from '@/lib/schemas/field-schemas';
import { validateFieldValue } from '@/lib/utils/review-validation';
import { useEffect, useState } from 'react';

/**
 * Initialize answer_value from initial_answer_value on mount
 */
const initializeAnswerValues = (
  template: NonNullable<ReviewTemplate>,
): NonNullable<ReviewTemplate> => {
  return template.map((question) => ({
    ...question,
    fields: question.fields.map((field) => ({
      ...field,
      answer_value: field.initial_answer_value ?? field.answer_value,
    })) as typeof question.fields,
  })) as NonNullable<ReviewTemplate>;
};

export const useReviewState = (reviewTemplate: NonNullable<ReviewTemplate>) => {
  const [reviewTemplateWithAnswersValues, setReviewTemplateWithAnswerValues] =
    useState(() => initializeAnswerValues(reviewTemplate));

  const [fieldValidationErrors, setFieldValidationErrors] = useState<
    Map<string, string>
  >(new Map());

  useEffect(() => {
    console.log(
      'Review template with answer values initialized:',
      reviewTemplateWithAnswersValues,
    );
  }, [reviewTemplateWithAnswersValues]);

  /**
   * Update answer value for a specific field
   */
  const updateFieldValue = (
    questionId: string,
    fieldId: string,
    value: Field['answer_value'],
  ) => {
    // Find the field to validate it
    const question = reviewTemplateWithAnswersValues.find(
      (q) => q.id === questionId,
    );
    const field = question?.fields.find((f) => f.id === fieldId);

    if (field) {
      // Validate the new value
      const validationResult = validateFieldValue(field, value);

      if (!validationResult.success) {
        // Store validation error
        setFieldValidationErrors((prev) => {
          const next = new Map(prev);
          next.set(
            fieldId,
            validationResult.error.issues[0]?.message || 'Invalid value',
          );
          return next;
        });
        console.warn(
          'Validation error for field',
          fieldId,
          validationResult.error,
        );
      } else {
        // Clear any existing validation error for this field
        setFieldValidationErrors((prev) => {
          const next = new Map(prev);
          next.delete(fieldId);
          return next;
        });
      }
    }

    // Update the value regardless of validation (for in-progress saves)
    setReviewTemplateWithAnswerValues((prev) =>
      prev.map((question) => {
        if (question.id !== questionId) return question;
        return {
          ...question,
          fields: question.fields.map((field) => {
            if (field.id !== fieldId) return field;
            return {
              ...field,
              answer_value: value,
            } as typeof field;
          }),
        };
      }),
    );
  };

  return {
    reviewTemplateWithAnswersValues,
    fieldValidationErrors,
    updateFieldValue,
  };
};
