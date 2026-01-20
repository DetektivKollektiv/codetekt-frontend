import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { cn } from '@/lib/utils';
import { QuestionValidationState } from '@/lib/utils/review-validation';
import { Check, X } from 'lucide-react';
import { FC } from 'react';

interface ReviewNavigationItemProps {
  reviewTemplateQuestion: NonNullable<ReviewTemplate>[number];
  onItemClick: (id: string) => void;
  isActive: boolean;
  isIndented: boolean;
  validationState?: QuestionValidationState;
  className?: string;
  disabled?: boolean;
}

const ReviewNavigationItem: FC<ReviewNavigationItemProps> = ({
  reviewTemplateQuestion,
  onItemClick,
  isActive,
  isIndented,
  validationState,
  className,
  disabled,
}) => {
  const isError = validationState === 'error'; //|| validationState === 'incomplete';
  const isSuccess = validationState === 'success';
  const showCheckIcon = isSuccess;
  const showErrorIcon = isError;

  return (
    <button
      key={reviewTemplateQuestion.id}
      onClick={() => onItemClick(reviewTemplateQuestion.id)}
      disabled={disabled}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all h-9 border border-muted-foreground/30 hover:border-muted-foreground/50',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        // Active state (background)
        isActive && 'bg-primary text-primary-foreground',
        !isActive && 'bg-muted hover:bg-muted/80',
        // Validation state styling (only when not active)
        isError &&
          !isActive &&
          'border-destructive bg-destructive/10 hover:bg-destructive/20',
        isSuccess &&
          !isActive &&
          'border-brand-green/50 bg-brand-green/5 hover:bg-brand-green/10',
        isIndented && 'ml-8',
        // Disabled state
        disabled &&
          'opacity-50 cursor-not-allowed hover:bg-muted hover:border-muted-foreground/30',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center size-4 rounded-full border-2 shrink-0',
          // Icon styling based on active and validation state
          isActive && 'border-primary-foreground',
          !isActive && isError && 'border-destructive',
          !isActive && isSuccess && 'border-brand-green',
          !isActive && !isError && !isSuccess && 'border-primary',
        )}
      >
        {showCheckIcon && (
          <Check
            className={cn(
              'size-3',
              isActive ? 'text-primary-foreground' : 'text-brand-green',
            )}
            strokeWidth={4}
          />
        )}
        {showErrorIcon && (
          <X
            className={cn(
              'size-3',
              isActive ? 'text-primary-foreground' : 'text-destructive',
            )}
            strokeWidth={4}
          />
        )}
      </div>
      <span
        className={cn(
          'font-medium text-body-md md:text-body-sm',
          isError && !isActive && 'text-destructive',
          isSuccess && !isActive && 'text-brand-green-dark',
        )}
      >
        {reviewTemplateQuestion.metadata.title}
      </span>
    </button>
  );
};

export default ReviewNavigationItem;
