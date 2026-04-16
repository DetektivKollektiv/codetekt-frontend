'use client';

import { sanitizeRichText } from '@/lib/utils/sanitize-rich-text';
import { FC, useMemo } from 'react';

interface SafeRichTextProps {
  value: string;
}

const SafeRichText: FC<SafeRichTextProps> = ({ value }) => {
  const sanitizedHtml = useMemo(() => sanitizeRichText(value), [value]);

  return (
    <div
      className="[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default SafeRichText;
