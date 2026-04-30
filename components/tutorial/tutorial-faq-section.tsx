'use client';

import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';
import SafeRichText from '@/components/safe-rich-text';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { TutorialContentData } from '@/lib/schemas';
import { TutorialSection } from './tutorial-section';

interface TutorialFaqSectionProps {
  faqItems: TutorialContentData['faqItems'];
}

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, ' ');

export function TutorialFaqSection({ faqItems }: TutorialFaqSectionProps) {
  const [searchInput, setSearchInput] = useState('');

  const fuse = useMemo(
    () =>
      new Fuse(faqItems, {
        keys: [
          { name: 'title', weight: 0.7 },
          { name: 'answerHtml', weight: 0.3 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
        getFn: (item, path) => {
          const value = item[path as keyof typeof item];
          return path === 'answerHtml' && typeof value === 'string'
            ? stripHtml(value)
            : value;
        },
      }),
    [faqItems],
  );

  const filteredItems = useMemo(() => {
    if (!searchInput.trim()) {
      return faqItems;
    }

    return fuse.search(searchInput.trim()).map((result) => result.item);
  }, [faqItems, fuse, searchInput]);

  return (
    <TutorialSection
      title="Häufige Fragen"
      description="Suche nach Antworten und öffne mehrere Fragen gleichzeitig."
    >
      <div className="flex flex-col gap-4">
        <Input
          type="text"
          placeholder="FAQ durchsuchen..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="w-full md:max-w-96"
        />
        <Accordion type="multiple" className="flex flex-col gap-4">
          {filteredItems.map((item) => (
            <AccordionItem
              value={item.id}
              className="overflow-hidden rounded-lg border px-4 last:border-b"
              key={item.id}
            >
              <AccordionTrigger className="hover:no-underline">
                <span className="text-left font-semibold">{item.title}</span>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-6">
                <SafeRichText
                  value={item.answerHtml}
                  className="text-body-md text-muted-foreground"
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </TutorialSection>
  );
}
