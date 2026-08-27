'use client';

import SafeRichText from '@/components/safe-rich-text';
import { Button } from '@/components/ui/button';
import type { ChallengeProgress } from '@/lib/queries/getChallengeProgress';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

interface ChallengeInformationSectionProps {
  information: NonNullable<ChallengeProgress['information']>;
}

export function ChallengeInformationSection({
  information,
}: ChallengeInformationSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      id="challenge-information"
      aria-labelledby="challenge-information-heading"
    >
      <div className="flex max-w-4xl flex-col gap-3">
        <h3
          id="challenge-information-heading"
          className="text-heading-lg font-black tracking-normal"
        >
          {information.title}
        </h3>
        <SafeRichText
          value={information.descriptionHtml}
          className="text-body-md font-medium text-brand-darkblue [&_p]:m-0"
        />
      </div>

      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="mt-6"
        aria-controls="challenge-information-content"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
      >
        {information.buttonLabel}
        <ChevronDownIcon
          data-icon="inline-end"
          className={cn(
            'transition-transform duration-200',
            isOpen ? 'rotate-180' : null,
          )}
        />
      </Button>

      {isOpen ? (
        <div
          id="challenge-information-content"
          className="mt-8 max-w-4xl"
        >
          <SafeRichText
            value={information.contentHtml}
            className="flex flex-col gap-8 text-body-md text-brand-darkblue [&_a]:font-bold [&_a]:text-brand-darkblue [&_h4]:text-heading-md [&_h4]:font-black [&_h4]:tracking-normal [&_img]:h-auto [&_img]:w-full [&_img]:object-contain [&_li>strong:first-child]:font-black [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-3 [&_p>strong:first-child]:font-black [&_section]:flex [&_section]:flex-col [&_section]:gap-4 [&_strong]:font-black [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-3"
          />
        </div>
      ) : null}
    </section>
  );
}
