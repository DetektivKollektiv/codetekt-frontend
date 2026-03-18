'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { FC } from 'react';

interface TagProps {
  label: string;
  removable?: boolean;
  onRemove?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'primary-muted' | 'subtle' | 'destructive';
}

const Tag: FC<TagProps> = ({
  label,
  removable = false,
  onRemove,
  disabled = false,
  variant = 'primary',
}) => {
  const baseStyles =
    'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-body-md md:text-body-sm font-medium transition-all h-9 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60';

  const variantStyles: Record<string, string> = {
    primary: 'border border-primary bg-primary/5 text-primary',
    'primary-muted': 'border border-primary/40 bg-primary/5 text-primary/80',
    subtle: 'border border-border bg-background text-foreground',
    destructive: 'border border-destructive bg-destructive/5 text-destructive',
  };

  return (
    <div className={cn(baseStyles, variantStyles[variant])}>
      <span className="truncate">{label}</span>
      {removable && (
        <button
          onClick={onRemove}
          disabled={disabled}
          className="ml-1 -mr-1 inline-flex items-center justify-center rounded p-0.5 hover:bg-black/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:hover:bg-white/10"
          aria-label={`Remove ${label}`}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export { Tag };
