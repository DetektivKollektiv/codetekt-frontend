'use client';
import { Case } from '@/lib/queries/getCase';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { FC, useMemo, useState } from 'react';
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
  const currentQuestion = useMemo(
    () =>
      reviewTemplate.find((item) => item.id === currentQuestionId) ||
      reviewTemplate[0],
    [currentQuestionId, reviewTemplate]
  );

  const reviewTemplateNavigationItems = useMemo(
    () => reviewTemplate.filter((item) => item),
    [currentQuestionId, reviewTemplate]
  );

  return (
    <div
      className="page-max-w lg:grid lg:gap-6"
      style={{
        gridTemplateColumns: '300px 1fr ',
      }}
    >
      <div>
        <CaseCard case={caseData} />
        <div className="mt-4">
          <ReviewNavigation
            items={reviewTemplateNavigationItems}
            currentItemId={currentQuestionId}
            onItemClick={setCurrentQuestionId}
          />
        </div>
      </div>
      <QuestionCard question={currentQuestion} />
    </div>
  );
};

export default Review;
