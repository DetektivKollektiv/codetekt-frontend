'use client';

import { capitalizeFirstLetter } from '@/lib/utils/capitalize-first-letter';

import { useEffect, useRef, useState } from 'react';
import { Badge } from './badge';

export function BadgeList({
  contentType,
  keywordType,
}: {
  contentType: string[];
  keywordType: string[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(keywordType.length);

  useEffect(() => {
    const container = containerRef.current;
    const measureContainer = measureRef.current;
    if (!container || !measureContainer) return;

    const updateVisible = () => {
      const children = Array.from(measureContainer.children) as HTMLElement[];
      const containerWidth = container.offsetWidth;
      let totalWidth = 0;
      let count = 0;

      for (const child of children) {
        const gap = 8; // gap-2 = 0.5rem = 8px
        totalWidth += child.offsetWidth + gap;

        if (totalWidth <= containerWidth + gap) {
          count++;
        } else {
          break;
        }
      }

      setVisibleCount(count - (contentType[0] ? 1 : 0));
    };

    const resizeObserver = new ResizeObserver(updateVisible);
    resizeObserver.observe(container);
    updateVisible();

    return () => resizeObserver.disconnect();
  }, [contentType, keywordType]);

  return (
    <>
      {/* Hidden measurement container with ALL badges */}
      <div
        ref={measureRef}
        className="flex gap-2 absolute invisible pointer-events-none"
        aria-hidden="true"
      >
        {contentType[0] && (
          <Badge variant="default">
            <div className="text-body-sm">
              {capitalizeFirstLetter(contentType[0])}
            </div>
          </Badge>
        )}
        {keywordType.map((keyword, idx) => (
          <Badge key={`measure-${idx}`} variant="outline">
            <div className="text-body-sm">{capitalizeFirstLetter(keyword)}</div>
          </Badge>
        ))}
      </div>

      {/* Visible container */}
      <div ref={containerRef} className="flex flex-wrap gap-2">
        {contentType[0] && (
          <Badge variant="default">
            <div className="text-body-sm">
              {capitalizeFirstLetter(contentType[0])}
            </div>
          </Badge>
        )}
        {keywordType.slice(0, visibleCount).map((keyword, idx) => (
          <Badge key={idx} variant="outline">
            <div className="text-body-sm">{capitalizeFirstLetter(keyword)}</div>
          </Badge>
        ))}
      </div>
    </>
  );
}
