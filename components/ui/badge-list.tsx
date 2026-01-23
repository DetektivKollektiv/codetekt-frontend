'use client';

import { capitalizeFirstLetter } from '@/lib/utils/capitalize-first-letter';

import { Badge } from './badge';

export function BadgeList({
  contentType,
  keywordType,
}: {
  contentType: string[];
  keywordType: string[];
}) {
  return (
    <div className="overflow-hidden relative pb-px flex-shrink-0">
      <div className="flex flex-wrap gap-2 h-7">
        {contentType[0] && (
          <Badge variant="default">
            <div className="text-body-sm whitespace-normal">
              {capitalizeFirstLetter(contentType[0])}
            </div>
          </Badge>
        )}
        {keywordType.map((keyword, idx) => (
          <Badge key={idx} variant="outline">
            <div className="text-body-sm whitespace-nowrap">
              {capitalizeFirstLetter(keyword)}
            </div>
          </Badge>
        ))}
      </div>
    </div>
  );
}
