import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { Field } from '@/lib/schemas/field-schemas';
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

  useEffect(() => {
    setReviewTemplateWithAnswerValues(initializeAnswerValues(reviewTemplate));
  }, [reviewTemplate]);

  /**
   * Update answer value for a specific field
   */
  const updateFieldValue = (
    questionId: string,
    fieldId: string,
    value: Field['answer_value'],
  ) => {
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
    updateFieldValue,
  };
};
