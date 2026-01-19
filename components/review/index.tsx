'use client';
import { Case } from '@/lib/queries/getCase';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { Field } from '@/lib/schemas/field-schemas';
import { FC, ReactNode, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import CaseCard from './case-card';
import { ChipField } from './fields/chip-field';
import { LikertScaleField } from './fields/likert-scale-field';
import { MultiLineTextField } from './fields/multi-line-text-field';
import { TextAreaField } from './fields/text-area-field';
import { TextField } from './fields/text-field';
import { TrafficLightField } from './fields/traffic-light-field';
import { TrafficLightHeader } from './fields/traffic-light-header';
import QuestionCard from './question-card';
import ReviewNavigation from './review-navigation';

interface ReviewProps {
  reviewTemplate: NonNullable<ReviewTemplate>;
  case: NonNullable<Case>;
}

const Review: FC<ReviewProps> = ({ reviewTemplate, case: caseData }) => {
  // Initialize answer_value from initial_answer_value on mount
  const initializeAnswerValues = (
    template: NonNullable<ReviewTemplate>
  ): NonNullable<ReviewTemplate> => {
    return template.map((question) => ({
      ...question,
      fields: question.fields.map((field) => ({
        ...field,
        answer_value: field.initial_answer_value ?? field.answer_value,
      })) as typeof question.fields,
    })) as NonNullable<ReviewTemplate>;
  };

  const [reviewTemplateWithAnswersValues, setReviewTemplateWithAnswerValues] =
    useState(() => initializeAnswerValues(reviewTemplate));

  const [currentQuestionId, setCurrentQuestionId] = useState(
    reviewTemplate[0].id
  );

  // Function to update answer value for a specific field
  const updateFieldValue = (
    questionId: string,
    fieldId: string,
    value: Field['answer_value']
  ) => {
    setReviewTemplateWithAnswerValues((prev) =>
      prev.map((question) => {
        if (question.id !== questionId) return question;
        return {
          ...question,
          fields: question.fields.map((field) => {
            if (field.id !== fieldId) return field;
            return {
              ...field,
              answer_value: value,
            } as typeof field;
          }),
        };
      })
    );
  };

  const isLastQuestion = useMemo(() => {
    const currentIndex = reviewTemplateWithAnswersValues.findIndex(
      (q) => q.id === currentQuestionId
    );
    return currentIndex === reviewTemplateWithAnswersValues.length - 1;
  }, [currentQuestionId, reviewTemplateWithAnswersValues]);

  const currentQuestion = useMemo(
    () =>
      reviewTemplateWithAnswersValues.find(
        (item) => item.id === currentQuestionId
      ) || reviewTemplateWithAnswersValues[0],
    [currentQuestionId, reviewTemplateWithAnswersValues]
  );

  const reviewTemplateNavigationQuestions = useMemo(
    () => reviewTemplateWithAnswersValues.filter((item) => item),
    [reviewTemplateWithAnswersValues]
  );

  // Build the fields with headers inserted where needed
  const renderFieldsWithHeaders = (): ReactNode[] => {
    const elements: ReactNode[] = [];
    let previousFieldType: string | null = null;

    currentQuestion.fields.forEach((field) => {
      // Check if we need to show header before this traffic-light field
      // Show header if: this is traffic-light AND previous was not traffic-light (or is first)
      if (
        field.type === 'traffic-light' &&
        previousFieldType !== 'traffic-light'
      ) {
        elements.push(
          <TrafficLightHeader key={`header-${field.id}`} className="mb-4" />
        );
      }

      // Handler function for this field
      const handleChange = (value: Field['answer_value']) => {
        updateFieldValue(currentQuestion.id, field.id, value);
      };

      // Render the field based on its type
      if (field.type === 'multi-line-text') {
        elements.push(
          <MultiLineTextField
            key={field.id}
            field={field}
            onChange={handleChange}
          />
        );
      } else if (field.type === 'chip') {
        elements.push(
          <ChipField key={field.id} field={field} onChange={handleChange} />
        );
      } else if (field.type === 'traffic-light') {
        elements.push(
          <TrafficLightField
            key={field.id}
            field={field}
            onChange={handleChange}
          />
        );
      } else if (field.type === 'likert-scale') {
        elements.push(
          <LikertScaleField
            key={field.id}
            field={field}
            onChange={handleChange}
          />
        );
      } else if (field.type === 'text-area') {
        elements.push(
          <TextAreaField key={field.id} field={field} onChange={handleChange} />
        );
      } else if (field.type === 'text') {
        elements.push(
          <TextField key={field.id} field={field} onChange={handleChange} />
        );
      }

      previousFieldType = field.type;
    });

    return elements;
  };

  const setNextQuestion = () => {
    const currentIndex = reviewTemplateWithAnswersValues.findIndex(
      (q) => q.id === currentQuestionId
    );
    if (currentIndex < reviewTemplateWithAnswersValues.length - 1) {
      const nextQuestionId =
        reviewTemplateWithAnswersValues[currentIndex + 1].id;
      setCurrentQuestionId(nextQuestionId);
    }
  };

  return (
    <div
      className="page-max-w lg:grid lg:gap-6"
      style={{
        gridTemplateColumns: '300px 1fr ',
      }}
    >
      <div>
        <CaseCard case={caseData} />
        <div className="my-4 lg:my-0 lg:mt-4">
          <ReviewNavigation
            reviewTemplateQuestions={reviewTemplateNavigationQuestions}
            currentItemId={currentQuestionId}
            onItemClick={setCurrentQuestionId}
          />
        </div>
      </div>
      <QuestionCard
        question={currentQuestion}
        footer={
          <div className="flex flex-col w-full gap-2">
            <Button variant="destructive" className="w-full">
              Einspruch gegen Antworten erheben
            </Button>
            {isLastQuestion ? (
              <Button variant="default" className="w-full">
                Fall abschließen
              </Button>
            ) : (
              <Button
                variant="default"
                className="w-full"
                onClick={setNextQuestion}
              >
                Nächste Frage
              </Button>
            )}
          </div>
        }
      >
        {renderFieldsWithHeaders()}
      </QuestionCard>
    </div>
  );
};

export default Review;
