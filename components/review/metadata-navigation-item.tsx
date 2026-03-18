import { MetadataNavItem } from '@/lib/types/navigation';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { FC } from 'react';

interface MetadataNavigationItemProps {
  item: MetadataNavItem;
  isActive: boolean;
  onItemClick: (id: string) => void;
  disabled?: boolean;
  className?: string;
}

const MetadataNavigationItem: FC<MetadataNavigationItemProps> = ({
  item,
  isActive,
  onItemClick,
  disabled = false,
  className,
}) => {
  return (
    <button
      onClick={() => onItemClick(item.id)}
      disabled={disabled}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all h-9 border border-muted-foreground/30 hover:border-muted-foreground/50',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        isActive && 'bg-primary text-primary-foreground',
        !isActive && 'bg-muted hover:bg-muted/80',
        !item.isComplete &&
          !isActive &&
          'border-brand-yellow/60 bg-brand-yellow/5 hover:bg-brand-yellow/10',
        item.isComplete &&
          !isActive &&
          'border-brand-green/50 bg-brand-green/5 hover:bg-brand-green/10',
        disabled &&
          'opacity-50 cursor-not-allowed hover:bg-muted hover:border-muted-foreground/30',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center size-4 rounded-full border-2 shrink-0',
          isActive && 'border-primary-foreground',
          !isActive && item.isComplete && 'border-brand-green',
          !isActive && !item.isComplete && 'border-brand-yellow',
        )}
      >
        {item.isComplete && (
          <Check
            className={cn(
              'size-3',
              isActive ? 'text-primary-foreground' : 'text-brand-green',
            )}
            strokeWidth={4}
          />
        )}
      </div>
      <span
        className={cn(
          'font-medium text-body-md md:text-body-sm',
          item.isComplete && !isActive && 'text-brand-green-dark',
          !item.isComplete && !isActive && 'text-foreground',
        )}
      >
        {item.label}
      </span>
    </button>
  );
};

export default MetadataNavigationItem;
