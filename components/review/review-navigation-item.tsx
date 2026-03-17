import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { FC } from 'react';

interface ReviewNavigationItemProps {
  id: string;
  label: string;
  onItemClick: (id: string) => void;
  isActive: boolean;
  isIndented?: boolean;
  status?: 'error' | 'success' | 'incomplete';
  className?: string;
  disabled?: boolean;
}

const ReviewNavigationItem: FC<ReviewNavigationItemProps> = ({
  id,
  label,
  onItemClick,
  isActive,
  isIndented = false,
  status,
  className,
  disabled,
}) => {
  const isError = status === 'error';
  const isSuccess = status === 'success';
  const isIncomplete = status === 'incomplete';
  const showCheckIcon = isSuccess;
  const showErrorIcon = isError;

  return (
    <button
      onClick={() => onItemClick(id)}
      disabled={disabled}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all h-9 border border-muted-foreground/30 hover:border-muted-foreground/50',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        isActive && 'bg-primary text-primary-foreground',
        !isActive && 'bg-muted hover:bg-muted/80',
        isError &&
          !isActive &&
          'border-destructive bg-destructive/10 hover:bg-destructive/20',
        isSuccess &&
          !isActive &&
          'border-brand-green/50 bg-brand-green/5 hover:bg-brand-green/10',
        isIncomplete &&
          !isActive &&
          'border-brand-yellow/60 bg-brand-yellow/5 hover:bg-brand-yellow/10',
        isIndented && 'ml-8',
        disabled &&
          'opacity-50 cursor-not-allowed hover:bg-muted hover:border-muted-foreground/30',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center size-4 rounded-full border-2 shrink-0',
          isActive && 'border-primary-foreground',
          !isActive && isError && 'border-destructive',
          !isActive && isSuccess && 'border-brand-green',
          !isActive && isIncomplete && 'border-brand-yellow',
          !isActive && !isError && !isSuccess && !isIncomplete && 'border-primary',
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
          isIncomplete && !isActive && 'text-foreground',
        )}
      >
        {label}
      </span>
    </button>
  );
};

export default ReviewNavigationItem;
