'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { categories, fieldDefinitions } from '@/lib/config/field-definitions';
import type { ReviewAggregationData } from '@/lib/schemas/aggregation-schemas';
import { HelpCircle } from 'lucide-react';
import { DetailEvaluationCard } from './detail-evaluation-card';
import { DetailEvaluationCarousel } from './detail-evaluation-carousel';

interface DetailEvaluationProps {
  reviewData: ReviewAggregationData;
}

export function DetailEvaluation({ reviewData }: DetailEvaluationProps) {
  return (
    <section className="space-y-6 ">
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
      <Accordion type="single" className="space-y-4">
        {categories.map((category) => {
          const hasFields = category.fieldIds.some(
            (fieldId) => reviewData.fields?.[fieldId]
          );
          const CategoryIcon = category.icon;
          const hasMultipleFields = category.fieldIds.length > 1;

          if (!hasFields) return null;

          return (
            <AccordionItem
              value={category.id}
              className="border rounded-lg px-4 relative overflow-hidden last:border-b"
              key={category.id}
              id={`accordion-content-${category.id}`}
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <CategoryIcon className="w-5 h-5" />
                  <span className="font-semibold">{category.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <DetailEvaluationCarousel
                  options={{
                    align: 'start',
                    slidesToScroll: 1,
                    dragFree: false,
                  }}
                  showNavigation={hasMultipleFields}
                  navigationButtonsPortal={`accordion-content-${category.id}`}
                >
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
                </DetailEvaluationCarousel>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}
