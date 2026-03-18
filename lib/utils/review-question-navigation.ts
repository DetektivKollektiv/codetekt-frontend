import { ReviewTemplate } from '../queries/getReviewTemplate';

type ReviewQuestion = NonNullable<ReviewTemplate>[number];

export const filterShownQuestions = (
  reviewTemplate: NonNullable<ReviewTemplate>,
): NonNullable<ReviewTemplate> => {
  return reviewTemplate.filter((question) =>
    question.fields.some(
      (field) => field.is_shown === true || field.is_shown === undefined,
    ),
  );
};

export const getCurrentQuestion = (
  questions: NonNullable<ReviewTemplate>,
  currentQuestionId: string,
): ReviewQuestion => {
  return (
    questions.find((question) => question.id === currentQuestionId) ||
    questions[0]
  );
};

export const getIsLastQuestion = (
  questions: NonNullable<ReviewTemplate>,
  currentQuestionId: string,
): boolean => {
  const currentIndex = questions.findIndex(
    (question) => question.id === currentQuestionId,
  );
  return currentIndex === questions.length - 1;
};

export const getNextQuestionId = (
  questions: NonNullable<ReviewTemplate>,
  currentQuestionId: string,
): string | null => {
  const currentIndex = questions.findIndex(
    (question) => question.id === currentQuestionId,
  );

  if (currentIndex < 0 || currentIndex >= questions.length - 1) {
    return null;
  }

  return questions[currentIndex + 1].id;
};
