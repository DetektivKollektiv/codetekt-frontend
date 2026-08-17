'use client';

import { useLayoutEffect, useRef, useState } from 'react';

const BORDER_RADIUS = 14;
const BORDER_WIDTH = 4;
const TARGET_TRIANGLE_SPACING = 18;
const TANGENT_SAMPLE_DISTANCE = 0.5;

interface FrameSize {
  height: number;
  width: number;
}

interface TrianglePosition {
  rotation: number;
  x: number;
  y: number;
}

function getTrianglePositions(rect: SVGRectElement): TrianglePosition[] {
  const perimeter = rect.getTotalLength();

  if (!Number.isFinite(perimeter) || perimeter <= 0) {
    return [];
  }

  const triangleCount = Math.max(
    4,
    Math.floor(perimeter / TARGET_TRIANGLE_SPACING),
  );
  const spacing = perimeter / triangleCount;

  return Array.from({ length: triangleCount }, (_, index) => {
    const distance = (index + 0.5) * spacing;
    const point = rect.getPointAtLength(distance);
    const pointBefore = rect.getPointAtLength(
      (distance - TANGENT_SAMPLE_DISTANCE + perimeter) % perimeter,
    );
    const pointAfter = rect.getPointAtLength(
      (distance + TANGENT_SAMPLE_DISTANCE) % perimeter,
    );
    const rotation =
      (Math.atan2(
        pointAfter.y - pointBefore.y,
        pointAfter.x - pointBefore.x,
      ) *
        180) /
      Math.PI;

    return { rotation, x: point.x, y: point.y };
  });
}

export function TrustSharesFrame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<SVGRectElement>(null);
  const [frameSize, setFrameSize] = useState<FrameSize>({
    height: 0,
    width: 0,
  });
  const [trianglePositions, setTrianglePositions] = useState<
    TrianglePosition[]
  >([]);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const updateFrameSize = () => {
      const bounds = container.getBoundingClientRect();
      const nextSize = {
        height: Math.round(bounds.height),
        width: Math.round(bounds.width),
      };

      setFrameSize((currentSize) =>
        currentSize.height === nextSize.height &&
        currentSize.width === nextSize.width
          ? currentSize
          : nextSize,
      );
    };

    updateFrameSize();

    const resizeObserver = new ResizeObserver(updateFrameSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  useLayoutEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      const border = borderRef.current;

      setTrianglePositions(border ? getTrianglePositions(border) : []);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [frameSize]);

  const borderInset = BORDER_WIDTH / 2;
  const borderHeight = Math.max(0, frameSize.height - BORDER_WIDTH);
  const borderWidth = Math.max(0, frameSize.width - BORDER_WIDTH);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    >
      {frameSize.width > 0 && frameSize.height > 0 ? (
        <svg
          className="h-full w-full overflow-visible"
          focusable="false"
          preserveAspectRatio="none"
          viewBox={`0 0 ${frameSize.width} ${frameSize.height}`}
        >
          {trianglePositions.map((position, index) => (
            <path
              key={index}
              d="M -6 0 L 0 -8 L 6 0 Z"
              fill="hsl(var(--brand-darkblue))"
              transform={`translate(${position.x} ${position.y}) rotate(${position.rotation})`}
            />
          ))}
          <rect
            ref={borderRef}
            fill="none"
            height={borderHeight}
            rx={BORDER_RADIUS}
            stroke="hsl(var(--brand-yellow))"
            strokeWidth={BORDER_WIDTH}
            vectorEffect="non-scaling-stroke"
            width={borderWidth}
            x={borderInset}
            y={borderInset}
          />
        </svg>
      ) : null}
    </div>
  );
}
