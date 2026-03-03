'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CircleMinus, HelpCircle } from 'lucide-react';
import { FC } from 'react';

interface TrafficLightHeaderProps {
  className?: string;
}

export const TrafficLightHeader: FC<TrafficLightHeaderProps> = ({
  className,
}) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between md:justify-end gap-0 border-b pb-4">
        <div className="flex space-x-2 justify-between md:justify-end w-full md:w-auto ">
          {/* Stimme voll zu */}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle
                className="size-6 md:size-5 text-brand-green"
                strokeWidth={2.5}
              />
            </TooltipTrigger>
            <TooltipContent className="max-w-48 text-center">
              <p className="text-body-sm opacity-80">
                Trifft zu bzw. hat keinen negativen Einfluss auf die
                Vertrauenswürdigkeit des Falls
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Stimme eher zu */}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle
                className="size-6 md:size-5 text-brand-yellow"
                strokeWidth={2.5}
              />
            </TooltipTrigger>
            <TooltipContent className="max-w-48 text-center">
              <p className="text-body-sm opacity-80">
                Trifft nicht zu, aber hat einen geringen Einfluss auf die
                Vertrauenswürdigkeit des Falls
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Stimme eher nicht zu */}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle
                className="size-6 md:size-5 text-brand-orange"
                strokeWidth={2.5}
              />
            </TooltipTrigger>
            <TooltipContent className="max-w-48 text-center">
              <p className="text-body-sm opacity-80">
                Trifft nicht zu und hat erheblichen Einfluss auf die
                Vertrauenswürdigkeit des Falls
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Stimme nicht zu */}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle
                className="size-6 md:size-5 text-brand-coral"
                strokeWidth={2.5}
              />
            </TooltipTrigger>
            <TooltipContent className="max-w-48 text-center">
              <p className="text-body-sm opacity-80">
                Trifft nicht zu und lässt den ganzen Fall nicht vertrauenswürdig
                wirken.
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <CircleMinus className="size-6 md:size-5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-48 text-center">
              <p className="text-body-sm opacity-80">Frage nicht anwendbar</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
