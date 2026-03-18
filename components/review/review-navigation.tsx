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
}

interface ReviewNavigationProps {
  items: ReviewNavigationItemData[];
  onItemClick: (id: string) => void;
  disabled?: boolean;
  currentStepId: string;
}

const ReviewNavigation: FC<ReviewNavigationProps> = ({
  items,
  onItemClick,
  disabled = false,
  currentStepId,
}) => {
  const currentIndex = items.findIndex((item) => item.id === currentStepId);
  const currentItem = currentIndex >= 0 ? items[currentIndex] : null;

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
            disabled={disabled}
          />
        ))}
      </div>
      <div className="flex gap-2 lg:hidden">
        <Button
          variant="secondary"
          size="icon"
          className="cursor-pointer"
          disabled={currentIndex <= 0 || disabled || items.length === 0}
          onClick={() => {
            if (currentIndex > 0) {
              onItemClick(items[currentIndex - 1].id);
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
            currentIndex >= items.length - 1 ||
            disabled ||
            items.length === 0
          }
          onClick={() => {
            if (currentIndex >= 0 && currentIndex < items.length - 1) {
              onItemClick(items[currentIndex + 1].id);
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
