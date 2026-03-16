'use client';

import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { QuestionValidationState } from '@/lib/utils/review-validation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FC } from 'react';
import { Button } from '../ui/button';
import ReviewNavigationItem from './review-navigation-item';

interface ReviewNavigationProps {
  reviewTemplateQuestions: NonNullable<ReviewTemplate>;
  currentQuestion: NonNullable<ReviewTemplate>[number];
  onItemClick: (id: string) => void;
  questionsValidationState?: Map<string, QuestionValidationState>;
  disabled?: boolean;
  touchedQuestionsIds: string[];
}

const ReviewNavigation: FC<ReviewNavigationProps> = ({
  reviewTemplateQuestions,
  currentQuestion,
  onItemClick,
  questionsValidationState = new Map(),
  disabled = false,
  touchedQuestionsIds,
}) => {
  console.log(
    'ReviewNavigation - reviewTemplateQuestions:',
    reviewTemplateQuestions,
  );
  return (
    <nav>
      <div className="flex-col gap-2 hidden lg:flex">
        {reviewTemplateQuestions.map((reviewTemplateQuestion) => {
          const isActive = reviewTemplateQuestion.id === currentQuestion.id;
          const indentLevel = reviewTemplateQuestion.metadata.indent_level ?? 0;
          const isIndented = indentLevel > 0;
          const isTouched = touchedQuestionsIds.includes(
            reviewTemplateQuestion.id,
          );
          const validationState = isTouched
            ? questionsValidationState.get(reviewTemplateQuestion.id)
            : undefined;
          return (
            <ReviewNavigationItem
              key={reviewTemplateQuestion.id}
              reviewTemplateQuestion={reviewTemplateQuestion}
              onItemClick={onItemClick}
              isActive={isActive}
              isIndented={isIndented}
              validationState={validationState}
              disabled={disabled}
            />
          );
        })}
      </div>
      <div className="flex gap-2 lg:hidden">
        <Button
          variant="secondary"
          size="icon"
          className="cursor-pointer"
          disabled={currentQuestion === reviewTemplateQuestions[0] || disabled}
          onClick={() => {
            const currentIndex = reviewTemplateQuestions.findIndex(
              (item) => item.id === currentQuestion.id,
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
          disabled={disabled}
        />
        <Button
          variant="secondary"
          size="icon"
          className="cursor-pointer"
          disabled={
            currentQuestion ===
              reviewTemplateQuestions[reviewTemplateQuestions.length - 1] ||
            disabled
          }
          onClick={() => {
            const currentIndex = reviewTemplateQuestions.findIndex(
              (item) => item.id === currentQuestion.id,
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
