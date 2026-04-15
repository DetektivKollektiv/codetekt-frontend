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

  const { currentStep, currentQuestion } = flow.navigation;
  const hasUserKeywordDraft = flow.state.userKeywordDraft.length > 0;

  if (!currentStep) {
    return null;
  }

  return (
    <>
      <ReviewDisputeDialog
        isOpen={flow.state.dispute.isOpen}
        onOpenChange={flow.actions.dispute.setOpen}
        disputingField={flow.state.dispute.field}
        caseId={caseData.id}
        userId={userId}
        onSuccess={flow.actions.dispute.handleSuccess}
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
            ratingStyle={getPreviewRatingStyle(flow.state.answerDraft)}
          />
          <div className="my-4 lg:my-0 lg:mt-4">
            <ReviewNavigation
              items={flow.navigation.items}
              onItemClick={flow.navigation.selectStep}
              disabled={flow.state.isLocked}
              currentStepId={flow.navigation.currentStepId}
              canGoPrev={flow.navigation.canGoPrev}
              canGoNext={flow.navigation.canGoNext}
              onPrev={flow.navigation.goPrev}
              onNext={flow.navigation.goNext}
            />
          </div>
        </div>

        {flow.state.isLocked ? (
          <SuccesCard caseId={caseData.id} />
        ) : currentStep.kind === 'metadata' ? (
          <QuestionCard
            title={currentStep.label}
            description={currentStep.description}
            contentClassName="flex-1"
          >
            {currentStep.id === METADATA_STEP_TITLE && (
              <Title
                value={flow.state.metadataDraft.title}
                isComplete={flow.state.flags.hasTitle}
                onChange={flow.actions.metadata.changeTitle}
                onSave={
                  flow.state.flags.hasTitle
                    ? flow.actions.confirmCurrentStep
                    : flow.actions.metadata.saveTitle
                }
                isSaving={flow.status.isTitlePending}
                fieldTitle={currentStep.fieldTitle}
                saveLabel={currentStep.primaryActionLabel}
                disputeLabel={currentStep.disputeActionLabel}
                onCreateDispute={() =>
                  flow.actions.dispute.open({
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
                issues={flow.validation.metadata.title}
              />
            )}

            {currentStep.id === METADATA_STEP_KEYWORDS && (
              <Keywords
                caseKeywords={flow.state.caseKeywords}
                hasCaseKeywords={flow.state.flags.hasCaseKeywords}
                hasUserKeywords={flow.state.flags.hasUserKeywords}
                userKeywordDraft={flow.state.userKeywordDraft}
                onChangeKeywords={flow.actions.metadata.changeKeywords}
                isComplete={flow.state.flags.hasCaseKeywords}
                onSave={
                  flow.state.flags.hasCaseKeywords && !hasUserKeywordDraft
                    ? flow.actions.confirmCurrentStep
                    : flow.actions.metadata.saveKeywords
                }
                isSaving={flow.status.isKeywordsPending}
                fieldTitle={currentStep.fieldTitle}
                saveLabel={
                  flow.state.flags.hasCaseKeywords && hasUserKeywordDraft
                    ? 'Stichwörter speichern'
                    : currentStep.primaryActionLabel
                }
                disputeLabel={currentStep.disputeActionLabel}
                onCreateDispute={() =>
                  flow.actions.dispute.open({
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
                    answer_value: flow.state.caseKeywords.join(', '),
                    initial_answer_value: flow.state.caseKeywords.join(', '),
                  })
                }
                issues={flow.validation.metadata.keywords}
              />
            )}

            {currentStep.id === METADATA_STEP_CATEGORY && (
              <Category
                value={flow.state.metadataDraft.category}
                isComplete={flow.state.flags.hasCategory}
                onChange={flow.actions.metadata.changeCategory}
                onSave={
                  flow.state.flags.hasCategory
                    ? flow.actions.confirmCurrentStep
                    : flow.actions.metadata.saveCategory
                }
                isSaving={
                  flow.status.isCategoryPending ||
                  flow.status.isReviewTemplateFetching
                }
                isDisputable={
                  flow.state.flags.hasCategory &&
                  !!flow.state.metadataDraft.category &&
                  !flow.status.isCategoryPending &&
                  !flow.status.isReviewTemplateFetching
                }
                fieldTitle={currentStep.fieldTitle}
                saveLabel={currentStep.primaryActionLabel}
                disputeLabel={currentStep.disputeActionLabel}
                onCreateDispute={() =>
                  flow.actions.dispute.open({
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
                issues={flow.validation.metadata.category}
              />
            )}

            {currentStep.id === METADATA_STEP_FACTCHECK && (
              <Factcheck
                selection={flow.state.metadataDraft.factcheckSelection}
                value={flow.state.metadataDraft.factcheckValue}
                isComplete={flow.state.flags.hasFactcheckStepSaved}
                isSaving={flow.status.isFactcheckPending}
                onSelectionChange={flow.actions.metadata.changeFactcheckSelection}
                onValueChange={flow.actions.metadata.changeFactcheckValue}
                onSave={
                  flow.state.flags.hasFactcheckStepSaved
                    ? flow.actions.confirmCurrentStep
                    : flow.actions.metadata.saveFactcheck
                }
                fieldTitle={currentStep.fieldTitle || ''}
                saveLabel={currentStep.primaryActionLabel}
                disputeLabel={currentStep.disputeActionLabel}
                onCreateDispute={() =>
                  flow.actions.dispute.open({
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
                issues={flow.validation.metadata.factcheck}
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
                  variant={
                    flow.state.hasUnsavedReviewAnswers
                      ? 'destructive'
                      : 'outline'
                  }
                  size="default"
                  onClick={flow.actions.answers.saveInProgress}
                  disabled={
                    !flow.state.hasUnsavedReviewAnswers ||
                    flow.status.isSavingPending
                  }
                >
                  {flow.status.isSavingPending ? (
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
                  onClick={flow.actions.nextStep}
                  disabled={flow.state.isLastStep}
                >
                  Nächste Frage
                </Button>
              </div>
            }
          >
            <RenderFieldsWithHeaders
              currentQuestion={currentQuestion}
              questionsValidationState={flow.validation.questions}
              onFieldChange={flow.actions.answers.changeField}
              onCreateReviewDispute={flow.actions.dispute.open}
              touchedQuestions={Array.from(flow.validation.touchedQuestionIds)}
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
                  onClick={flow.actions.nextStep}
                  disabled={flow.state.isLastStep}
                >
                  Weiter zum Abschließen
                </Button>
              </div>
            }
          >
            <FinalComment
              value={flow.state.displayedFinalComment}
              onChange={flow.actions.comment.change}
              onSave={flow.actions.comment.save}
              isSaving={flow.status.isSavingFinalComment}
              isDisabled={flow.state.isFinalCommentInputDisabled}
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
                  data-testid="submit-review"
                  onClick={flow.actions.submitReview}
                  disabled={
                    !flow.state.flags.isFinalStepEnabled ||
                    (!flow.state.flags.shouldSkipReviewQuestions &&
                      !flow.validation.isValidForSubmission) ||
                    flow.status.isSubmitting
                  }
                >
                  {flow.status.isSubmitting
                    ? 'Wird abgeschlossen...'
                    : 'Fall abschließen'}
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
