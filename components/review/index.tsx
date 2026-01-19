'use client';
import { Case } from '@/lib/queries/getCase';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { Field } from '@/lib/schemas/field-schemas';
import { resolveReviewTemplateConditions } from '@/lib/utils/condition-evaluator';
import {
  buildInProgressReviewAnswerData,
  validateFieldValue,
  validateInProgressReviewAnswer,
} from '@/lib/utils/review-validation';
import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
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

  // State for validation errors per field
  const [fieldValidationErrors, setFieldValidationErrors] = useState<
    Map<string, string>
  >(new Map());

  // Resolve all conditions to booleans
  const resolvedReviewTemplate = useMemo(
    () => resolveReviewTemplateConditions(reviewTemplateWithAnswersValues),
    [reviewTemplateWithAnswersValues]
  );

  // Automatically build InProgressReviewAnswer object whenever answers change
  const inProgressReviewAnswerData = useMemo(() => {
    const data = buildInProgressReviewAnswerData(
      reviewTemplateWithAnswersValues
    );
    console.log('Built inProgressReviewAnswerData:', data);
    return data;
  }, [reviewTemplateWithAnswersValues]);

  // Filter out questions where all fields are not shown
  const shownReviewTemplateQuestions = useMemo(
    () =>
      resolvedReviewTemplate.filter((question) =>
        question.fields.some(
          (field) => field.is_shown === true || field.is_shown === undefined
        )
      ),
    [resolvedReviewTemplate]
  );

  useEffect(() => {
    console.log(
      'Updated resolvedReviewTemplate answer values:',
      resolvedReviewTemplate
    );
  }, [resolvedReviewTemplate]);

  // Function to update answer value for a specific field
  const updateFieldValue = (
    questionId: string,
    fieldId: string,
    value: Field['answer_value']
  ) => {
    // Find the field to validate it
    const question = reviewTemplateWithAnswersValues.find(
      (q) => q.id === questionId
    );
    const field = question?.fields.find((f) => f.id === fieldId);

    if (field) {
      // Validate the new value
      const validationResult = validateFieldValue(field, value);

      if (!validationResult.success) {
        // Store validation error
        setFieldValidationErrors((prev) => {
          const next = new Map(prev);
          next.set(
            fieldId,
            validationResult.error.issues[0]?.message || 'Invalid value'
          );
          return next;
        });
        console.warn(
          'Validation error for field',
          fieldId,
          validationResult.error
        );
      } else {
        // Clear any existing validation error for this field
        setFieldValidationErrors((prev) => {
          const next = new Map(prev);
          next.delete(fieldId);
          return next;
        });
      }
    }

    // Update the value regardless of validation (for in-progress saves)
    setReviewTemplateWithAnswerValues((prev) =>
      prev.map((question) => {
        if (question.id !== questionId) return question;
        return {
          ...question,
          fields: question.fields.map((field) => {
            if (field.id !== fieldId) return field;
            console.log('Updating field value:', {
              questionId,
              fieldId,
              value,
            });
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
    const currentIndex = shownReviewTemplateQuestions.findIndex(
      (q) => q.id === currentQuestionId
    );
    return currentIndex === shownReviewTemplateQuestions.length - 1;
  }, [currentQuestionId, shownReviewTemplateQuestions]);

  const currentQuestion = useMemo(
    () =>
      shownReviewTemplateQuestions.find(
        (item) => item.id === currentQuestionId
      ) || shownReviewTemplateQuestions[0],
    [currentQuestionId, shownReviewTemplateQuestions]
  );

  // Build the fields with headers inserted where needed
  const renderFieldsWithHeaders = (): ReactNode[] => {
    const elements: ReactNode[] = [];
    let previousFieldType: string | null = null;

    currentQuestion.fields.forEach((field) => {
      // Check if we need to show header before this traffic-light field
      // Show header if: this is traffic-light AND previous was not traffic-light (or is first)
      if (field.is_shown === false) {
        return; // Skip fields that are not shown
      }

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
    const currentIndex = shownReviewTemplateQuestions.findIndex(
      (q) => q.id === currentQuestionId
    );
    if (currentIndex < shownReviewTemplateQuestions.length - 1) {
      const nextQuestionId = shownReviewTemplateQuestions[currentIndex + 1].id;
      setCurrentQuestionId(nextQuestionId);
    }
  };

  // Handler to save in-progress review (Step 2: will send to server)
  const handleSaveInProgress = () => {
    console.log('=== SAVE IN PROGRESS ===');
    console.log('Data to save:', inProgressReviewAnswerData);

    // Validate the complete data
    const validationResult = validateInProgressReviewAnswer(
      inProgressReviewAnswerData
    );

    if (validationResult.success) {
      console.log('✓ Validation successful');
      console.log('Validated data:', validationResult.data);
      // TODO Step 2: Send to server
      // await saveToReviewAnswersInProgress(validationResult.data);
    } else {
      console.error('✗ Validation failed:', validationResult.error);
    }

    // Log any field-level validation errors
    if (fieldValidationErrors.size > 0) {
      console.warn(
        'Field validation errors:',
        Object.fromEntries(fieldValidationErrors)
      );
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
            reviewTemplateQuestions={shownReviewTemplateQuestions}
            currentItemId={currentQuestionId}
            onItemClick={setCurrentQuestionId}
          />
        </div>
      </div>
      <QuestionCard
        question={currentQuestion}
        onSave={handleSaveInProgress}
        footer={
          <div className="flex flex-col w-full gap-2">
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
