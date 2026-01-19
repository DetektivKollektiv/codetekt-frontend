'use client';

import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FC, useMemo } from 'react';
import { Button } from '../ui/button';
import ReviewNavigationItem from './review-navigation-item';

interface ReviewNavigationProps {
  reviewTemplateQuestions: NonNullable<ReviewTemplate>;
  currentItemId: string;
  onItemClick: (id: string) => void;
  questionsWithErrors?: Set<string>;
}

const ReviewNavigation: FC<ReviewNavigationProps> = ({
  reviewTemplateQuestions,
  currentItemId,
  onItemClick,
  questionsWithErrors = new Set(),
}) => {
  const currentQuestion = useMemo(
    () =>
      reviewTemplateQuestions.find((item) => item.id === currentItemId) ||
      reviewTemplateQuestions[0],
    [currentItemId, reviewTemplateQuestions]
  );

  return (
    <nav>
      <div className="flex-col gap-2 hidden lg:flex">
        {reviewTemplateQuestions.map((reviewTemplateQuestion) => {
          const isActive = reviewTemplateQuestion.id === currentItemId;
          const indentLevel = reviewTemplateQuestion.metadata.indent_level ?? 0;
          const isIndented = indentLevel > 0;
          const isDestructive = questionsWithErrors.has(
            reviewTemplateQuestion.id
          );
          return (
            <ReviewNavigationItem
              key={reviewTemplateQuestion.id}
              reviewTemplateQuestion={reviewTemplateQuestion}
              onItemClick={onItemClick}
              isActive={isActive}
              isIndented={isIndented}
              isDestructive={isDestructive}
            />
          );
        })}
      </div>
      <div className="flex gap-2 lg:hidden">
        <Button
          variant="secondary"
          size="icon"
          className="cursor-pointer"
          disabled={currentQuestion === reviewTemplateQuestions[0]}
          onClick={() => {
            const currentIndex = reviewTemplateQuestions.findIndex(
              (item) => item.id === currentQuestion.id
            );
            if (currentIndex > 0) {
              onItemClick(reviewTemplateQuestions[currentIndex - 1].id);
            }
          }}
        >
          <ArrowLeft size={16} />
        </Button>
        <ReviewNavigationItem
          className="w-full cursor-default"
          key={currentQuestion.id}
          reviewTemplateQuestion={currentQuestion}
          onItemClick={() => {}}
          isActive={true}
          isIndented={false}
        />
        <Button
          variant="secondary"
          size="icon"
          className="cursor-pointer"
          disabled={
            currentQuestion ===
            reviewTemplateQuestions[reviewTemplateQuestions.length - 1]
          }
          onClick={() => {
            const currentIndex = reviewTemplateQuestions.findIndex(
              (item) => item.id === currentQuestion.id
            );
            if (currentIndex < reviewTemplateQuestions.length - 1) {
              onItemClick(reviewTemplateQuestions[currentIndex + 1].id);
            }
          }}
        >
          <ArrowRight size={16} />
        </Button>
      </div>
    </nav>
  );
};

export default ReviewNavigation;
