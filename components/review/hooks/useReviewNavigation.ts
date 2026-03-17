import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import {
  getCurrentQuestion,
  getIsLastQuestion,
  getNextQuestionId,
} from '@/lib/utils/review-question-navigation';
import { useMemo, useState } from 'react';

interface UseReviewNavigationOptions {
  shownReviewTemplateQuestions: NonNullable<ReviewTemplate>;
  initialQuestionId: string;
}

export const useReviewNavigation = ({
  shownReviewTemplateQuestions,
  initialQuestionId,
}: UseReviewNavigationOptions) => {
  const [currentQuestionId, setCurrentQuestionId] = useState(initialQuestionId);

  const isLastQuestion = useMemo(() => {
    return getIsLastQuestion(shownReviewTemplateQuestions, currentQuestionId);
  }, [currentQuestionId, shownReviewTemplateQuestions]);

  const currentQuestion = useMemo(() => {
    return getCurrentQuestion(shownReviewTemplateQuestions, currentQuestionId);
  }, [currentQuestionId, shownReviewTemplateQuestions]);

  const setNextQuestion = () => {
    const nextQuestionId = getNextQuestionId(
      shownReviewTemplateQuestions,
      currentQuestionId,
    );

    if (nextQuestionId) {
      setCurrentQuestionId(nextQuestionId);
    }
  };

  return {
    currentQuestionId,
    setCurrentQuestionId,
    currentQuestion,
    isLastQuestion,
    setNextQuestion,
  };
};
