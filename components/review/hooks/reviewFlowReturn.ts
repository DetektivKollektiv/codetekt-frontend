import type { ReviewFlowSnapshot, ReviewFlowState } from '@/lib/review-flow';
import type { ReviewFlowSelection } from '@/lib/review-flow/selectors';
import type { useReviewAnswerActions } from './useReviewAnswerActions';
import type { useReviewCommentActions } from './useReviewCommentActions';
import type { useReviewDispute } from './useReviewDispute';
import type { useReviewMetadataActions } from './useReviewMetadataActions';
import type { useReviewNavigationActions } from './useReviewNavigationActions';
import type { useReviewPersistence } from './useReviewPersistence';

interface BuildReviewFlowReturnOptions {
  state: ReviewFlowState;
  snapshot: ReviewFlowSnapshot;
  selection: ReviewFlowSelection;
  persistence: ReturnType<typeof useReviewPersistence>;
  navigationActions: ReturnType<typeof useReviewNavigationActions>;
  metadataActions: ReturnType<typeof useReviewMetadataActions>;
  answerActions: ReturnType<typeof useReviewAnswerActions>;
  commentActions: ReturnType<typeof useReviewCommentActions>;
  dispute: ReturnType<typeof useReviewDispute>;
  isReviewTemplateFetching: boolean;
}

export const buildReviewFlowReturn = ({
  state,
  snapshot,
  selection,
  persistence,
  navigationActions,
  metadataActions,
  answerActions,
  commentActions,
  dispute,
  isReviewTemplateFetching,
}: BuildReviewFlowReturnOptions) => ({
  state: {
    machine: state,
    metadataDraft: state.metadataDraft,
    answerDraft: state.answerDraft,
    currentStep: selection.currentStep,
    currentQuestion: selection.currentQuestion,
    isLocked: state.isLocked,
    hasUserComment: snapshot.hasUserComment,
    displayedFinalComment: selection.displayedFinalComment,
    isFinalCommentInputDisabled: selection.isFinalCommentInputDisabled,
    caseKeywords: selection.caseKeywords,
    userKeywordDraft: selection.userKeywordDraft,
    hasUnsavedChanges: selection.hasUnsavedChanges,
    hasUnsavedReviewAnswers: selection.hasUnsavedReviewAnswers,
    isLastStep:
      selection.currentStepIndex === selection.enabledSteps.length - 1,
    flags: {
      hasTitle: selection.effective.hasTitle,
      hasCaseKeywords: selection.effective.hasCaseKeywords,
      hasUserKeywords: selection.effective.hasUserKeywords,
      hasCategory: selection.effective.hasCategory,
      hasFactcheckStepSaved: selection.effective.hasFactcheckStepSaved,
      shouldSkipReviewQuestions: selection.effective.shouldSkipReviewQuestions,
      isFinalStepEnabled: selection.effective.finalStepEnabled,
      isValidForSubmission: selection.isValidForSubmission,
    },
    dispute: {
      isOpen: dispute.isDisputeDialogOpen,
      field: dispute.disputingField,
    },
    debug: {
      allStepIds: selection.allSteps.map((step) => step.id),
      enabledStepIds: selection.enabledSteps.map((step) => step.id),
      submitBlockers: selection.submitBlockers,
      repairedCurrentStepId: selection.repairedCurrentStepId,
    },
  },
  navigation: {
    items: selection.allSteps.map((step) => ({
      id: step.id,
      label: step.label,
      isIndented: step.isIndented,
      status: step.status,
      disabled: !selection.enabledSteps.some(
        (enabledStep) => enabledStep.id === step.id,
      ),
    })),
    steps: selection.enabledSteps,
    currentStepId: selection.repairedCurrentStepId,
    currentStep: selection.currentStep,
    currentQuestion: selection.currentQuestion,
    canGoPrev: selection.currentStepIndex > 0 && !state.isLocked,
    canGoNext:
      selection.currentStepIndex >= 0 &&
      selection.currentStepIndex < selection.enabledSteps.length - 1 &&
      !state.isLocked,
    goPrev: navigationActions.goPrev,
    goNext: navigationActions.goNext,
    selectStep: navigationActions.selectStep,
  },
  validation: {
    metadata: selection.visibleMetadataIssues,
    allMetadata: selection.metadataIssues,
    questions: selection.questionsValidationState,
    touchedQuestionIds: selection.touchedQuestionIds,
    isValidForSubmission: selection.isValidForSubmission,
    submitBlockers: selection.submitBlockers,
  },
  actions: {
    metadata: metadataActions,
    answers: answerActions,
    comment: commentActions,
    submitReview: answerActions.submitReview,
    confirmCurrentStep: navigationActions.goNext,
    nextStep: navigationActions.goNext,
    dispute: {
      setOpen: dispute.setIsDisputeDialogOpen,
      open: dispute.openDisputeDialog,
      handleSuccess: dispute.handleDisputeSuccess,
    },
  },
  status: {
    ...persistence.status,
    isReviewTemplateFetching,
  },
});
