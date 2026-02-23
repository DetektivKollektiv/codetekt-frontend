import { cva, type VariantProps } from 'class-variance-authority';
import { Share2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { Button } from './button';

const shareButtonVariants = cva('', {
  variants: {
    theme: {
      light: 'hover:bg-accent',
      dark: 'text-neutral-0 hover:bg-white/10 hover:text-neutral-0',
    },
  },
  defaultVariants: {
    theme: 'light',
  },
});

export interface ShareButtonProps
  extends
    Omit<React.ComponentPropsWithoutRef<typeof Button>, 'variant'>,
    VariantProps<typeof shareButtonVariants> {
  caseId: string;
}

const ShareButton = React.forwardRef<HTMLButtonElement, ShareButtonProps>(
  ({ className, theme, caseId, size = 'sm', ...props }, ref) => {
    const handleShare = async () => {
      const shareData: ShareData = {
        title: `Fall`,
        url: `${window.location.origin}/archive/${caseId}`,
      };

      // Check if Web Share API is available
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          // User cancelled or error occurred
          if (err instanceof Error && err.name !== 'AbortError') {
            // Fallback to copy to clipboard
            navigator.clipboard.writeText(shareData.url!);
          }
        }
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(shareData.url!);
      }
    };

    return (
      <Button
        ref={ref}
        variant="outline"
        size={size}
        className={cn(shareButtonVariants({ theme }), className)}
        onClick={handleShare}
        {...props}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Fall teilen
      </Button>
    );
  },
);
ShareButton.displayName = 'ShareButton';

export { ShareButton, shareButtonVariants };
