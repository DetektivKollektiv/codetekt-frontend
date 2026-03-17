'use client';
import { Case } from '@/lib/queries/getCase';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { createClient } from '@/lib/supabase/client';

import { getPreviewRatingStyle } from '@/lib/utils/rating-helpers';
import { Loader2, SaveAll } from 'lucide-react';
import Link from 'next/link';
import { FC, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { HelpButton } from '../ui/help-button';
import CaseCard from './case-card';
import { useReviewDispute } from './hooks/useReviewDispute';
import { useReviewNavigation } from './hooks/useReviewNavigation';
import { useReviewState } from './hooks/useReviewState';
import { useReviewSubmission } from './hooks/useReviewSubmission';
import { useReviewValidation } from './hooks/useReviewValidation';
import { useTouchedQuestions } from './hooks/useTouchedQuestions';
import { useUnsavedChangesWarning } from './hooks/useUnsavedChangesWarning';
import QuestionCard from './question-card';
import ReviewDisputeDialog from './review-dispute-dialog';
import ReviewNavigation from './review-navigation';
import SuccesCard from './success-card';
import { RenderFieldsWithHeaders } from './utils/render-fields';

interface ReviewContentProps {
  reviewTemplate: NonNullable<ReviewTemplate>;
  caseData: NonNullable<Case>;
  isSubmitted: boolean;
  userId?: string;
}

const ReviewContent: FC<ReviewContentProps> = ({
  reviewTemplate,
  caseData,
  isSubmitted: initialIsSubmitted,
  userId,
}) => {
  const supabase = createClient();
  const [isLocked, setIsLocked] = useState(initialIsSubmitted);

  if (caseData) {
    let hasTitle = !!caseData.case_titles;
    let hasKeywords = !!caseData.case_keywords?.length;
    let hasCategories = !!caseData.case_categories;
  }

  // Review state management
  const { reviewTemplateWithAnswersValues, updateFieldValue } =
    useReviewState(reviewTemplate);

  const caseCategory = caseData.case_categories?.value;

  const {
    inProgressReviewAnswerData,
    isValidForSubmission,
    shownReviewTemplateQuestions,
    questionsValidationState,
  } = useReviewValidation({
    reviewTemplateWithAnswersValues,
    caseCategory,
  });

  const {
    currentQuestion,
    currentQuestionId,
    setCurrentQuestionId,
    isLastQuestion,
    setNextQuestion,
  } = useReviewNavigation({
    shownReviewTemplateQuestions,
    initialQuestionId: reviewTemplate[0].id,
  });

  const { touchedQuestionIds } = useTouchedQuestions({
    currentQuestionId,
  });

  // Unsaved changes warning
  const {
    hasUnsavedChanges,
    markAsSaved,
    setIsActive: setUnsavedChangesWarningActive,
  } = useUnsavedChangesWarning({
    data: inProgressReviewAnswerData,
  });

  useEffect(() => {
    setUnsavedChangesWarningActive(!isLocked);
  }, [isLocked, setUnsavedChangesWarningActive]);

  const {
    handleSaveInProgress,
    handleSubmitReview,
    isSavingPending,
    isSubmitting,
  } = useReviewSubmission({
    supabase,
    caseId: caseData.id,
    userId,
    inProgressReviewAnswerData,
    markAsSaved,
    onSubmitSuccess: () => setIsLocked(true),
  });

  const {
    isDisputeDialogOpen,
    setIsDisputeDialogOpen,
    disputingField,
    openDisputeDialog,
    handleDisputeSuccess,
  } = useReviewDispute({
    caseId: caseData.id,
    userId,
    markAsSaved,
  });

  if (!currentQuestion) {
    return null;
  }

  return (
    <>
      <ReviewDisputeDialog
        isOpen={isDisputeDialogOpen}
        onOpenChange={setIsDisputeDialogOpen}
        disputingField={disputingField}
        caseId={caseData.id}
        userId={userId}
        onSuccess={handleDisputeSuccess}
      />

      <div
        className="page-max-w lg:grid lg:gap-6"
        style={{
          gridTemplateColumns: '300px 1fr ',
        }}
      >
        <div>
          <CaseCard
            case={caseData}
            ratingStyle={getPreviewRatingStyle(reviewTemplateWithAnswersValues)}
          />
          <div className="my-4 lg:my-0 lg:mt-4">
            <ReviewNavigation
              touchedQuestionsIds={Array.from(touchedQuestionIds)}
              reviewTemplateQuestions={shownReviewTemplateQuestions}
              onItemClick={setCurrentQuestionId}
              questionsValidationState={questionsValidationState}
              currentQuestion={currentQuestion}
              disabled={isLocked}
            />
          </div>
        </div>
        {isLocked ? (
          <SuccesCard>
            <Link href={`/#open-cases`} className="w-full">
              <Button variant={'default'} size={'default'} className="w-full">
                Weitere Fälle bearbeiten
              </Button>
            </Link>
          </SuccesCard>
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
                  disabled={!hasUnsavedChanges || isSavingPending}
                >
                  {isSavingPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <SaveAll className="w-4 h-4 mr-2" />
                  )}
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
                    {isSubmitting
                      ? 'Wird abgeschlossen...'
                      : 'Fall abschließen'}
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
            <RenderFieldsWithHeaders
              currentQuestion={currentQuestion}
              questionsValidationState={questionsValidationState}
              onFieldChange={updateFieldValue}
              onCreateReviewDispute={openDisputeDialog}
              touchedQuestions={Array.from(touchedQuestionIds)}
            />
          </QuestionCard>
        )}
      </div>
    </>
  );
};

export default ReviewContent;
