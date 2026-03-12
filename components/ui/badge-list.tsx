'use client';

import { capitalizeFirstLetter } from '@/lib/utils/capitalize-first-letter';

import { Badge } from './badge';

export function BadgeList({
  category,
  keywords,
}: {
  category?: string;
  keywords: string[];
}) {
  return (
    <div className="overflow-hidden relative pb-px flex-shrink-0">
      <div className="flex flex-wrap gap-2 h-7">
        {category && (
          <>
            <Badge variant="default">
              <div className="text-body-sm whitespace-normal font-bold">
                {capitalizeFirstLetter(category)}
              </div>
            </Badge>
            {keywords.length > 0 && <div>•</div>}
          </>
        )}
        {keywords.map((keyword, idx) => (
          <Badge key={idx} variant="outline">
            <div className="text-body-sm whitespace-nowrap">{keyword}</div>
          </Badge>
        ))}
      </div>
    </div>
  );
}
