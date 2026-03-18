import { cva, type VariantProps } from 'class-variance-authority';
import { HelpCircle } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

const helpButtonVariants = cva('', {
  variants: {
    theme: {
      light: 'text-foreground hover:bg-accent',
      dark: 'text-neutral-0 hover:bg-white/10 hover:text-neutral-0',
    },
  },
  defaultVariants: {
    theme: 'light',
  },
});

export interface HelpButtonProps
  extends
    Omit<React.ComponentPropsWithoutRef<typeof Button>, 'variant'>,
    VariantProps<typeof helpButtonVariants> {
  href?: string;
}

const HelpButton = React.forwardRef<HTMLButtonElement, HelpButtonProps>(
  ({ className, theme, size = 'sm', href, ...props }, ref) => {
    const isExternalLink = href ? /^https?:\/\//.test(href) : false;
    const sharedClassName = cn(
      helpButtonVariants({ theme }),
      className,
      'text-body-sm hover:opacity-40',
    );

    const buttonContent = href ? (
      <Button
        asChild
        variant="ghost"
        size={size}
        className={sharedClassName}
        {...props}
      >
        <Link
          href={href}
          target={isExternalLink ? '_blank' : undefined}
          rel={isExternalLink ? 'noopener noreferrer' : undefined}
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Hilfe
        </Link>
      </Button>
    ) : (
      <Button
        ref={ref}
        variant="ghost"
        size={size}
        className={sharedClassName}
        {...props}
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        Hilfe
      </Button>
    );

    const tooltipWrappedButton = (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent>
          <p>Hilfe ist auf dem Weg!</p>
        </TooltipContent>
      </Tooltip>
    );

    return tooltipWrappedButton;
  },
);
HelpButton.displayName = 'HelpButton';

export { HelpButton, helpButtonVariants };
