import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { CaseCategoryValue } from '@/lib/schemas/case-metadata-schemas';
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
  caseCategory?: CaseCategoryValue | null;
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
      caseCategory,
    );
    return validationResult.success;
  }, [caseCategory, inProgressReviewAnswerData]);

  const shownReviewTemplateQuestions = useMemo(
    () => filterShownQuestions(resolvedReviewTemplate),
    [resolvedReviewTemplate],
  );

  const questionsValidationState = useMemo(() => {
    return getQuestionsValidationState(
      resolvedReviewTemplate,
      inProgressReviewAnswerData,
      caseCategory,
    );
  }, [caseCategory, resolvedReviewTemplate, inProgressReviewAnswerData]);

  return {
    resolvedReviewTemplate,
    inProgressReviewAnswerData,
    isValidForSubmission,
    shownReviewTemplateQuestions,
    questionsValidationState,
  };
};
