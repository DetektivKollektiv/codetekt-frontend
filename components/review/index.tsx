'use client';
import { Case } from '@/lib/queries/getCase';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
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
  const [reviewTemplateWithAnserValues, setReviewTemplateWithAnswerValues] =
    useState(reviewTemplate);

  const [currentQuestionId, setCurrentQuestionId] = useState(
    reviewTemplate[0].id
  );

  const isLastQuestion = useMemo(() => {
    const currentIndex = reviewTemplateWithAnserValues.findIndex(
      (q) => q.id === currentQuestionId
    );
    return currentIndex === reviewTemplateWithAnserValues.length - 1;
  }, [currentQuestionId, reviewTemplateWithAnserValues]);

  const currentQuestion = useMemo(
    () =>
      reviewTemplate.find((item) => item.id === currentQuestionId) ||
      reviewTemplate[0],
    [currentQuestionId, reviewTemplate]
  );

  const reviewTemplateNavigationQuestions = useMemo(
    () => reviewTemplate.filter((item) => item),
    [currentQuestionId, reviewTemplate]
  );

  const setNextQuestion = () => {
    const currentIndex = reviewTemplateWithAnserValues.findIndex(
      (q) => q.id === currentQuestionId
    );
    if (currentIndex < reviewTemplateWithAnserValues.length - 1) {
      const nextQuestionId = reviewTemplateWithAnserValues[currentIndex + 1].id;
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
      <QuestionCard question={currentQuestion}>
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
