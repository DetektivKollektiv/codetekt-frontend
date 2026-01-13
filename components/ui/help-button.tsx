import { cva, type VariantProps } from 'class-variance-authority';
import { HelpCircle } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { Button } from './button';

const helpButtonVariants = cva('', {
  variants: {
    theme: {
      light: 'text-foreground hover:bg-accent',
      dark: 'text-white hover:bg-white/10 hover:text-white',
    },
  },
  defaultVariants: {
    theme: 'light',
  },
});

export interface HelpButtonProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Button>, 'variant'>,
    VariantProps<typeof helpButtonVariants> {
  href?: string;
}

const HelpButton = React.forwardRef<HTMLButtonElement, HelpButtonProps>(
  ({ className, theme, href = '/help', size = 'sm', ...props }, ref) => {
    const buttonContent = (
      <Button
        ref={ref}
        variant="ghost"
        size={size}
        className={cn(helpButtonVariants({ theme }), className)}
        {...props}
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        Hilfe
      </Button>
    );

    if (href) {
      return <Link href={href}>{buttonContent}</Link>;
    }

    return buttonContent;
  }
);
HelpButton.displayName = 'HelpButton';

export { HelpButton, helpButtonVariants };
