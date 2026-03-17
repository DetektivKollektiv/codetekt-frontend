'use client';

import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { MetadataNavItem } from '@/lib/types/navigation';
import { QuestionValidationState } from '@/lib/utils/review-validation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FC } from 'react';
import { Button } from '../ui/button';
import ReviewNavigationItem from './review-navigation-item';

interface ReviewNavigationProps {
  reviewTemplateQuestions: NonNullable<ReviewTemplate>;
  onItemClick: (id: string) => void;
  questionsValidationState?: Map<string, QuestionValidationState>;
  disabled?: boolean;
  touchedQuestionsIds: string[];
  metadataItems: MetadataNavItem[];
  currentStepId: string;
}

const ReviewNavigation: FC<ReviewNavigationProps> = ({
  reviewTemplateQuestions,
  onItemClick,
  questionsValidationState = new Map(),
  disabled = false,
  touchedQuestionsIds,
  metadataItems,
  currentStepId,
}) => {
  const allMetadataComplete = metadataItems.every((m) => m.isComplete);

  const navItems = [
    ...metadataItems.map((item) => ({
      id: item.id,
      label: item.label,
      isIndented: false,
      status: item.isComplete ? ('success' as const) : ('incomplete' as const),
    })),
    ...(allMetadataComplete
      ? reviewTemplateQuestions.map((question) => {
          const isTouched = touchedQuestionsIds.includes(question.id);
          const validationState = isTouched
            ? questionsValidationState.get(question.id)
            : undefined;

          return {
            id: question.id,
            label: question.metadata.title,
            isIndented: (question.metadata.indent_level ?? 0) > 0,
            status: validationState?.type as 'error' | 'success' | undefined,
          };
        })
      : []),
  ];

  const currentIndex = navItems.findIndex((item) => item.id === currentStepId);
  const currentItem = currentIndex >= 0 ? navItems[currentIndex] : null;

  return (
    <nav>
      <div className="flex-col gap-2 hidden lg:flex">
        {navItems.map((item) => (
          <ReviewNavigationItem
            key={item.id}
            id={item.id}
            label={item.label}
            isIndented={item.isIndented}
            status={item.status}
            isActive={currentStepId === item.id}
            onItemClick={onItemClick}
            disabled={disabled}
          />
        ))}
      </div>
      <div className="flex gap-2 lg:hidden">
        <Button
          variant="secondary"
          size="icon"
          className="cursor-pointer"
          disabled={currentIndex <= 0 || disabled || navItems.length === 0}
          onClick={() => {
            if (currentIndex > 0) {
              onItemClick(navItems[currentIndex - 1].id);
            }
          }}
        >
          <ArrowLeft size={16} />
        </Button>
        {currentItem && (
          <ReviewNavigationItem
            className="w-full cursor-default"
            id={currentItem.id}
            label={currentItem.label}
            isIndented={false}
            status={currentItem.status}
            onItemClick={() => {}}
            isActive={true}
            disabled={disabled}
          />
        )}
        <Button
          variant="secondary"
          size="icon"
          className="cursor-pointer"
          disabled={
            currentIndex === -1 ||
            currentIndex >= navItems.length - 1 ||
            disabled ||
            navItems.length === 0
          }
          onClick={() => {
            if (currentIndex >= 0 && currentIndex < navItems.length - 1) {
              onItemClick(navItems[currentIndex + 1].id);
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
