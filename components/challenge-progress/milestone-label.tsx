import SafeRichText from '@/components/safe-rich-text';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ChallengeMilestoneData } from '@/lib/schemas';
import { cn } from '@/lib/utils';

const milestoneBurstClipPath =
  'polygon(50% 0%, 58% 10%, 70% 4%, 73% 18%, 86% 15%, 85% 30%, 98% 35%, 89% 46%, 100% 56%, 87% 64%, 94% 78%, 79% 79%, 78% 94%, 64% 88%, 54% 100%, 46% 89%, 32% 97%, 28% 83%, 14% 85%, 16% 70%, 2% 65%, 11% 54%, 0% 44%, 13% 36%, 6% 22%, 21% 21%, 22% 6%, 36% 12%)';

interface MilestoneLabelProps {
  achieved: boolean;
  className?: string;
  milestone: ChallengeMilestoneData;
}

export function MilestoneLabel({
  achieved,
  className,
  milestone,
}: MilestoneLabelProps) {
  const label = (
    <>
      <span className="text-[1.75rem] font-black leading-none tabular-nums">
        {milestone.value}
      </span>
      <span className="mt-1 text-meta font-black uppercase leading-none">
        Fälle
      </span>
    </>
  );

  if (!achieved) {
    return (
      <div className="hidden size-[5.5rem] flex-col items-center justify-center text-neutral-0 md:flex">
        {label}
        {milestone.label ? (
          milestone.tooltip ? (
            <Tooltip>
              <TooltipTrigger
                type="button"
                className="mt-2 rounded-full bg-brand-coral px-2 py-1 text-meta font-bold leading-none text-brand-darkblue"
              >
                {milestone.label}
              </TooltipTrigger>
              <TooltipContent
                side="top"
                sideOffset={8}
                className="max-w-64 text-center"
              >
                <SafeRichText
                  value={milestone.tooltip}
                  className="[&_a]:text-background [&_p]:m-0"
                />
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="mt-2 rounded-full bg-brand-coral px-2 py-1 text-meta font-bold leading-none text-brand-darkblue">
              {milestone.label}
            </span>
          )
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'hidden size-[5.5rem] items-center justify-center bg-brand-yellow md:flex',
        className,
      )}
      style={{ clipPath: milestoneBurstClipPath }}
    >
      <div className="flex size-[4.25rem] flex-col items-center justify-center rounded-full bg-brand-darkblue text-neutral-0">
        {label}
      </div>
    </div>
  );
}
