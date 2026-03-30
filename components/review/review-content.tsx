'use client';

import {
  METADATA_STEP_CATEGORY,
  METADATA_STEP_FACTCHECK,
  METADATA_STEP_KEYWORDS,
  METADATA_STEP_TITLE,
} from '@/lib/constants';
import { Case } from '@/lib/queries/getCase';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { getPreviewRatingStyle } from '@/lib/utils/rating-helpers';
import { Loader2, SaveAll } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';
import { Button } from '../ui/button';
import { HelpButton } from '../ui/help-button';
import CaseCard from './case-card';
import { useReviewFlow } from './hooks/useReviewFlow';
import Category from './metadata-fields/category';
import Factcheck from './metadata-fields/factcheck';
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
  isReviewTemplateFetching: boolean;
  userId?: string;
}

const ReviewContent: FC<ReviewContentProps> = ({
  reviewTemplate,
  caseData,
  isSubmitted,
  isReviewTemplateFetching,
  userId,
}) => {
  const flow = useReviewFlow({
    reviewTemplate,
    caseData,
    isSubmitted,
    isReviewTemplateFetching,
    userId,
  });

  const { currentStep, currentQuestion } = flow;

  if (!currentStep) {
    return null;
  }

  return (
    <>
      <ReviewDisputeDialog
        isOpen={flow.dialog.isDisputeDialogOpen}
        onOpenChange={flow.dialog.setIsDisputeDialogOpen}
        disputingField={flow.dialog.disputingField}
        caseId={caseData.id}
        userId={userId}
        onSuccess={flow.dialog.handleDisputeSuccess}
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
            ratingStyle={getPreviewRatingStyle(flow.reviewTemplateWithAnswersValues)}
          />
          <div className="my-4 lg:my-0 lg:mt-4">
            <ReviewNavigation
              items={flow.navigation.items}
              onItemClick={flow.navigation.selectStep}
              disabled={flow.isLocked}
              currentStepId={flow.navigation.currentStepId}
              canGoPrev={flow.navigation.canGoPrev}
              canGoNext={flow.navigation.canGoNext}
              onPrev={flow.navigation.goPrev}
              onNext={flow.navigation.goNext}
            />
          </div>
        </div>

        {flow.isLocked ? (
          <SuccesCard caseId={caseData.id} />
        ) : currentStep.kind === 'metadata' ? (
          <QuestionCard
            title={currentStep.label}
            description={currentStep.description}
            contentClassName="flex-1"
          >
            {currentStep.id === METADATA_STEP_TITLE && (
              <Title
                value={flow.metadataDraft.title}
                isComplete={flow.hasTitle}
                onChange={flow.handleTitleChange}
                onSave={
                  flow.hasTitle
                    ? flow.handleConfirmCurrentStep
                    : flow.handleSaveTitle
                }
                isSaving={flow.isTitlePending}
                fieldTitle={currentStep.fieldTitle}
                saveLabel={currentStep.primaryActionLabel}
                disputeLabel={currentStep.disputeActionLabel}
                onCreateDispute={() =>
                  flow.dialog.openDisputeDialog({
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
                issues={flow.titleIssues}
              />
            )}

            {currentStep.id === METADATA_STEP_KEYWORDS && (
              <Keywords
                existingKeywords={flow.existingKeywords}
                hasUserKeywords={flow.hasKeywords}
                newKeywords={flow.keywordDraftKeywords}
                onChangeKeywords={flow.handleKeywordsChange}
                isComplete={flow.hasKeywords}
                onSave={
                  flow.hasKeywords
                    ? flow.handleConfirmCurrentStep
                    : flow.handleSaveKeywords
                }
                isSaving={flow.isKeywordsPending}
                fieldTitle={currentStep.fieldTitle}
                saveLabel={currentStep.primaryActionLabel}
                disputeLabel={currentStep.disputeActionLabel}
                onCreateDispute={() =>
                  flow.dialog.openDisputeDialog({
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
                    answer_value: flow.existingKeywords.join(', '),
                    initial_answer_value: flow.existingKeywords.join(', '),
                  })
                }
                issues={flow.keywordsIssues}
              />
            )}

            {currentStep.id === METADATA_STEP_CATEGORY && (
              <Category
                value={flow.metadataDraft.category}
                isComplete={flow.hasCategory}
                onChange={flow.handleCategoryChange}
                onSave={
                  flow.hasCategory
                    ? flow.handleConfirmCurrentStep
                    : flow.handleSaveCategory
                }
                isSaving={flow.isCategoryPending || isReviewTemplateFetching}
                isDisputable={
                  flow.hasCategory &&
                  !!flow.metadataDraft.category &&
                  !flow.isCategoryPending &&
                  !isReviewTemplateFetching
                }
                fieldTitle={currentStep.fieldTitle}
                saveLabel={currentStep.primaryActionLabel}
                disputeLabel={currentStep.disputeActionLabel}
                onCreateDispute={() =>
                  flow.dialog.openDisputeDialog({
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
                issues={flow.categoryIssues}
              />
            )}

            {currentStep.id === METADATA_STEP_FACTCHECK && (
              <Factcheck
                selection={flow.metadataDraft.factcheckSelection}
                value={flow.metadataDraft.factcheckValue}
                isComplete={flow.hasFactcheckStepSaved}
                isSaving={flow.isFactcheckPending}
                onSelectionChange={flow.handleFactcheckSelectionChange}
                onValueChange={flow.handleFactcheckValueChange}
                onSave={
                  flow.hasFactcheckStepSaved
                    ? flow.handleConfirmCurrentStep
                    : flow.handleSaveFactcheck
                }
                fieldTitle={currentStep.fieldTitle || ''}
                saveLabel={currentStep.primaryActionLabel}
                disputeLabel={currentStep.disputeActionLabel}
                onCreateDispute={() =>
                  flow.dialog.openDisputeDialog({
                    id: 'factcheck',
                    type: 'text',
                    question: 'Faktencheck',
                    options: [
                      {
                        id: 'factcheck',
                        placeholder: '',
                        max_length: 2000,
                        min_length: 1,
                      },
                    ],
                    answer_value: caseData.case_factchecks?.has_factcheck
                      ? (caseData.case_factchecks.value ?? '').trim()
                        ? `Ja: ${caseData.case_factchecks.value}`
                        : 'Ja'
                      : 'Nein',
                    initial_answer_value: caseData.case_factchecks?.has_factcheck
                      ? (caseData.case_factchecks.value ?? '').trim()
                        ? `Ja: ${caseData.case_factchecks.value}`
                        : 'Ja'
                      : 'Nein',
                  })
                }
                issues={flow.factcheckIssues}
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
                  variant={flow.hasUnsavedReviewAnswers ? 'destructive' : 'outline'}
                  size="default"
                  onClick={flow.handleSaveInProgress}
                  disabled={!flow.hasUnsavedReviewAnswers || flow.isSavingPending}
                >
                  {flow.isSavingPending ? (
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
                  onClick={flow.handleNextStep}
                  disabled={flow.isLastStep}
                >
                  Nächste Frage
                </Button>
              </div>
            }
          >
            <RenderFieldsWithHeaders
              currentQuestion={currentQuestion}
              questionsValidationState={flow.questionsValidationState}
              onFieldChange={flow.handleFieldValueChange}
              onCreateReviewDispute={flow.dialog.openDisputeDialog}
              touchedQuestions={Array.from(flow.touchedQuestionIds)}
            />
          </QuestionCard>
        ) : currentStep.kind === 'comment' ? (
          <QuestionCard
            title={currentStep.label}
            description={currentStep.description}
            contentClassName="flex-1"
            footer={
              <div className="flex flex-col w-full gap-2">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={flow.handleNextStep}
                  disabled={flow.isLastStep}
                >
                  Weiter zum Abschließen
                </Button>
              </div>
            }
          >
            <FinalComment
              value={flow.displayedFinalComment}
              onChange={flow.handleFinalCommentChange}
              onSave={flow.handleSaveFinalComment}
              isSaving={flow.isSavingFinalComment}
              isDisabled={flow.isFinalCommentInputDisabled}
              fieldTitle="Was ist dir noch aufgefallen?"
              saveLabel="Kommentar speichern"
            />
          </QuestionCard>
        ) : currentStep.kind === 'submit' ? (
          <QuestionCard
            title={currentStep.label}
            description={currentStep.description}
            contentClassName="flex-1"
            footer={
              <div className="flex flex-col w-full gap-2">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={flow.handleSubmitReview}
                  disabled={
                    !flow.isFinalStepEnabled ||
                    (!flow.shouldSkipReviewQuestions &&
                      !flow.isValidForSubmission) ||
                    flow.isSubmitting
                  }
                >
                  {flow.isSubmitting ? 'Wird abgeschlossen...' : 'Fall abschließen'}
                </Button>
              </div>
            }
          >
            <div className="flex items-center justify-center h-full">
              <Image
                src="/images/unterstuetzen.svg"
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
