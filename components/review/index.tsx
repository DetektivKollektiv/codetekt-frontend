'use client';
import { Case } from '@/lib/queries/getCase';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { Field } from '@/lib/schemas/field-schemas';
import { FC, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import CaseCard from './case-card';
import QuestionCard from './question-card';
import ReviewNavigation from './review-navigation';

interface ReviewProps {
  reviewTemplate: NonNullable<ReviewTemplate>;
  case: NonNullable<Case>;
}

const Review: FC<ReviewProps> = ({ reviewTemplate, case: caseData }) => {
  // Initialize answer_value from initial_answer_value on mount
  const initializeAnswerValues = (
    template: NonNullable<ReviewTemplate>
  ): NonNullable<ReviewTemplate> => {
    return template.map((question) => ({
      ...question,
      fields: question.fields.map((field) => ({
        ...field,
        answer_value: field.initial_answer_value ?? field.answer_value,
      })) as typeof question.fields,
    })) as NonNullable<ReviewTemplate>;
  };

  const [reviewTemplateWithAnswersValues, setReviewTemplateWithAnswerValues] =
    useState(() => initializeAnswerValues(reviewTemplate));

  const [currentQuestionId, setCurrentQuestionId] = useState(
    reviewTemplate[0].id
  );

  // Function to update answer value for a specific field
  const updateFieldValue = (
    questionId: string,
    fieldId: string,
    value: Field['answer_value']
  ) => {
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
      })
    );
  };

  const isLastQuestion = useMemo(() => {
    const currentIndex = reviewTemplateWithAnswersValues.findIndex(
      (q) => q.id === currentQuestionId
    );
    return currentIndex === reviewTemplateWithAnswersValues.length - 1;
  }, [currentQuestionId, reviewTemplateWithAnswersValues]);

  const currentQuestion = useMemo(
    () =>
      reviewTemplateWithAnswersValues.find(
        (item) => item.id === currentQuestionId
      ) || reviewTemplateWithAnswersValues[0],
    [currentQuestionId, reviewTemplateWithAnswersValues]
  );

  const reviewTemplateNavigationQuestions = useMemo(
    () => reviewTemplateWithAnswersValues.filter((item) => item),
    [reviewTemplateWithAnswersValues]
  );

  const setNextQuestion = () => {
    const currentIndex = reviewTemplateWithAnswersValues.findIndex(
      (q) => q.id === currentQuestionId
    );
    if (currentIndex < reviewTemplateWithAnswersValues.length - 1) {
      const nextQuestionId =
        reviewTemplateWithAnswersValues[currentIndex + 1].id;
      setCurrentQuestionId(nextQuestionId);
    }
  };

  return (
    <div
      className="page-max-w lg:grid lg:gap-6"
      style={{
        gridTemplateColumns: '300px 1fr ',
      }}
    >
      <div>
        <CaseCard case={caseData} />
        <div className="my-4 lg:my-0 lg:mt-4">
          <ReviewNavigation
            reviewTemplateQuestions={reviewTemplateNavigationQuestions}
            currentItemId={currentQuestionId}
            onItemClick={setCurrentQuestionId}
          />
        </div>
      </div>
      <QuestionCard question={currentQuestion} onFieldChange={updateFieldValue}>
        <div className="flex flex-col w-full gap-2">
          <Button variant="destructive" className="w-full">
            Einspruch gegen Antworten erheben
          </Button>
          {isLastQuestion ? (
            <Button variant="default" className="w-full">
              Fall abschließen
            </Button>
          ) : (
            <Button
              variant="default"
              className="w-full"
              onClick={setNextQuestion}
            >
              Nächste Frage
            </Button>
          )}
        </div>
      </QuestionCard>
    </div>
  );
};

export default Review;
