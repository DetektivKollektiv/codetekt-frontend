'use client';
import { Case } from '@/lib/queries/getCase';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { FC, useState } from 'react';
import CaseCard from './case-card';
import ReviewNavigation from './review-navigation';

interface ReviewProps {
  reviewTemplate: NonNullable<ReviewTemplate>;
  case: NonNullable<Case>;
}

const Review: FC<ReviewProps> = ({ reviewTemplate, case: caseData }) => {
  const [currentQuestion, setCurrentQuestion] = useState(reviewTemplate[0].id);

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
            currentItemId={currentQuestion}
            onItemClick={setCurrentQuestion}
          />
        </div>
      </div>
      <div className="h-40 bg-brand-darkblue"></div>
    </div>
  );
};

export default Review;
