'use client';
import { Case } from '@/lib/queries/getCase';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { createClient } from '@/lib/supabase/client';

import { getPreviewRatingStyle } from '@/lib/utils/rating-helpers';
import { Loader2, SaveAll } from 'lucide-react';
import Link from 'next/link';
import { FC, useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { HelpButton } from '../ui/help-button';
import CaseCard from './case-card';
import { useMetadataDraftState } from './hooks/useMetadataDraftState';
import { useMetadataSave } from './hooks/useMetadataSave';
import { useReviewDispute } from './hooks/useReviewDispute';
import { useReviewState } from './hooks/useReviewState';
import { useReviewSubmission } from './hooks/useReviewSubmission';
import { useReviewValidation } from './hooks/useReviewValidation';
import { useTouchedQuestions } from './hooks/useTouchedQuestions';
import { useUnsavedChangesWarning } from './hooks/useUnsavedChangesWarning';
import Category from './metadata-fields/category';
import Keywords from './metadata-fields/keywords';
import Title from './metadata-fields/title';
import QuestionCard from './question-card';
import ReviewDisputeDialog from './review-dispute-dialog';
import ReviewNavigation, { ReviewNavigationItemData } from './review-navigation';
import SuccesCard from './success-card';
import { RenderFieldsWithHeaders } from './utils/render-fields';

interface ReviewContentProps {
  reviewTemplate: NonNullable<ReviewTemplate>;
  caseData: NonNullable<Case>;
  isSubmitted: boolean;
  userId?: string;
}

const METADATA_STEP_TITLE = 'meta_title';
const METADATA_STEP_KEYWORDS = 'meta_keywords';
const METADATA_STEP_CATEGORY = 'meta_category';

type MetadataStep = {
  id: string;
  label: string;
  kind: 'metadata';
  isComplete: boolean;
};

type QuestionStep = {
  id: string;
  label: string;
  kind: 'question';
  isComplete: boolean;
  question: NonNullable<ReviewTemplate>[number];
};

type ReviewStep = MetadataStep | QuestionStep;

const ReviewContent: FC<ReviewContentProps> = ({
  reviewTemplate,
  caseData,
  isSubmitted: initialIsSubmitted,
  userId,
}) => {
  const supabase = createClient();
  const [isLocked, setIsLocked] = useState(initialIsSubmitted);

  const hasTitle = !!caseData.case_titles;
  const hasKeywords = (caseData.case_keywords?.length ?? 0) > 0;
  const hasCategory = !!caseData.case_categories;

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

  const steps = useMemo<ReviewStep[]>(
    () => [
      {
        id: METADATA_STEP_TITLE,
        label: 'Titel',
        kind: 'metadata',
        isComplete: hasTitle,
      },
      {
        id: METADATA_STEP_KEYWORDS,
        label: 'Stichwörter',
        kind: 'metadata',
        isComplete: hasKeywords,
      },
      {
        id: METADATA_STEP_CATEGORY,
        label: 'Kategorie',
        kind: 'metadata',
        isComplete: hasCategory,
      },
      ...shownReviewTemplateQuestions.map((question) => ({
        id: question.id,
        label: question.metadata.title,
        kind: 'question' as const,
        isComplete: false,
        question,
      })),
    ],
    [hasCategory, hasKeywords, hasTitle, shownReviewTemplateQuestions],
  );

  const firstIncompleteStepId =
    steps.find((step) => !step.isComplete)?.id ?? steps[0]?.id ?? '';

  const [currentStepId, setCurrentStepId] = useState(firstIncompleteStepId);

  useEffect(() => {
    if (steps.length === 0) return;

    const hasCurrentStep = steps.some((step) => step.id === currentStepId);
    if (!hasCurrentStep) {
      setCurrentStepId(firstIncompleteStepId);
    }
  }, [currentStepId, firstIncompleteStepId, steps]);

  const currentStep =
    steps.find((step) => step.id === currentStepId) ?? steps[0] ?? null;
  const isMetadataStep = currentStep?.kind === 'metadata';
  const currentQuestion =
    currentStep?.kind === 'question' ? currentStep.question : null;
  const isLastStep =
    currentStep !== null &&
    steps.findIndex((step) => step.id === currentStep.id) === steps.length - 1;

  const { touchedQuestionIds } = useTouchedQuestions({
    currentQuestionId: currentStepId,
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

  const setNextStep = () => {
    const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);
    if (currentStepIndex < 0 || currentStepIndex >= steps.length - 1) {
      return;
    }

    const nextStep = steps[currentStepIndex + 1];
    if (nextStep) {
      setCurrentStepId(nextStep.id);
    }
  };

  const {
    setTitle,
    setKeywords,
    setCategory,
    isTitlePending,
    isKeywordsPending,
    isCategoryPending,
    titleIssues,
    keywordsIssues,
    categoryIssues,
  } = useMetadataSave({
    supabase,
    caseId: caseData.id,
    userId,
    onStepComplete: setNextStep,
  });

  const {
    metadataDraft,
    existingKeywords,
    handleTitleChange,
    handleKeywordsChange,
    handleCategoryChange,
    handleSaveTitle,
    handleSaveKeywords,
    handleSaveCategory,
  } = useMetadataDraftState({
    caseData,
    userId,
    setTitle,
    setKeywords,
    setCategory,
  });

  const handleNavClick = (id: string) => {
    setCurrentStepId(id);
  };

  const navItems = useMemo<ReviewNavigationItemData[]>(
    () =>
      steps.map((step) => {
        if (step.kind === 'metadata') {
          return {
            id: step.id,
            label: step.label,
            isIndented: false,
            status: step.isComplete ? 'success' : 'incomplete',
          };
        }

        const isTouched = touchedQuestionIds.has(step.id);
        const validationState = isTouched
          ? questionsValidationState.get(step.id)
          : undefined;

        return {
          id: step.id,
          label: step.label,
          isIndented: (step.question.metadata.indent_level ?? 0) > 0,
          status: validationState?.type as 'error' | 'success' | undefined,
        };
      }),
    [questionsValidationState, steps, touchedQuestionIds],
  );

  if (!currentStep) {
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
              items={navItems}
              onItemClick={handleNavClick}
              disabled={isLocked}
              currentStepId={currentStepId}
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
        ) : isMetadataStep ? (
          <QuestionCard
            title="Falldetails"
            description="Bitte ergänze die fehlenden Informationen zu diesem Fall, bevor du mit der Bewertung beginnst."
            contentClassName="flex-1"
          >
            {currentStepId === METADATA_STEP_TITLE && (
              <Title
                value={metadataDraft.title}
                isComplete={hasTitle}
                onChange={handleTitleChange}
                onSave={handleSaveTitle}
                isSaving={isTitlePending}
                onCreateDispute={() =>
                  openDisputeDialog({
                    id: 'title',
                    type: 'text',
                    question: 'Titel',
                    options: [
                      {
                        id: 'title',
                        placeholder: '',
                        max_length: 500,
                        min_length: 10,
                      },
                    ],
                    answer_value: caseData.case_titles?.value ?? '',
                    initial_answer_value: caseData.case_titles?.value ?? '',
                  })
                }
                issues={titleIssues}
              />
            )}
            {currentStepId === METADATA_STEP_KEYWORDS && (
              <Keywords
                existingKeywords={existingKeywords}
                caseKeywords={caseData.case_keywords ?? []}
                userId={userId}
                newKeywords={metadataDraft.keywords}
                onChangeKeywords={handleKeywordsChange}
                isComplete={hasKeywords}
                onSave={handleSaveKeywords}
                isSaving={isKeywordsPending}
                onCreateDispute={() =>
                  openDisputeDialog({
                    id: 'keywords',
                    type: 'text',
                    question: 'Stichwörter',
                    options: [
                      {
                        id: 'keywords',
                        placeholder: '',
                        max_length: 500,
                        min_length: 1,
                      },
                    ],
                    answer_value: existingKeywords.join(', '),
                    initial_answer_value: existingKeywords.join(', '),
                  })
                }
                issues={keywordsIssues}
              />
            )}
            {currentStepId === METADATA_STEP_CATEGORY && (
              <Category
                value={metadataDraft.category}
                isComplete={hasCategory}
                onChange={handleCategoryChange}
                onSave={handleSaveCategory}
                isSaving={isCategoryPending}
                onCreateDispute={() =>
                  openDisputeDialog({
                    id: 'category',
                    type: 'text',
                    question: 'Kategorie',
                    options: [
                      {
                        id: 'category',
                        placeholder: '',
                        max_length: 100,
                        min_length: 1,
                      },
                    ],
                    answer_value: caseData.case_categories?.value ?? '',
                    initial_answer_value: caseData.case_categories?.value ?? '',
                  })
                }
                issues={categoryIssues}
              />
            )}
          </QuestionCard>
        ) : currentQuestion ? (
          <QuestionCard
            title={currentQuestion.metadata.title}
            description={currentQuestion.metadata.text}
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
                {isLastStep ? (
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
                    onClick={setNextStep}
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
        ) : null}
      </div>
    </>
  );
};

export default ReviewContent;
