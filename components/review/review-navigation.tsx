'use client';

import { cn } from '@/lib/utils';
import { Check, Circle } from 'lucide-react';
import { FC } from 'react';

interface ReviewNavigationItem {
  id: string;
  metadata: {
    title: string;
    indent_level?: number;
  };
}

interface ReviewNavigationProps {
  items: ReviewNavigationItem[];
  currentItemId: string;
  onItemClick: (id: string) => void;
}

const ReviewNavigation: FC<ReviewNavigationProps> = ({
  items,
  currentItemId,
  onItemClick,
}) => {
  return (
    <nav className="flex flex-col gap-2">
      {items.map((item) => {
        const isActive = item.id === currentItemId;
        const indentLevel = item.metadata.indent_level ?? 0;
        const isIndented = indentLevel > 0;

        return (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              isActive && 'bg-primary text-primary-foreground',
              !isActive && !isIndented && 'bg-muted hover:bg-muted/80',
              !isActive && isIndented && 'bg-transparent hover:bg-muted/50',
              isIndented && 'ml-8'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center size-6 rounded-full border-2 shrink-0',
                isActive && 'bg-white border-white',
                !isActive && !isIndented && 'border-primary',
                !isActive && isIndented && 'border-muted-foreground/40'
              )}
            >
              {isActive && <Check className="size-4 text-primary" />}
            </div>
            <span
              className={cn(
                'font-medium',
                !isActive && isIndented && 'text-muted-foreground'
              )}
            >
              {item.metadata.title}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default ReviewNavigation;
