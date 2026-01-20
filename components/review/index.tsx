'use client';
import { Case } from '@/lib/queries/getCase';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { saveReviewAnswersInProgressMutation } from '@/lib/queries/saveReviewAnswersInProgress';
import { submitReviewAnswersMutation } from '@/lib/queries/submitReviewAnswers';
import { createClient } from '@/lib/supabase/client';
import { getAuth } from '@/lib/supabase/getAuth';
import { resolveReviewTemplateConditions } from '@/lib/utils/condition-evaluator';
import {
  buildInProgressReviewAnswerData,
  getQuestionsValidationState,
  validateInProgressReviewAnswer,
  validateSubmittedReviewAnswer,
} from '@/lib/utils/review-validation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { SaveAll } from 'lucide-react';
import { FC, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { HelpButton } from '../ui/help-button';
import CaseCard from './case-card';
import { useReviewState } from './hooks/useReviewState';
import { useUnsavedChangesWarning } from './hooks/useUnsavedChangesWarning';
import QuestionCard from './question-card';
import ReviewNavigation from './review-navigation';
import SuccesCard from './success-card';
import { renderFieldsWithHeaders } from './utils/render-fields';

interface ReviewProps {
  reviewTemplate: NonNullable<ReviewTemplate>;
  case: NonNullable<Case>;
  isSubmitted: boolean;
}

const Review: FC<ReviewProps> = ({
  reviewTemplate,
  case: caseData,
  isSubmitted: initialIsSubmitted,
}) => {
  const supabase = createClient();
  const [isSubmitted, setIsSubmitted] = useState(initialIsSubmitted);
  const [inProgressId, setInProgressId] = useState<string | null>(null);

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
    isSubmitted
      ? reviewTemplate[reviewTemplate.length - 1].id
      : reviewTemplate[0].id,
  );

  // Track if user has ever reached the last question (enables stricter validation)
  const [hasReachedLastQuestion, setHasReachedLastQuestion] = useState(false);

  // Resolve all conditions to booleans
  const resolvedReviewTemplate = useMemo(
    () => resolveReviewTemplateConditions(reviewTemplateWithAnswersValues),
    [reviewTemplateWithAnswersValues],
  );

  // Automatically build InProgressReviewAnswer object whenever answers change
  const inProgressReviewAnswerData = useMemo(() => {
    const data = buildInProgressReviewAnswerData(
      reviewTemplateWithAnswersValues,
    );

    return data;
  }, [reviewTemplateWithAnswersValues]);

  // Check if data is valid for final submission
  const isValidForSubmission = useMemo(() => {
    const validationResult = validateSubmittedReviewAnswer(
      inProgressReviewAnswerData,
    );
    return validationResult.success;
  }, [inProgressReviewAnswerData]);

  // Unsaved changes warning
  const { hasUnsavedChanges, markAsSaved } = useUnsavedChangesWarning({
    data: inProgressReviewAnswerData,
  });

  // Filter out questions where all fields are not shown
  const shownReviewTemplateQuestions = useMemo(
    () =>
      resolvedReviewTemplate.filter((question) =>
        question.fields.some(
          (field) => field.is_shown === true || field.is_shown === undefined,
        ),
      ),
    [resolvedReviewTemplate],
  );

  /* useEffect(() => {
    console.log(
      'Updated resolvedReviewTemplate answer values:',
      resolvedReviewTemplate,
    );
  }, [resolvedReviewTemplate]); */

  const isLastQuestion = useMemo(() => {
    const currentIndex = shownReviewTemplateQuestions.findIndex(
      (q) => q.id === currentQuestionId,
    );
    return currentIndex === shownReviewTemplateQuestions.length - 1;
  }, [currentQuestionId, shownReviewTemplateQuestions]);

  // Track when user reaches last question
  useEffect(() => {
    if (isLastQuestion) {
      setHasReachedLastQuestion(true);
    }
  }, [isLastQuestion]);

  const currentQuestion = useMemo(
    () =>
      shownReviewTemplateQuestions.find(
        (item) => item.id === currentQuestionId,
      ) || shownReviewTemplateQuestions[0],
    [currentQuestionId, shownReviewTemplateQuestions],
  );

  // Get validation state for all questions (only after user reaches last question)
  const questionsValidationState = useMemo(() => {
    if (!hasReachedLastQuestion) {
      return new Map();
    }
    return getQuestionsValidationState(
      resolvedReviewTemplate,
      inProgressReviewAnswerData,
    );
  }, [
    hasReachedLastQuestion,
    resolvedReviewTemplate,
    inProgressReviewAnswerData,
  ]);

  // log validation state changes
  useEffect(() => {
    console.log('Questions validation state:', questionsValidationState);
  }, [questionsValidationState]);

  const setNextQuestion = () => {
    const currentIndex = shownReviewTemplateQuestions.findIndex(
      (q) => q.id === currentQuestionId,
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

      // Store in_progress_id for later submission
      if (result?.in_progress_id) {
        setInProgressId(result.in_progress_id);
      }

      // Mark data as saved
      markAsSaved();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Speichern');
      console.error('✗ Save failed:', error);
    },
  });

  const handleSaveInProgress = () => {
    // Validate the complete data
    const validationResult = validateInProgressReviewAnswer(
      inProgressReviewAnswerData,
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

    // Log any field-level validation errors
    if (fieldValidationErrors.size > 0) {
      console.warn(
        'Field validation errors:',
        Object.fromEntries(fieldValidationErrors),
      );
    }

    // Save to server
    saveInProgress({
      case_id: caseData.id,
      data: validationResult.data,
    });
  };

  // Handler to submit review (final submission)
  const { mutate: submitReview, isPending: isSubmitting } = useMutation({
    ...submitReviewAnswersMutation(supabase),
    onSuccess: (result) => {
      toast.success('Fall erfolgreich abgeschlossen');
      setIsSubmitted(true);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Abschließen des Falls');
      console.error('✗ Submit failed:', error);
    },
  });

  const handleSubmitReview = async () => {
    // Check if user is authenticated
    if (!userId) {
      toast.error('Du musst angemeldet sein, um einen Fall abzuschließen');
      return;
    }

    // Validate the complete data with strict schema
    const validationResult = validateSubmittedReviewAnswer(
      inProgressReviewAnswerData,
    );

    if (!validationResult.success) {
      console.error('✗ Validation failed:', validationResult.error);
      toast.error('Bitte fülle alle erforderlichen Felder aus');
      return;
    }

    // First, save the in-progress data to get/update in_progress_id
    if (!inProgressId) {
      // Save first to get the in_progress_id
      const inProgressValidation = validateInProgressReviewAnswer(
        inProgressReviewAnswerData,
      );

      if (!inProgressValidation.success) {
        console.error(
          '✗ In-progress validation failed:',
          inProgressValidation.error,
        );
        toast.error('Validierungsfehler');
        return;
      }

      // Save and then submit
      saveInProgress(
        {
          case_id: caseData.id,
          data: inProgressValidation.data,
        },
        {
          onSuccess: (saveResult) => {
            if (saveResult?.in_progress_id) {
              // Now submit with the in_progress_id
              submitReview({
                in_progress_id: saveResult.in_progress_id,
              });
            }
          },
        },
      );
    } else {
      // We already have an in_progress_id, submit directly
      submitReview({
        in_progress_id: inProgressId,
      });
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
            onItemClick={setCurrentQuestionId}
            questionsValidationState={questionsValidationState}
            currentQuestion={currentQuestion}
          />
        </div>
      </div>
      {isSubmitted ? (
        <SuccesCard />
      ) : (
        <QuestionCard
          question={currentQuestion}
          headerActions={
            <>
              <HelpButton />
              <Button
                variant={hasUnsavedChanges ? 'destructive' : 'outline'}
                size={'default'}
                onClick={handleSaveInProgress}
              >
                <SaveAll className="w-4 h-4 mr-2" />
                Speichern
              </Button>
            </>
          }
          footer={
            <div className="flex flex-col w-full gap-2">
              {isLastQuestion ? (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={handleSubmitReview}
                  disabled={!isValidForSubmission || isSubmitting}
                >
                  {isSubmitting ? 'Wird abgeschlossen...' : 'Fall abschließen'}
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
      )}
    </div>
  );
};

export default Review;
