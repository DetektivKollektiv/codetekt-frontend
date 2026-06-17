'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Share2 } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from './button';
// import { SharePopUp } from './share-pop-up';

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

// const isMobileShareDevice = () => {
//   const nav = navigator as Navigator & {
//     userAgentData?: { mobile?: boolean };
//   };
//
//   return (
//     nav.userAgentData?.mobile === true ||
//     window.matchMedia('(hover: none) and (pointer: coarse)').matches
//   );
// };

export interface ShareButtonProps
  extends
    Omit<React.ComponentPropsWithoutRef<typeof Button>, 'variant'>,
    VariantProps<typeof shareButtonVariants> {
  caseId: string;
  showText?: boolean;
}

const ShareButton = React.forwardRef<HTMLButtonElement, ShareButtonProps>(
  (
    {
      className,
      theme,
      caseId,
      showText = true,
      size = 'sm',
      onClick,
      ...props
    },
    ref,
  ) => {
    // const [open, setOpen] = React.useState(false);

    const getShareUrl = React.useCallback(
      () => `${window.location.origin}/archive/${caseId}`,
      [caseId],
    );

    const copyShareUrl = async (url: string) => {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link zum Fall wurde in die Zwischenablage kopiert!');
        // setOpen(false);
      } catch {
        toast.error('Fehler beim Kopieren des Links in die Zwischenablage.');
      }
    };

    const handleLinkShare = async () => {
      const shareData: ShareData = {
        title: 'Fall',
        text: 'Schau dir diesen codetekt Fall an.',
        url: getShareUrl(),
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
          // setOpen(false);
        } catch (err) {
          if (err instanceof Error && err.name !== 'AbortError') {
            await copyShareUrl(shareData.url!);
          }
        }
      } else {
        await copyShareUrl(shareData.url!);
      }
    };

    const handleTriggerClick = async (
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
      onClick?.(event);

      if (event.defaultPrevented) {
        return;
      }

      // if (isMobileShareDevice()) {
      //   setOpen(true);
      //   return;
      // }

      await handleLinkShare();
    };

    return (
      <>
        <Button
          ref={ref}
          variant="outline"
          size={size}
          className={cn(shareButtonVariants({ theme }), className)}
          onClick={handleTriggerClick}
          {...props}
        >
          <Share2 data-icon="inline-start" />
          {showText && 'Fall teilen'}
        </Button>
        {/*
        <SharePopUp
          caseId={caseId}
          open={open}
          onOpenChange={setOpen}
          onLinkShare={handleLinkShare}
          getShareUrl={getShareUrl}
        />
        */}
      </>
    );
  },
);
ShareButton.displayName = 'ShareButton';

export { ShareButton };
