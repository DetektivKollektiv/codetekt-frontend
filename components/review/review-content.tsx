'use client';
import { Case } from '@/lib/queries/getCase';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { createClient } from '@/lib/supabase/client';

import {
  COMMENT_STEP,
  METADATA_STEP_CATEGORY,
  METADATA_STEP_KEYWORDS,
  METADATA_STEP_TITLE,
  SUBMIT_STEP,
} from '@/lib/constants';
import {
  caseCategorySchema,
  CaseCategoryValue,
} from '@/lib/schemas/case-metadata-schemas';
import { reviewTemplateSchema } from '@/lib/schemas/template-schemas';
import { ReviewStep } from '@/lib/types';
import { getPreviewRatingStyle } from '@/lib/utils/rating-helpers';
import { Loader2, SaveAll } from 'lucide-react';
import Image from 'next/image';
import { FC, useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { HelpButton } from '../ui/help-button';
import CaseCard from './case-card';
import { useMetadataDraftState } from './hooks/useMetadataDraftState';
import { useMetadataSave } from './hooks/useMetadataSave';
import { useReviewDispute } from './hooks/useReviewDispute';
import { useReviewNavigation } from './hooks/useReviewNavigation';
import { useReviewState } from './hooks/useReviewState';
import { useReviewSubmission } from './hooks/useReviewSubmission';
import { useReviewValidation } from './hooks/useReviewValidation';
import { useSaveFinalComment } from './hooks/useSaveFinalComment';
import { useTouchedQuestions } from './hooks/useTouchedQuestions';
import { useUnsavedChangesWarning } from './hooks/useUnsavedChangesWarning';
import Category from './metadata-fields/category';
import FinalComment from './metadata-fields/final-comment';
import Keywords from './metadata-fields/keywords';
import Title from './metadata-fields/title';
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
  const [currentStepId, setCurrentStepId] = useState('');
  const [finalComment, setFinalComment] = useState('');

  const { touchedQuestionIds } = useTouchedQuestions({
    currentQuestionId: currentStepId,
  });

  const hasTitle = !!caseData.case_titles;
  const hasKeywords = (caseData.case_keywords?.length ?? 0) > 0;
  const hasCategory = !!caseData.case_categories;
  const isMetadataComplete = hasTitle && hasKeywords && hasCategory;
  const hasUserComment =
    (caseData.case_comments?.some((comment) => comment.author_id === userId) ??
      false) &&
    !!userId;

  const isTemplateSchemaValid = useMemo(
    () => reviewTemplateSchema.array().safeParse(reviewTemplate),
    [reviewTemplate],
  );

  const isFinalStepEnabled =
    isMetadataComplete && isTemplateSchemaValid.success;

  // Review state management
  const { reviewTemplateWithAnswersValues, updateFieldValue } =
    useReviewState(reviewTemplate);

  const parsedCaseCategory = caseCategorySchema.safeParse(
    caseData.case_categories?.value,
  );
  const caseCategory: CaseCategoryValue | null = parsedCaseCategory.success
    ? parsedCaseCategory.data
    : null;

  const {
    inProgressReviewAnswerData,
    isValidForSubmission,
    shownReviewTemplateQuestions,
    questionsValidationState,
  } = useReviewValidation({
    reviewTemplateWithAnswersValues,
    caseCategory,
    touchedQuestionIds,
  });

  const isStepBlocking = (step: ReviewStep): boolean => !step.isComplete;

  const steps = useMemo<ReviewStep[]>(() => {
    const allSteps: ReviewStep[] = [
      {
        id: METADATA_STEP_TITLE,
        label: 'Titel des Falls',
        description: hasTitle
          ? 'Bitte prüfe den Titel, der für diesen Fall vergeben wurde. Wenn der Titel den Fall gut beschreibt, klicke auf "Der Titel passt". Falls nicht, klicke auf "Titel beanstanden", damit der Titel von unserer Moderation geprüft werden kann.'
          : 'Vergib einen klaren und prägnanten Titel, damit der Fall später schnell verstanden und wiedergefunden werden kann.',
        helpUrl: '/help/title',
        fieldTitle: 'Titel',
        primaryActionLabel: hasTitle ? 'Der Titel passt' : 'Speichern',
        disputeActionLabel: 'Titel beanstanden',
        isIndented: false,
        status: hasTitle ? 'success' : 'incomplete',
        kind: 'metadata',
        isComplete: hasTitle,
      },
      {
        id: METADATA_STEP_KEYWORDS,
        label: 'Stichwörter',
        description: hasKeywords
          ? 'Bitte prüfe die Stichwörter, die für diesen Fall bereits vergeben wurden. Wenn die Stichwörter den Fall gut beschreiben, klicke auf "Die Stichwörter passen". Falls nicht, klicke auf "Stichwörter beanstanden", damit die Stichwörter von unserer Moderation geprüft werden können.'
          : 'Ergänze passende Stichwörter, die den Inhalt des Falls treffend beschreiben und die Einordnung erleichtern.',
        helpUrl: '/help/keywords',

        primaryActionLabel: hasKeywords
          ? 'Die Stichwörter passen'
          : 'Speichern',
        disputeActionLabel: 'Stichwörter beanstanden',
        isIndented: false,
        status: hasKeywords ? 'success' : 'incomplete',
        kind: 'metadata',
        isComplete: hasKeywords,
      },
      {
        id: METADATA_STEP_CATEGORY,
        label: 'Kategorie',
        description: hasCategory
          ? 'Bitte prüfe die Kategorie, die für diesen Fall vergeben wurde. Wenn die Kategorie den Fall gut einordnet, klicke auf "Die Kategorie passt". Falls nicht, klicke auf "Kategorie beanstanden", damit die Kategorie von unserer Moderation geprüft werden kann.'
          : 'Wähle die passende Kategorie für den Fall. So werden die richtigen Bewertungskriterien für alle Reviewer angezeigt.',
        helpUrl: '/help/category',
        fieldTitle: 'Kategorie des Falls',
        primaryActionLabel: hasCategory ? 'Die Kategorie passt' : 'Speichern',
        disputeActionLabel: 'Kategorie beanstanden',
        isIndented: false,
        status: hasCategory ? 'success' : 'incomplete',
        kind: 'metadata',
        isComplete: hasCategory,
      },
      ...shownReviewTemplateQuestions.map((question) => {
        const validationState = questionsValidationState.get(question.id);

        return {
          id: question.id,
          label: question.metadata.title,
          helpUrl: question.metadata.help_url.trim() || undefined,
          isIndented: (question.metadata.indent_level ?? 0) > 0,
          status: validationState?.type,
          kind: 'question' as const,
          isComplete: validationState?.type === 'success',
          question,
        };
      }),
      ...(!hasUserComment
        ? [
            {
              id: COMMENT_STEP,
              label: 'Kommentar hinzufügen',
              description:
                'Optional: Wenn du möchtest, kannst du noch einen zusammenfassenden Kommentar zu deiner Einschätzung hinzufügen.',
              isIndented: false,
              status: undefined,
              kind: 'comment' as const,
              isComplete: true,
            },
          ]
        : []),
      {
        id: SUBMIT_STEP,
        label: 'Fall abschließen',
        description:
          'Prüfe deine Angaben und schließe den Fall ab. Danach ist deine Bewertung eingereicht.',
        isIndented: false,
        status: isFinalStepEnabled ? undefined : 'incomplete',
        kind: 'submit' as const,
        isComplete: isFinalStepEnabled && isValidForSubmission,
      },
    ];

    const firstBlockingIndex = allSteps.findIndex(isStepBlocking);
    if (firstBlockingIndex === -1) {
      return allSteps;
    }

    return allSteps.slice(0, firstBlockingIndex + 1);
  }, [
    hasUserComment,
    isFinalStepEnabled,
    isValidForSubmission,
    hasCategory,
    hasKeywords,
    hasTitle,
    shownReviewTemplateQuestions,
    questionsValidationState,
  ]);

  const { currentStep, isLastStep, setNextStep, handleNavClick } =
    useReviewNavigation({
    steps,
    currentStepId,
    setCurrentStepId,
    });

  const isMetadataStep = currentStep?.kind === 'metadata';
  const isCommentStep = currentStep?.kind === 'comment';
  const isSubmitStep = currentStep?.kind === 'submit';
  const currentQuestion =
    currentStep?.kind === 'question' ? currentStep.question : null;

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
    caseCategory,
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
    onStepComplete: (step) => {
      const nextStepIdByStep = {
        title: METADATA_STEP_KEYWORDS,
        keywords: METADATA_STEP_CATEGORY,
        category:
          shownReviewTemplateQuestions[0]?.id ??
          (hasUserComment ? SUBMIT_STEP : COMMENT_STEP),
      } as const;

      setCurrentStepId(nextStepIdByStep[step]);
    },
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

  const { handleSaveFinalComment, isSavingFinalComment } = useSaveFinalComment({
    supabase,
    caseId: caseData.id,
    userId,
    isFinalStepEnabled,
    onSuccess: () => setFinalComment(''),
  });

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
              items={steps}
              onItemClick={handleNavClick}
              disabled={isLocked}
              currentStepId={currentStepId}
            />
          </div>
        </div>
        {isLocked ? (
          <SuccesCard caseId={caseData.id} />
        ) : isMetadataStep ? (
          <QuestionCard
            title={currentStep.label}
            description={currentStep.description}
            headerActions={<HelpButton href={currentStep.helpUrl} />}
            contentClassName="flex-1"
          >
            {currentStepId === METADATA_STEP_TITLE && (
              <Title
                value={metadataDraft.title}
                isComplete={hasTitle}
                onChange={handleTitleChange}
                onSave={hasTitle ? setNextStep : handleSaveTitle}
                isSaving={isTitlePending}
                fieldTitle={currentStep.fieldTitle}
                saveLabel={currentStep.primaryActionLabel}
                disputeLabel={currentStep.disputeActionLabel}
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
                onSave={hasKeywords ? setNextStep : handleSaveKeywords}
                isSaving={isKeywordsPending}
                fieldTitle={currentStep.fieldTitle}
                saveLabel={currentStep.primaryActionLabel}
                disputeLabel={currentStep.disputeActionLabel}
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
                onSave={hasCategory ? setNextStep : handleSaveCategory}
                isSaving={isCategoryPending}
                fieldTitle={currentStep.fieldTitle}
                saveLabel={currentStep.primaryActionLabel}
                disputeLabel={currentStep.disputeActionLabel}
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
                <HelpButton href={currentStep.helpUrl} />
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
                <Button
                  variant="default"
                  className="w-full"
                  onClick={setNextStep}
                  disabled={isLastStep}
                >
                  Nächste Frage
                </Button>
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
        ) : isCommentStep ? (
          <QuestionCard
            title={currentStep.label}
            description={currentStep.description}
            contentClassName="flex-1"
            footer={
              <div className="flex flex-col w-full gap-2">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={setNextStep}
                  disabled={isLastStep}
                >
                  Weiter zum Abschließen
                </Button>
              </div>
            }
          >
            <FinalComment
              value={finalComment}
              onChange={setFinalComment}
              onSave={() => handleSaveFinalComment(finalComment)}
              isSaving={isSavingFinalComment}
              isDisabled={!isFinalStepEnabled}
              fieldTitle="Was ist dir noch aufgefallen?"
              saveLabel="Kommentar speichern"
            />
          </QuestionCard>
        ) : isSubmitStep ? (
          <QuestionCard
            title={currentStep.label}
            description={currentStep.description}
            contentClassName="flex-1"
            footer={
              <div className="flex flex-col w-full gap-2">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={handleSubmitReview}
                  disabled={
                    !isFinalStepEnabled || !isValidForSubmission || isSubmitting
                  }
                >
                  {isSubmitting ? 'Wird abgeschlossen...' : 'Fall abschließen'}
                </Button>
              </div>
            }
          >
            <div className="flex items-center justify-center h-full">
              <Image
                src={'/images/unterstuetzen.svg'}
                alt="Success"
                width={400 * 1.2}
                height={300 * 1.2}
              />
            </div>
          </QuestionCard>
        ) : null}
      </div>
    </>
  );
};

export default ReviewContent;
