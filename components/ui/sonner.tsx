'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-brand-green" />,
        info: <InfoIcon className="size-4 text-brand-purple" />,
        warning: <TriangleAlertIcon className="size-4 text-brand-yellow" />,
        error: <OctagonXIcon className="size-4 text-brand-red" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': '#FFFFFF',
          '--normal-text': '#140735',
          '--normal-border': '#D0D3E2',
          '--border-radius': '0.5rem',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
