'use client';
import { Case } from '@/lib/queries/getCase';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { createClient } from '@/lib/supabase/client';

import {
  FINAL_COMMENT_STEP,
  METADATA_STEP_CATEGORY,
  METADATA_STEP_KEYWORDS,
  METADATA_STEP_TITLE,
} from '@/lib/constants';
import { createCommentMutation } from '@/lib/queries/createComment';
import {
  caseCategorySchema,
  CaseCategoryValue,
} from '@/lib/schemas/case-metadata-schemas';
import { reviewTemplateSchema } from '@/lib/schemas/template-schemas';
import { ReviewStep } from '@/lib/types';
import { getPreviewRatingStyle } from '@/lib/utils/rating-helpers';
import { useMutation } from '@tanstack/react-query';
import { Loader2, SaveAll } from 'lucide-react';
import Link from 'next/link';
import { FC, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
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
  });

  const steps = useMemo<ReviewStep[]>(
    () => [
      {
        id: METADATA_STEP_TITLE,
        label: 'Titel des Falls',
        description: hasTitle
          ? 'Bitte prüfe den Titel, der für diesen Fall vergeben wurde. Wenn der Titel den Fall gut beschreibt, klicke auf "Der Titel passt". Falls nicht, klicke auf "Titel beanstanden", damit der Titel von unserer Moderation geprüft werden kann.'
          : 'Vergib einen klaren und prägnanten Titel, damit der Fall später schnell verstanden und wiedergefunden werden kann.',
        helpUrl: '/help/title',
        fieldTitle: 'Titel des Falls',
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
        const isTouched = touchedQuestionIds.has(question.id);
        const validationState = isTouched
          ? questionsValidationState.get(question.id)
          : undefined;

        return {
          id: question.id,
          label: question.metadata.title,
          helpUrl: question.metadata.help_url.trim() || undefined,
          isIndented: (question.metadata.indent_level ?? 0) > 0,
          status: validationState?.type as 'error' | 'success' | undefined,
          kind: 'question' as const,
          isComplete: false,
          question,
        };
      }),
      {
        id: FINAL_COMMENT_STEP,
        label: 'Fall abschließen',
        description:
          'Wenn du willst, kannst du deine Einschätzung in einem zusammenfassenden Kommentar schildern oder schreiben, was dir sonst noch aufgefallen ist.',
        isIndented: false,
        status: isFinalStepEnabled ? undefined : 'incomplete',
        kind: 'final-comment',
        isComplete: false,
      },
    ],
    [
      isFinalStepEnabled,
      hasCategory,
      hasKeywords,
      hasTitle,
      shownReviewTemplateQuestions,
      questionsValidationState,
      touchedQuestionIds,
    ],
  );

  const { currentStep, setNextStep, handleNavClick } = useReviewNavigation({
    steps,
    currentStepId,
    setCurrentStepId,
  });

  const isMetadataStep = currentStep?.kind === 'metadata';
  const isFinalCommentStep = currentStep?.kind === 'final-comment';
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

  const { mutate: saveFinalComment, isPending: isSavingFinalComment } =
    useMutation({
      ...createCommentMutation(supabase),
      onSuccess: () => {
        toast.success('Kommentar gespeichert');
        setFinalComment('');
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Fehler beim Speichern des Kommentars');
      },
    });

  const handleSaveFinalComment = () => {
    const trimmedComment = finalComment.trim();

    if (!isFinalStepEnabled || trimmedComment.length === 0) {
      return;
    }

    if (!userId) {
      toast.error('Du musst angemeldet sein, um zu kommentieren');
      return;
    }

    saveFinalComment({
      case_id: caseData.id,
      author_id: userId,
      content: trimmedComment,
    });
  };

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
          <SuccesCard>
            <Link href={`/#open-cases`} className="w-full">
              <Button variant={'default'} size={'default'} className="w-full">
                Weitere Fälle bearbeiten
              </Button>
            </Link>
          </SuccesCard>
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
        ) : isFinalCommentStep ? (
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
            <FinalComment
              value={finalComment}
              onChange={setFinalComment}
              onSave={handleSaveFinalComment}
              isSaving={isSavingFinalComment}
              isDisabled={!isFinalStepEnabled}
              fieldTitle="Was ist dir noch aufgefallen?"
              saveLabel="Kommentar speichern"
            />
          </QuestionCard>
        ) : null}
      </div>
    </>
  );
};

export default ReviewContent;
