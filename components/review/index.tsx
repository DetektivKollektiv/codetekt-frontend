'use client';
import { Case } from '@/lib/queries/getCase';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { FC, useMemo, useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { HelpButton } from '../ui/help-button';
import CaseCard from './case-card';
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
            items={reviewTemplate}
            currentItemId={currentQuestionId}
            onItemClick={setCurrentQuestionId}
          />
        </div>
      </div>
      <Card className="py-6">
        <CardHeader className="relative">
          <CardTitle className=" text-display-sm">
            {currentQuestion.metadata.title}
          </CardTitle>
          <CardDescription className="max-w-xl">
            {currentQuestion.metadata.text}
          </CardDescription>
          <HelpButton className="absolute top-6 right-6" />
        </CardHeader>
      </Card>
    </div>
  );
};

export default Review;
