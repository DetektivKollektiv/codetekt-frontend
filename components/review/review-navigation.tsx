'use client';

import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { MetadataNavItem } from '@/lib/types/navigation';
import { QuestionValidationState } from '@/lib/utils/review-validation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FC } from 'react';
import { Button } from '../ui/button';
import MetadataNavigationItem from './metadata-navigation-item';
import ReviewNavigationItem from './review-navigation-item';

interface ReviewNavigationProps {
  reviewTemplateQuestions: NonNullable<ReviewTemplate>;
  currentQuestion: NonNullable<ReviewTemplate>[number];
  onItemClick: (id: string) => void;
  questionsValidationState?: Map<string, QuestionValidationState>;
  disabled?: boolean;
  touchedQuestionsIds: string[];
  metadataItems: MetadataNavItem[];
  currentStepId: string;
}

const ReviewNavigation: FC<ReviewNavigationProps> = ({
  reviewTemplateQuestions,
  currentQuestion,
  onItemClick,
  questionsValidationState = new Map(),
  disabled = false,
  touchedQuestionsIds,
  metadataItems,
  currentStepId,
}) => {
  const allMetadataComplete = metadataItems.every((m) => m.isComplete);

  return (
    <nav>
      <div className="flex-col gap-2 hidden lg:flex">
        {metadataItems.map((item) => (
          <MetadataNavigationItem
            key={item.id}
            item={item}
            isActive={currentStepId === item.id}
            onItemClick={onItemClick}
            disabled={disabled}
          />
        ))}
        {allMetadataComplete && (
          <>
            {reviewTemplateQuestions.map((reviewTemplateQuestion) => {
              const isActive = reviewTemplateQuestion.id === currentQuestion.id;
              const indentLevel =
                reviewTemplateQuestion.metadata.indent_level ?? 0;
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
          </>
        )}
      </div>
      <div className="flex gap-2 lg:hidden">
        <Button
          variant="secondary"
          size="icon"
          className="cursor-pointer"
          disabled={
            (allMetadataComplete
              ? currentQuestion === reviewTemplateQuestions[0]
              : metadataItems[0]?.id === currentStepId) || disabled
          }
          onClick={() => {
            const metaIndex = metadataItems.findIndex(
              (m) => m.id === currentStepId,
            );
            if (metaIndex > 0) {
              onItemClick(metadataItems[metaIndex - 1].id);
            } else if (metaIndex === -1) {
              const currentIndex = reviewTemplateQuestions.findIndex(
                (item) => item.id === currentStepId,
              );
              if (currentIndex > 0) {
                onItemClick(reviewTemplateQuestions[currentIndex - 1].id);
              } else if (currentIndex === 0 && allMetadataComplete) {
                onItemClick(metadataItems[metadataItems.length - 1].id);
              }
            }
          }}
        >
          <ArrowLeft size={16} />
        </Button>
        {metadataItems.some((m) => m.id === currentStepId) ? (
          <MetadataNavigationItem
            className="w-full cursor-default"
            item={metadataItems.find((m) => m.id === currentStepId)!}
            isActive={true}
            onItemClick={() => {}}
            disabled={disabled}
          />
        ) : (
          <ReviewNavigationItem
            className="w-full cursor-default"
            key={currentQuestion.id}
            reviewTemplateQuestion={currentQuestion}
            onItemClick={() => {}}
            isActive={true}
            isIndented={false}
            disabled={disabled}
          />
        )}
        <Button
          variant="secondary"
          size="icon"
          className="cursor-pointer"
          disabled={
            (allMetadataComplete
              ? currentQuestion ===
                reviewTemplateQuestions[reviewTemplateQuestions.length - 1]
              : metadataItems[metadataItems.length - 1]?.id ===
                currentStepId) || disabled
          }
          onClick={() => {
            const metaIndex = metadataItems.findIndex(
              (m) => m.id === currentStepId,
            );
            if (metaIndex !== -1 && metaIndex < metadataItems.length - 1) {
              onItemClick(metadataItems[metaIndex + 1].id);
            } else if (
              metaIndex === metadataItems.length - 1 &&
              allMetadataComplete
            ) {
              onItemClick(reviewTemplateQuestions[0].id);
            } else if (metaIndex === -1) {
              const currentIndex = reviewTemplateQuestions.findIndex(
                (item) => item.id === currentStepId,
              );
              if (currentIndex < reviewTemplateQuestions.length - 1) {
                onItemClick(reviewTemplateQuestions[currentIndex + 1].id);
              }
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
