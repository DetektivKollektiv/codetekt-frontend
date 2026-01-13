'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaCarouselType } from 'embla-carousel';
import { DetailEvaluationCard } from './detail-evaluation-card';
import {
  categories,
  fieldDefinitions,
  type CategoryId,
} from '@/lib/config/field-definitions';
import type { ReviewAggregationData } from '@/lib/schemas/aggregation-schemas';

interface DetailEvaluationProps {
  reviewData: ReviewAggregationData;
}

export function DetailEvaluation({ reviewData }: DetailEvaluationProps) {
  const [emblaApis, setEmblaApis] = useState<
    Record<string, EmblaCarouselType | undefined>
  >({});

  const [canScrollPrev, setCanScrollPrev] = useState<
    Record<CategoryId, boolean>
  >({} as Record<CategoryId, boolean>);
  const [canScrollNext, setCanScrollNext] = useState<
    Record<CategoryId, boolean>
  >({} as Record<CategoryId, boolean>);

  const onSelect = useCallback((categoryId: CategoryId, emblaApi: EmblaCarouselType) => {
    setCanScrollPrev((prev) => ({
      ...prev,
      [categoryId]: emblaApi.canScrollPrev(),
    }));
    setCanScrollNext((prev) => ({
      ...prev,
      [categoryId]: emblaApi.canScrollNext(),
    }));
  }, []);

  const scrollPrev = useCallback(
    (categoryId: CategoryId) => {
      emblaApis[categoryId]?.scrollPrev();
    },
    [emblaApis]
  );

  const scrollNext = useCallback(
    (categoryId: CategoryId) => {
      emblaApis[categoryId]?.scrollNext();
    },
    [emblaApis]
  );

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fallbearbeitung</h2>
          <p className="text-muted-foreground mt-1">
            So wurde der Fall nach den fünf Trust-Checking-Kriterien im Detail
            bewertet
          </p>
        </div>
        <Button variant="ghost" size="sm">
          <HelpCircle className="w-4 h-4 mr-2" />
          Hilfe
        </Button>
      </div>

      {/* Accordion with categories */}
      <Accordion type="multiple" className="space-y-4">
        {categories.map((category) => {
          const categoryIcon = category.icon;
          const hasFields = category.fieldIds.some(
            (fieldId) => reviewData.fields?.[fieldId]
          );

          if (!hasFields) return null;

          return (
            <CategoryAccordion
              key={category.id}
              category={category}
              reviewData={reviewData}
              onEmblaInit={(api) => {
                setEmblaApis((prev) => ({ ...prev, [category.id]: api }));
                if (api) {
                  api.on('select', () => onSelect(category.id, api));
                  api.on('reInit', () => onSelect(category.id, api));
                  onSelect(category.id, api);
                }
              }}
              canScrollPrev={canScrollPrev[category.id]}
              canScrollNext={canScrollNext[category.id]}
              onScrollPrev={() => scrollPrev(category.id)}
              onScrollNext={() => scrollNext(category.id)}
            />
          );
        })}
      </Accordion>
    </section>
  );
}

interface CategoryAccordionProps {
  category: (typeof categories)[number];
  reviewData: ReviewAggregationData;
  onEmblaInit: (api: EmblaCarouselType | undefined) => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  onScrollPrev: () => void;
  onScrollNext: () => void;
}

function CategoryAccordion({
  category,
  reviewData,
  onEmblaInit,
  canScrollPrev,
  canScrollNext,
  onScrollPrev,
  onScrollNext,
}: CategoryAccordionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 1 },
      '(min-width: 1024px)': { slidesToScroll: 1 },
    },
  });

  useEffect(() => {
    if (emblaApi) {
      onEmblaInit(emblaApi);
    }
  }, [emblaApi, onEmblaInit]);

  const CategoryIcon = category.icon;

  return (
    <AccordionItem
      value={category.id}
      className="border rounded-lg px-4"
    >
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-3">
          <CategoryIcon className="w-5 h-5" />
          <span className="font-semibold">{category.title}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4 pb-6">
        <div className="relative">
          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {category.fieldIds.map((fieldId) => {
                const fieldData = reviewData.fields?.[fieldId];
                if (!fieldData) return null;

                const field = fieldDefinitions[fieldId];

                return (
                  <div
                    key={fieldId}
                    className="flex-[0_0_100%] md:flex-[0_0_calc(50%-0.5rem)] lg:flex-[0_0_calc(33.333%-0.667rem)] min-w-0"
                  >
                    <DetailEvaluationCard
                      field={field}
                      fieldData={fieldData}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation buttons */}
          {category.fieldIds.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 rounded-full shadow-lg"
                onClick={onScrollPrev}
                disabled={!canScrollPrev}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 rounded-full shadow-lg"
                onClick={onScrollNext}
                disabled={!canScrollNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
