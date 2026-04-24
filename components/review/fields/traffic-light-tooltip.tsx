'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ReactNode } from 'react';

export const TRAFFIC_LIGHT_TOOLTIPS = {
  0: 'Trifft zu bzw. hat keinen negativen Einfluss auf die Vertrauenswürdigkeit des Falls',
  1: 'Trifft nicht zu, aber hat einen geringen Einfluss auf die Vertrauenswürdigkeit des Falls',
  2: 'Trifft nicht zu und hat erheblichen Einfluss auf die Vertrauenswürdigkeit des Falls',
  3: 'Trifft nicht zu und lässt den ganzen Fall nicht vertrauenswürdig wirken.',
  4: 'Frage nicht anwendbar/nicht sicher',
} as const;

export type TrafficLightTooltipValue = keyof typeof TRAFFIC_LIGHT_TOOLTIPS;

interface TrafficLightTooltipProps {
  value: TrafficLightTooltipValue;
  children: ReactNode;
}

export const TrafficLightTooltip = ({
  value,
  children,
}: TrafficLightTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="max-w-48 text-center">
        <p className="text-body-sm opacity-80">
          {TRAFFIC_LIGHT_TOOLTIPS[value]}
        </p>
      </TooltipContent>
    </Tooltip>
  );
};
