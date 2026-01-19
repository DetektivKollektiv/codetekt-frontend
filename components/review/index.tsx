'use client';
import { Case } from '@/lib/queries/getCase';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { saveReviewAnswersInProgressMutation } from '@/lib/queries/saveReviewAnswersInProgress';
import { createClient } from '@/lib/supabase/client';
import { getAuth } from '@/lib/supabase/getAuth';
import { resolveReviewTemplateConditions } from '@/lib/utils/condition-evaluator';
import {
  buildInProgressReviewAnswerData,
  validateInProgressReviewAnswer,
} from '@/lib/utils/review-validation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import CaseCard from './case-card';
import { useReviewState } from './hooks/useReviewState';
import { useUnsavedChangesWarning } from './hooks/useUnsavedChangesWarning';
import QuestionCard from './question-card';
import ReviewNavigation from './review-navigation';
import { renderFieldsWithHeaders } from './utils/render-fields';

interface ReviewProps {
  reviewTemplate: NonNullable<ReviewTemplate>;
  case: NonNullable<Case>;
}

const Review: FC<ReviewProps> = ({ reviewTemplate, case: caseData }) => {
  const supabase = createClient();

  // Auth context
  const { data: authData } = useQuery({
    queryFn: () => getAuth(supabase),
    queryKey: ['auth'],
  });

  const userId = authData?.user?.id;

  // Review state management
  const {
    reviewTemplateWithAnswersValues,
    fieldValidationErrors,
    updateFieldValue,
  } = useReviewState(reviewTemplate);

  const [currentQuestionId, setCurrentQuestionId] = useState(
    reviewTemplate[0].id
  );

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

    return data;
  }, [reviewTemplateWithAnswersValues]);

  // Unsaved changes warning
  const { hasUnsavedChanges, markAsSaved } = useUnsavedChangesWarning({
    data: inProgressReviewAnswerData,
  });

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

  const setNextQuestion = () => {
    const currentIndex = shownReviewTemplateQuestions.findIndex(
      (q) => q.id === currentQuestionId
    );
    if (currentIndex < shownReviewTemplateQuestions.length - 1) {
      const nextQuestionId = shownReviewTemplateQuestions[currentIndex + 1].id;
      setCurrentQuestionId(nextQuestionId);
    }
  };

  // Handler to save in-progress review
  const { mutate: saveInProgress, isPending: isSaving } = useMutation({
    ...saveReviewAnswersInProgressMutation(supabase),
    onSuccess: (result) => {
      toast.success('Entwurf gespeichert');
      console.log('✓ Saved successfully:', result);

      // Mark data as saved
      markAsSaved();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Speichern');
      console.error('✗ Save failed:', error);
    },
  });

  const handleSaveInProgress = () => {
    console.log('=== SAVE IN PROGRESS ===');
    console.log('Data to save:', inProgressReviewAnswerData);

    // Validate the complete data
    const validationResult = validateInProgressReviewAnswer(
      inProgressReviewAnswerData
    );

    if (!validationResult.success) {
      console.error('✗ Validation failed:', validationResult.error);
      toast.error('Validierungsfehler beim Speichern');
      return;
    }

    // Check if user is authenticated
    if (!userId) {
      toast.error('Du musst angemeldet sein, um zu speichern');
      return;
    }

    console.log('✓ Validation successful');
    console.log('Validated data:', validationResult.data);

    // Log any field-level validation errors
    if (fieldValidationErrors.size > 0) {
      console.warn(
        'Field validation errors:',
        Object.fromEntries(fieldValidationErrors)
      );
    }

    // Save to server
    saveInProgress({
      case_id: caseData.id,
      reviewed_by: userId,
      data: validationResult.data,
    });
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
        {renderFieldsWithHeaders({
          currentQuestion,
          onFieldChange: updateFieldValue,
        })}
      </QuestionCard>
    </div>
  );
};

export default Review;
