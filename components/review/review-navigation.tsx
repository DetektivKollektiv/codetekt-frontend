'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FC } from 'react';
import { Button } from '../ui/button';
import ReviewNavigationItem from './review-navigation-item';

export interface ReviewNavigationItemData {
  id: string;
  label: string;
  isIndented: boolean;
  status: 'error' | 'success' | 'incomplete' | undefined;
  disabled: boolean;
}

interface ReviewNavigationProps {
  items: ReviewNavigationItemData[];
  onItemClick: (id: string) => void;
  disabled?: boolean;
  currentStepId: string;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const ReviewNavigation: FC<ReviewNavigationProps> = ({
  items,
  onItemClick,
  disabled = false,
  currentStepId,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
}) => {
  const currentItem = items.find((item) => item.id === currentStepId) ?? null;

  return (
    <nav>
      <div className="flex-col gap-2 hidden lg:flex">
        {items.map((item) => (
          <ReviewNavigationItem
            key={item.id}
            id={item.id}
            label={item.label}
            isIndented={item.isIndented}
            status={item.status}
            isActive={currentStepId === item.id}
            onItemClick={onItemClick}
            disabled={disabled || item.disabled}
          />
        ))}
      </div>
      <div className="flex gap-2 lg:hidden">
        <Button
          variant="secondary"
          size="icon"
          className="cursor-pointer"
          disabled={!canGoPrev || disabled || items.length === 0}
          onClick={onPrev}
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
            disabled={disabled || currentItem.disabled}
          />
        )}
        <Button
          variant="secondary"
          size="icon"
          className="cursor-pointer"
          disabled={!canGoNext || disabled || items.length === 0}
          onClick={onNext}
        >
          <ArrowRight size={16} />
        </Button>
      </div>
    </nav>
  );
};

export default ReviewNavigation;
