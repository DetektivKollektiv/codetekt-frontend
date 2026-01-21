'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpButton } from '@/components/ui/help-button';
import type { ReviewAggregationData } from '@/lib/schemas/aggregation-schemas';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import dynamic from 'next/dynamic';
import { DetailEvaluationCard } from './detail-evaluation-card';
import { DetailEvaluationCarousel } from './detail-evaluation-carousel';

interface DetailEvaluationProps {
  reviewData: ReviewAggregationData;
}

export function DetailEvaluation({ reviewData }: DetailEvaluationProps) {
  return (
    <section className="space-y-6 page-max-w">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fallbearbeitung</h2>
          <p className="text-muted-foreground mt-1">
            So wurde der Fall nach den fünf Trust-Checking-Kriterien im Detail
            bewertet
          </p>
        </div>
        <HelpButton theme="light" />
      </div>

      {/* Accordion with categories */}
      <Accordion
        type="single"
        className="space-y-4"
        defaultValue={reviewData.questions[0]?.id}
      >
        {reviewData.questions.map((question) => {
          const hasFields = question.fields && question.fields.length > 0;

          if (!hasFields) return null;
          const NewIcon = dynamic(
            dynamicIconImports[
              (question.metadata.icon as keyof typeof dynamicIconImports) ||
                'badge'
            ],
            {
              ssr: false,
            },
          );

          return (
            <AccordionItem
              value={question.id}
              className="border rounded-lg px-4 relative overflow-hidden last:border-b"
              key={question.id}
              id={`accordion-content-${question.id}`}
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <NewIcon />
                  <span className="font-semibold">
                    {question.metadata.title}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <DetailEvaluationCarousel
                  options={{
                    align: 'start',
                    slidesToScroll: 1,
                    dragFree: false,
                  }}
                  showNavigation={question.fields.length > 0}
                  portalContainerId={`accordion-content-${question.id}`}
                >
                  {question.fields.map((field) => {
                    return <DetailEvaluationCard field={field} />;
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
