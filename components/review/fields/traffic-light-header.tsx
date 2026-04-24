'use client';

import { cn } from '@/lib/utils';
import { CircleMinus } from 'lucide-react';
import { FC } from 'react';
import {
  TrafficLightTooltip,
  TrafficLightTooltipValue,
} from './traffic-light-tooltip';

interface TrafficLightHeaderProps {
  className?: string;
}

const trafficLightHeaderItems: {
  value: TrafficLightTooltipValue;
  className: string;
}[] = [
  { value: 0, className: 'bg-brand-green' },
  { value: 1, className: 'bg-brand-yellow' },
  { value: 2, className: 'bg-brand-orange' },
  { value: 3, className: 'bg-destructive' },
];

export const TrafficLightHeader: FC<TrafficLightHeaderProps> = ({
  className,
}) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between md:justify-end gap-0 border-b pb-4">
        <div className="flex gap-2 justify-between md:justify-end w-full md:w-auto">
          {trafficLightHeaderItems.map((item) => (
            <TrafficLightTooltip key={item.value} value={item.value}>
              <span
                tabIndex={0}
                className={cn(
                  'block size-6 md:size-5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                  item.className,
                )}
              />
            </TrafficLightTooltip>
          ))}

          <TrafficLightTooltip value={4}>
            <CircleMinus
              tabIndex={0}
              className="size-6 md:size-5 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </TrafficLightTooltip>
        </div>
      </div>
    </div>
  );
};
