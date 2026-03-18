import * as React from 'react';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ChipProps extends React.ComponentProps<'button'> {
  text: string;
  isSelected: boolean;
  hasError?: boolean;
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, text, isSelected, hasError = false, ...props }, ref) => {
    return (
      <button
        type="button"
        data-slot="chip"
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-body-md md:text-body-sm font-medium transition-all h-9',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isSelected
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border bg-background text-foreground hover:bg-accent',
          props.disabled && 'cursor-not-allowed opacity-60',
          hasError && 'border-destructive',
          className,
        )}
        ref={ref}
        {...props}
      >
        {isSelected ? (
          <span className="flex size-4 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground -ml-1">
            <Check className="size-3" strokeWidth={3} />
          </span>
        ) : (
          <span className="flex size-5 items-center justify-center rounded-full border-2 border-muted-foreground/30 -ml-1" />
        )}
        {text}
      </button>
    );
  },
);

Chip.displayName = 'Chip';

export { Chip };
