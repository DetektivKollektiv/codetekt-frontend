import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { FC } from 'react';

interface ReviewNavigationItemProps {
  reviewTemplateQuestion: NonNullable<ReviewTemplate>[number];
  onItemClick: (id: string) => void;
  isActive: boolean;
  isIndented: boolean;
  isDestructive?: boolean;
  className?: string;
}

const ReviewNavigationItem: FC<ReviewNavigationItemProps> = ({
  reviewTemplateQuestion,
  onItemClick,
  isActive,
  isIndented,
  isDestructive = false,
  className,
}) => {
  return (
    <button
      key={reviewTemplateQuestion.id}
      onClick={() => onItemClick(reviewTemplateQuestion.id)}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all h-9 border border-muted-foreground/30 hover:border-muted-foreground/50',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        isActive && 'bg-primary text-primary-foreground',
        !isActive && 'bg-muted hover:bg-muted/80',
        isDestructive &&
          !isActive &&
          'border-destructive bg-destructive/10 hover:bg-destructive/20',
        isIndented && 'ml-8',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center size-4 rounded-full border-2 shrink-0',
          isActive && 'bg-white border-white',
          !isActive && !isDestructive && 'border-primary',
          !isActive && isDestructive && 'border-destructive'
        )}
      >
        {isActive && <Check className="size-3 text-primary" strokeWidth={4} />}
      </div>
      <span
        className={cn(
          'font-medium text-body-md md:text-body-sm',
          isDestructive && !isActive && 'text-destructive'
        )}
      >
        {reviewTemplateQuestion.metadata.title}
      </span>
    </button>
  );
};

export default ReviewNavigationItem;
