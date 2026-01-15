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
              <HelpCircle className="size-6 md:size-5 text-brand-green" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium text-body-md">Stimme voll zu</p>
              <p className="text-body-sm opacity-80">
                Die Aussage trifft vollständig zu.
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Stimme eher zu */}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="size-6 md:size-5 text-brand-yellow" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium text-body-md">Stimme eher zu</p>
              <p className="text-body-sm opacity-80">
                Die Aussage trifft überwiegend zu.
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Stimme eher nicht zu */}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="size-6 md:size-5 text-brand-orange" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium text-body-md">Stimme eher nicht zu</p>
              <p className="text-body-sm opacity-80">
                Die Aussage trifft eher nicht zu.
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Stimme nicht zu */}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="size-6 md:size-5 text-brand-coral" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium text-body-md">Stimme nicht zu</p>
              <p className="text-body-sm opacity-80">
                Die Aussage trifft nicht zu.
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <CircleMinus className="size-6 md:size-5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium text-body-md">Keine Antwort</p>
              <p className="text-body-sm opacity-80">
                Es wurde keine Antwort gegeben.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
