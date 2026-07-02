'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpButton } from '@/components/ui/help-button';
import type { ReviewAggregationData } from '@/lib/schemas/aggregation-schemas';
import {
  getFieldsWithHighestIndex,
  getRatingStyle,
} from '@/lib/utils/rating-helpers';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import dynamic from 'next/dynamic';
import { DetailEvaluationCarousel } from './detail-evaluation-carousel';
import { DetailTextEvaluation } from './detail-text-evaluation';
import { DetailTrafficLightEvaluation } from './detail-traffic-light-evaluation';

interface DetailEvaluationProps {
  reviewData: ReviewAggregationData;
}

type TextEvaluationField = Extract<
  ReviewAggregationData['questions'][number]['fields'][number],
  { type: 'text' | 'text-area' }
>;

export function DetailEvaluation({ reviewData }: DetailEvaluationProps) {
  return (
    <section className="space-y-6 page-max-w">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fallbearbeitung</h2>
          <p className="text-muted-foreground mt-1">
            So wurde der Fall nach den fünf Trust-Checking-Kriterien im Detail
            gecheckt
          </p>
        </div>
        <HelpButton theme="light" href='https://codetekt.org/informationen/die-codetekt-trust-checking-plattform-erklart#archiv' />
      </div>

      <Accordion type="multiple" className="space-y-4">
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
                  <NewIcon
                    className={`${getRatingStyle(question.score).textClass}`}
                  />
                  <span
                    className={`font-semibold ${getRatingStyle(question.score).textClass}`}
                  >
                    {question.metadata.title}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-6">
                <DetailEvaluationCarousel
                  options={{
                    align: 'start',
                    slidesToScroll: 1,
                    dragFree: false,
                  }}
                >
                  {[...question.fields]
                    .sort((a, b) => {
                      const aAvg = 'average' in a ? a.average : -Infinity;
                      const bAvg = 'average' in b ? b.average : -Infinity;
                      return bAvg - aAvg;
                    })
                    .map((field) => {
                      const fieldsWithHighestIndex = getFieldsWithHighestIndex(
                        question.fields,
                      );

                      if (field.type === 'traffic-light') {
                        return (
                          <DetailTrafficLightEvaluation
                            field={field}
                            key={field.id}
                            highlightHeader={fieldsWithHighestIndex.has(
                              field.id,
                            )}
                          />
                        );
                      }

                      return null;
                    })}
                </DetailEvaluationCarousel>
                <div className="mt-4">
                  {[...question.fields]
                    .filter(
                      (field): field is TextEvaluationField =>
                        field.type === 'text' || field.type === 'text-area',
                    )
                    .map((field) => {
                      return (
                        <DetailTextEvaluation field={field} key={field.id} />
                      );
                    })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}
