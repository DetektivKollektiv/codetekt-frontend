import {
  COMMENT_STEP,
  METADATA_STEP_CATEGORY,
  METADATA_STEP_FACTCHECK,
  METADATA_STEP_KEYWORDS,
  METADATA_STEP_TITLE,
  SUBMIT_STEP,
} from '@/lib/constants';
import type { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import type { CaseCategoryValue } from '@/lib/schemas/case-metadata-schemas';
import type { InProgressReviewAnswer } from '@/lib/schemas/review-schemas';
import type { ReviewStep } from '@/lib/types';
import { resolveReviewTemplateConditions } from '@/lib/utils/condition-evaluator';
import { filterShownQuestions } from '@/lib/utils/review-question-navigation';
import type { QuestionValidationState } from '@/lib/utils/review-validation';
import {
  buildInProgressReviewAnswerData,
  getQuestionsValidationState,
  validateSubmittedReviewAnswer,
} from '@/lib/utils/review-validation';
import { isDeepEqual } from './equality';
import type {
  FactcheckSelection,
  ReviewFlowSnapshot,
  ReviewFlowState,
} from './index';
import {
  buildMetadataDirtyState,
  buildEnabledSteps,
  repairCurrentStepId,
} from './index';
import type { MetadataValidationIssues } from './validation';
import {
  filterMetadataIssuesByTouched,
  getMetadataStepStatuses,
  validateMetadataDraft,
} from './validation';

export interface EffectiveReviewFlowState {
  hasTitle: boolean;
  hasCaseKeywords: boolean;
  hasUserKeywords: boolean;
  hasUnsavedUserKeywordDraft: boolean;
  hasCategory: boolean;
  hasFactcheckStepSaved: boolean;
  caseCategory: CaseCategoryValue | null;
  shouldSkipReviewQuestions: boolean;
  metadataComplete: boolean;
  finalStepEnabled: boolean;
}

export interface ReviewFlowSelection {
  effective: EffectiveReviewFlowState;
  metadataIssues: MetadataValidationIssues;
  visibleMetadataIssues: MetadataValidationIssues;
  questionsValidationState: Map<string, QuestionValidationState>;
  touchedQuestionIds: Set<string>;
  inProgressReviewAnswerData: InProgressReviewAnswer;
  isValidForSubmission: boolean;
  submitBlockers: string[];
  allSteps: ReviewStep[];
  enabledSteps: ReviewStep[];
  repairedCurrentStepId: string;
  currentStep: ReviewStep | null;
  currentQuestion: NonNullable<ReviewTemplate>[number] | null;
  currentStepIndex: number;
  caseKeywords: string[];
  userKeywordDraft: string[];
  displayedFinalComment: string;
  isFinalCommentInputDisabled: boolean;
  hasUnsavedReviewAnswers: boolean;
  hasUnsavedChanges: boolean;
  isUnsavedChangesWarningActive: boolean;
  resolvedReviewTemplate: NonNullable<ReviewTemplate>;
  shownReviewTemplateQuestions: NonNullable<ReviewTemplate>;
}

export const getEffectiveReviewFlowState = (
  state: ReviewFlowState,
  snapshot: ReviewFlowSnapshot,
): EffectiveReviewFlowState => {
  const hasTitle = state.metadataSaved.title;
  const hasCaseKeywords = state.metadataSaved.keywords;
  const hasUnsavedUserKeywordDraft =
    state.metadataDirty.keywords && state.metadataDraft.userKeywords.length > 0;
  const hasUserKeywords =
    snapshot.hasUserKeywords ||
    (!state.metadataDirty.keywords &&
      state.metadataDraft.userKeywords.length > 0);
  const hasCategory = state.metadataSaved.category;
  const hasFactcheckStepSaved = state.metadataSaved.factcheck;
  const caseCategory = hasCategory
    ? state.metadataDraft.category
    : snapshot.caseCategory;
  const shouldSkipReviewQuestions =
    hasFactcheckStepSaved && state.metadataDraft.factcheckSelection === 'yes';
  const metadataComplete =
    hasTitle && hasCaseKeywords && hasCategory && !hasUnsavedUserKeywordDraft;
  const finalStepEnabled =
    metadataComplete &&
    (shouldSkipReviewQuestions || snapshot.isTemplateSchemaValid);

  return {
    hasTitle,
    hasCaseKeywords,
    hasUserKeywords,
    hasUnsavedUserKeywordDraft,
    hasCategory,
    hasFactcheckStepSaved,
    caseCategory,
    shouldSkipReviewQuestions,
    metadataComplete,
    finalStepEnabled,
  };
};

export const mergeKeywordsCaseInsensitive = (
  caseKeywords: string[],
  draftKeywords: string[],
) => {
  const mergedKeywords = [...caseKeywords];

  draftKeywords.forEach((keyword) => {
    if (
      !mergedKeywords.some(
        (existingKeyword) =>
          existingKeyword.toLowerCase() === keyword.toLowerCase(),
      )
    ) {
      mergedKeywords.push(keyword);
    }
  });

  return mergedKeywords;
};

export const getNextStepAfterFactcheck = ({
  factcheckSelection,
  shownQuestions,
}: {
  factcheckSelection: FactcheckSelection;
  shownQuestions: NonNullable<ReviewTemplate>;
}) => {
  if (factcheckSelection === 'yes') {
    return COMMENT_STEP;
  }

  return shownQuestions[0]?.id ?? COMMENT_STEP;
};

export const getSubmitBlockers = ({
  finalStepEnabled,
  shouldSkipReviewQuestions,
  isValidForSubmission,
}: {
  finalStepEnabled: boolean;
  shouldSkipReviewQuestions: boolean;
  isValidForSubmission: boolean;
}) => {
  const blockers: string[] = [];

  if (!finalStepEnabled) {
    blockers.push('final_step_disabled');
  }

  if (!shouldSkipReviewQuestions && !isValidForSubmission) {
    blockers.push('review_incomplete');
  }

  return blockers;
};

export const getIncompleteStepIds = (steps: ReviewStep[]) =>
  steps.filter((step) => !step.isComplete).map((step) => step.id);

const buildReviewSteps = ({
  effective,
  statuses,
  questionsValidationState,
  shownQuestions,
  commentStatus,
  submitBlockers,
  isLocked,
  isValidForSubmission,
}: {
  effective: EffectiveReviewFlowState;
  statuses: ReturnType<typeof getMetadataStepStatuses>;
  questionsValidationState: Map<string, QuestionValidationState>;
  shownQuestions: NonNullable<ReviewTemplate>;
  commentStatus: ReviewStep['status'];
  submitBlockers: string[];
  isLocked: boolean;
  isValidForSubmission: boolean;
}): ReviewStep[] => {
  const reviewSteps: ReviewStep[] = [
    {
      id: METADATA_STEP_TITLE,
      label: 'Titel des Falls',
      description: effective.hasTitle
        ? 'Bitte prüfe den Titel, der für diesen Fall vergeben wurde. Wenn der Titel den Fall gut beschreibt, klicke auf "Der Titel passt". Falls nicht, klicke auf "Titel beanstanden", damit der Titel von unserer Moderation geprüft werden kann.'
        : 'Vergib einen klaren und prägnanten Titel, damit der Fall später schnell verstanden und wiedergefunden werden kann.',
      fieldTitle: 'Titel',
      primaryActionLabel: effective.hasTitle ? 'Der Titel passt' : 'Speichern',
      disputeActionLabel: 'Titel beanstanden',
      isIndented: false,
      status: statuses.title,
      kind: 'metadata',
      isComplete: effective.hasTitle,
    },
    {
      id: METADATA_STEP_KEYWORDS,
      label: 'Stichwörter',
      description: effective.hasCaseKeywords
        ? 'Bitte prüfe die Stichwörter, die für diesen Fall bereits vergeben wurden. Wenn die Stichwörter den Fall gut beschreiben, klicke auf "Die Stichwörter passen". Falls nicht, klicke auf "Stichwörter beanstanden", damit die Stichwörter von unserer Moderation geprüft werden können.'
        : 'Ergänze passende Stichwörter, die den Inhalt des Falls treffend beschreiben und die Einordnung erleichtern.',
      primaryActionLabel: effective.hasCaseKeywords
        ? 'Die Stichwörter passen'
        : 'Speichern',
      disputeActionLabel: 'Stichwörter beanstanden',
      isIndented: false,
      status: effective.hasUnsavedUserKeywordDraft
        ? 'incomplete'
        : statuses.keywords,
      kind: 'metadata',
      isComplete:
        effective.hasCaseKeywords && !effective.hasUnsavedUserKeywordDraft,
    },
    {
      id: METADATA_STEP_CATEGORY,
      label: 'Kategorie',
      description: effective.hasCategory
        ? 'Bitte prüfe die Kategorie, die für diesen Fall vergeben wurde. Wenn die Kategorie den Fall gut einordnet, klicke auf "Die Kategorie passt". Falls nicht, klicke auf "Kategorie beanstanden", damit die Kategorie von unserer Moderation geprüft werden kann.'
        : 'Wähle die passende Kategorie für den Fall. So werden die richtigen Bewertungskriterien für alle Reviewer angezeigt.',
      fieldTitle: 'Kategorie des Falls',
      primaryActionLabel: effective.hasCategory
        ? 'Die Kategorie passt'
        : 'Speichern',
      disputeActionLabel: 'Kategorie beanstanden',
      isIndented: false,
      status: statuses.category,
      kind: 'metadata',
      isComplete: effective.hasCategory,
    },
    {
      id: METADATA_STEP_FACTCHECK,
      label: 'Faktencheck',
      description:
        'Gib an, ob für diesen Fall bereits ein Faktencheck existiert. Wenn ja, kannst du ihn im nächsten Feld ergänzen. Einen Überblick über deutschsprachige Fakt-Checking Seiten findest du bspw. <a href="https://www.medien-in-die-schule.de/wp-content/uploads/FSM_Modul5_Materialblatt_Meinung_42_2.pdf" target="_blank" rel="noopener noreferrer">hier</a>.',
      fieldTitle: 'Hat der Fall bereits einen Faktencheck?',
      primaryActionLabel: effective.hasFactcheckStepSaved
        ? 'Einordnung passt'
        : 'Speichern',
      disputeActionLabel: 'Einspruch erheben',
      isIndented: false,
      status: statuses.factcheck,
      kind: 'metadata',
      isComplete: effective.hasFactcheckStepSaved,
    },
    ...(!effective.shouldSkipReviewQuestions
      ? shownQuestions.map((question) => {
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
        })
      : []),
  ];

  if (effective.hasFactcheckStepSaved) {
    reviewSteps.push({
      id: COMMENT_STEP,
      label: 'Kommentar hinzufügen',
      description:
        'Optional: Wenn du möchtest, kannst du noch einen zusammenfassenden Kommentar zu deiner Einschätzung hinzufügen.',
      isIndented: false,
      status: commentStatus,
      kind: 'comment',
      isComplete: true,
    });

    reviewSteps.push({
      id: SUBMIT_STEP,
      label: 'Fall abschließen',
      description:
        'Prüfe deine Angaben und schließe den Fall ab. Danach ist deine Bewertung eingereicht.',
      isIndented: false,
      status: isLocked
        ? 'success'
        : submitBlockers.length > 0
          ? 'incomplete'
          : undefined,
      kind: 'submit',
      isComplete:
        isLocked ||
        (effective.finalStepEnabled &&
          (effective.shouldSkipReviewQuestions || isValidForSubmission)),
    });
  }

  return reviewSteps;
};

export const selectReviewFlow = (
  state: ReviewFlowState,
  snapshot: ReviewFlowSnapshot,
): ReviewFlowSelection => {
  const effective = getEffectiveReviewFlowState(state, snapshot);
  const resolvedReviewTemplate = resolveReviewTemplateConditions(
    state.answerDraft,
    effective.caseCategory,
  );
  const shownReviewTemplateQuestions = filterShownQuestions(
    resolvedReviewTemplate,
  );
  const shownQuestionIds = new Set(
    shownReviewTemplateQuestions.map((question) => question.id),
  );
  const touchedQuestionIds = new Set(
    [...state.touchedStepIds].filter((stepId) => shownQuestionIds.has(stepId)),
  );
  const inProgressReviewAnswerData = buildInProgressReviewAnswerData(
    state.answerDraft,
  );
  const isValidForSubmission = validateSubmittedReviewAnswer(
    inProgressReviewAnswerData,
    effective.caseCategory,
  ).success;
  const questionsValidationState = getQuestionsValidationState(
    resolvedReviewTemplate,
    inProgressReviewAnswerData,
    effective.caseCategory,
    touchedQuestionIds,
  );
  const metadataIssues = validateMetadataDraft({
    metadataDraft: state.metadataDraft,
    metadataSaved: state.metadataSaved,
  });
  const visibleMetadataIssues = filterMetadataIssuesByTouched(
    metadataIssues,
    state.touchedStepIds,
  );
  const statuses = getMetadataStepStatuses({
    issues: metadataIssues,
    metadataSaved: state.metadataSaved,
    touchedStepIds: state.touchedStepIds,
  });
  const submitBlockers = getSubmitBlockers({
    finalStepEnabled: effective.finalStepEnabled,
    shouldSkipReviewQuestions: effective.shouldSkipReviewQuestions,
    isValidForSubmission,
  });
  const commentStatus =
    snapshot.hasUserComment ||
    state.isCommentSaved ||
    state.touchedStepIds.has(COMMENT_STEP)
      ? 'success'
      : 'incomplete';
  const allSteps = buildReviewSteps({
    effective,
    statuses,
    questionsValidationState,
    shownQuestions: shownReviewTemplateQuestions,
    commentStatus,
    submitBlockers,
    isLocked: state.isLocked,
    isValidForSubmission,
  });
  const enabledSteps = buildEnabledSteps(allSteps);
  const repairedCurrentStepId = repairCurrentStepId({
    currentStepId: state.currentStepId,
    allSteps,
    enabledSteps,
  });
  const currentStep =
    enabledSteps.find((step) => step.id === repairedCurrentStepId) ??
    enabledSteps[0] ??
    null;
  const currentStepIndex = enabledSteps.findIndex(
    (step) => step.id === repairedCurrentStepId,
  );
  const currentQuestion =
    currentStep?.kind === 'question' ? currentStep.question : null;
  const hasUnsavedReviewAnswers = !isDeepEqual(
    inProgressReviewAnswerData,
    state.savedReviewAnswers,
  );
  const hasUnsavedChanges =
    buildMetadataDirtyState(state.metadataDirty) ||
    hasUnsavedReviewAnswers ||
    (!snapshot.hasUserComment &&
      !state.isCommentSaved &&
      state.finalCommentDraft.trim().length > 0);

  return {
    effective,
    metadataIssues,
    visibleMetadataIssues,
    questionsValidationState,
    touchedQuestionIds,
    inProgressReviewAnswerData,
    isValidForSubmission,
    submitBlockers,
    allSteps,
    enabledSteps,
    repairedCurrentStepId,
    currentStep,
    currentQuestion,
    currentStepIndex,
    caseKeywords: effective.hasUserKeywords
      ? mergeKeywordsCaseInsensitive(
          snapshot.caseKeywords,
          state.metadataDraft.userKeywords,
        )
      : snapshot.caseKeywords,
    userKeywordDraft: effective.hasUserKeywords
      ? []
      : state.metadataDraft.userKeywords,
    displayedFinalComment: snapshot.hasUserComment
      ? snapshot.latestUserComment
      : state.finalCommentDraft,
    isFinalCommentInputDisabled:
      !effective.finalStepEnabled ||
      snapshot.hasUserComment ||
      state.isCommentSaved,
    hasUnsavedReviewAnswers,
    hasUnsavedChanges,
    isUnsavedChangesWarningActive: !state.isLocked && hasUnsavedChanges,
    resolvedReviewTemplate,
    shownReviewTemplateQuestions,
  };
};
