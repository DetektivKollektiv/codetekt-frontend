'use client';

import { sanitizeRichText } from '@/lib/utils/sanitize-rich-text';
import { cn } from '@/lib/utils';
import { FC, useMemo } from 'react';

interface SafeRichTextProps {
  value: string;
  className?: string;
}

const SafeRichText: FC<SafeRichTextProps> = ({ value, className }) => {
  const sanitizedHtml = useMemo(() => sanitizeRichText(value), [value]);

  return (
    <div
      className={cn(
        '[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default SafeRichText;
