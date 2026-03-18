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
    'inline-flex items-center gap-2 px-3 py-1 rounded-lg text-body-sm font-medium whitespace-nowrap';

  const variantStyles: Record<string, string> = {
    primary: 'border border-primary/40 bg-primary/10 text-primary',
    'primary-muted': 'border border-primary/30 bg-primary/5 text-primary/80',
    subtle: 'border border-border/60 bg-transparent text-muted-foreground',
    destructive: 'border border-destructive bg-destructive/5 text-destructive',
  };

  return (
    <div className={cn(baseStyles, variantStyles[variant])}>
      <span className="truncate">{label}</span>
      {removable && (
        <button
          onClick={onRemove}
          disabled={disabled}
          className="ml-1 inline-flex items-center justify-center rounded p-0.5 hover:bg-black/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:hover:bg-white/10"
          aria-label={`Remove ${label}`}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export { Tag };
