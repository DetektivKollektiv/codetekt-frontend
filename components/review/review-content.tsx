'use client';
import { Case } from '@/lib/queries/getCase';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { createClient } from '@/lib/supabase/client';

import { MetadataNavItem } from '@/lib/types/navigation';
import { getCaseKeywords } from '@/lib/utils/get-case-keywords';
import { getPreviewRatingStyle } from '@/lib/utils/rating-helpers';
import { Loader2, SaveAll } from 'lucide-react';
import Link from 'next/link';
import { FC, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { HelpButton } from '../ui/help-button';
import CaseCard from './case-card';
import { useMetadataSave } from './hooks/useMetadataSave';
import { useReviewDispute } from './hooks/useReviewDispute';
import { useReviewNavigation } from './hooks/useReviewNavigation';
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
import ReviewNavigation from './review-navigation';
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
  const hasAllMetadata = hasTitle && hasKeywords && hasCategory;

  const metadataItems: MetadataNavItem[] = [
    {
      id: METADATA_STEP_TITLE,
      label: 'Titel',
      isComplete: hasTitle,
      isMetadataStep: true,
    },
    {
      id: METADATA_STEP_KEYWORDS,
      label: 'Stichwörter',
      isComplete: hasKeywords,
      isMetadataStep: true,
    },
    {
      id: METADATA_STEP_CATEGORY,
      label: 'Kategorie',
      isComplete: hasCategory,
      isMetadataStep: true,
    },
  ];

  const firstIncompleteMetaId =
    metadataItems.find((m) => !m.isComplete)?.id ?? null;

  const [currentStepId, setCurrentStepId] = useState<string>(
    firstIncompleteMetaId ?? reviewTemplate[0].id,
  );

  const currentNavItem = [...metadataItems].find((m) => m.id === currentStepId);
  const isMetadataStep = currentNavItem?.isMetadataStep === true;

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
    initialQuestionId: hasAllMetadata
      ? reviewTemplate[0].id
      : reviewTemplate[0].id,
  });

  const { touchedQuestionIds } = useTouchedQuestions({
    currentQuestionId: isMetadataStep ? '' : currentStepId,
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

  const advanceToNextStep = () => {
    const nextIncompleteId = metadataItems.find(
      (m) => !m.isComplete && m.id !== currentStepId,
    )?.id;
    if (nextIncompleteId) {
      setCurrentStepId(nextIncompleteId);
    } else if (
      hasAllMetadata ||
      metadataItems.every((m) => (m.id === currentStepId ? true : m.isComplete))
    ) {
      setCurrentStepId(reviewTemplate[0].id);
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
    onStepComplete: advanceToNextStep,
  });

  const handleNavClick = (id: string) => {
    setCurrentStepId(id);
    if (!metadataItems.some((m) => m.id === id)) {
      setCurrentQuestionId(id);
    }
  };

  const existingKeywords = getCaseKeywords(caseData);

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
              onItemClick={handleNavClick}
              questionsValidationState={questionsValidationState}
              disabled={isLocked}
              metadataItems={metadataItems}
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
          <Card className="pt-6 flex flex-col">
            <CardHeader>
              <CardTitle className="text-display-sm">Falldetails</CardTitle>
              <CardDescription className="max-w-xl">
                Bitte ergänze die fehlenden Informationen zu diesem Fall, bevor
                du mit der Bewertung beginnst.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {currentStepId === METADATA_STEP_TITLE && (
                <Title
                  value={caseData.case_titles?.value}
                  isComplete={hasTitle}
                  onSave={setTitle}
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
                  isComplete={hasKeywords}
                  onSave={setKeywords}
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
                  value={caseData.case_categories?.value}
                  isComplete={hasCategory}
                  onSave={setCategory}
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
                      initial_answer_value:
                        caseData.case_categories?.value ?? '',
                    })
                  }
                  issues={categoryIssues}
                />
              )}
            </CardContent>
          </Card>
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
