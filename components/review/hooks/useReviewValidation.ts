import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { resolveReviewTemplateConditions } from '@/lib/utils/condition-evaluator';
import { filterShownQuestions } from '@/lib/utils/review-question-navigation';
import {
  buildInProgressReviewAnswerData,
  getQuestionsValidationState,
  validateSubmittedReviewAnswer,
} from '@/lib/utils/review-validation';
import { useMemo } from 'react';

interface UseReviewValidationOptions {
  reviewTemplateWithAnswersValues: NonNullable<ReviewTemplate>;
  caseCategory?: string | null;
}

export const useReviewValidation = ({
  reviewTemplateWithAnswersValues,
  caseCategory,
}: UseReviewValidationOptions) => {
  const resolvedReviewTemplate = useMemo(
    () =>
      resolveReviewTemplateConditions(
        reviewTemplateWithAnswersValues,
        caseCategory,
      ),
    [caseCategory, reviewTemplateWithAnswersValues],
  );

  const inProgressReviewAnswerData = useMemo(
    () => buildInProgressReviewAnswerData(reviewTemplateWithAnswersValues),
    [reviewTemplateWithAnswersValues],
  );

  const isValidForSubmission = useMemo(() => {
    const validationResult = validateSubmittedReviewAnswer(
      inProgressReviewAnswerData,
    );
    return validationResult.success;
  }, [inProgressReviewAnswerData]);

  const shownReviewTemplateQuestions = useMemo(
    () => filterShownQuestions(resolvedReviewTemplate),
    [resolvedReviewTemplate],
  );

  const questionsValidationState = useMemo(() => {
    return getQuestionsValidationState(
      resolvedReviewTemplate,
      inProgressReviewAnswerData,
    );
  }, [resolvedReviewTemplate, inProgressReviewAnswerData]);

  return {
    resolvedReviewTemplate,
    inProgressReviewAnswerData,
    isValidForSubmission,
    shownReviewTemplateQuestions,
    questionsValidationState,
  };
};
