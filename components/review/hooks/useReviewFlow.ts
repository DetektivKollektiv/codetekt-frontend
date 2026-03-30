'use client';

import {
  COMMENT_STEP,
  METADATA_STEP_CATEGORY,
  METADATA_STEP_FACTCHECK,
  METADATA_STEP_KEYWORDS,
  METADATA_STEP_TITLE,
  SUBMIT_STEP,
} from '@/lib/constants';
import {
  buildMetadataDirtyState,
  buildReachableSteps,
  buildReviewFlowSnapshot,
  createInitialReviewFlowState,
  FactcheckSelection,
  hydrateReviewFlowState,
  repairCurrentStepId,
  ReviewFlowSnapshot,
  ReviewFlowState,
  updateAnswerTemplateValue,
} from '@/lib/review-flow';
import { Case } from '@/lib/queries/getCase';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import {
  caseCategorySchema,
  CaseCategoryValue,
  caseFactcheckSchema,
  caseKeywordsSchema,
  caseTitleSchema,
} from '@/lib/schemas/case-metadata-schemas';
import { Field } from '@/lib/schemas/field-schemas';
import { ReviewStep, ReviewStepStatus } from '@/lib/types';
import { resolveReviewTemplateConditions } from '@/lib/utils/condition-evaluator';
import { filterShownQuestions } from '@/lib/utils/review-question-navigation';
import {
  buildInProgressReviewAnswerData,
  getQuestionsValidationState,
  validateSubmittedReviewAnswer,
} from '@/lib/utils/review-validation';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { $ZodIssue } from 'zod/v4/core';
import { createClient } from '@/lib/supabase/client';
import { useMetadataSave } from './useMetadataSave';
import { useReviewDispute } from './useReviewDispute';
import { useReviewSubmission } from './useReviewSubmission';
import { useSaveFinalComment } from './useSaveFinalComment';
import { useUnsavedChangesWarning } from './useUnsavedChangesWarning';

interface UseReviewFlowOptions {
  reviewTemplate: NonNullable<ReviewTemplate>;
  caseData: NonNullable<Case>;
  isSubmitted: boolean;
  isReviewTemplateFetching: boolean;
  userId?: string;
}

type ReviewFlowAction =
  | { type: 'hydrate'; snapshot: ReviewFlowSnapshot }
  | { type: 'navigate'; stepId: string }
  | { type: 'set_current'; stepId: string }
  | { type: 'set_locked'; value: boolean }
  | { type: 'update_title'; value: string }
  | { type: 'update_keywords'; value: string[] }
  | { type: 'update_category'; value: CaseCategoryValue | null }
  | { type: 'update_factcheck_selection'; value: FactcheckSelection }
  | { type: 'update_factcheck_value'; value: string }
  | {
      type: 'update_answer';
      questionId: string;
      fieldId: string;
      value: Field['answer_value'];
    }
  | {
      type: 'mark_metadata_saved';
      step: 'title' | 'keywords' | 'category' | 'factcheck';
    }
  | {
      type: 'mark_review_answers_saved';
      data: ReturnType<typeof buildInProgressReviewAnswerData>;
    }
  | { type: 'set_final_comment'; value: string }
  | { type: 'mark_comment_saved' }
  | { type: 'mark_step_touched'; stepId: string };

const markTouched = (stepIds: Set<string>, stepId: string) => {
  const nextTouchedStepIds = new Set(stepIds);
  nextTouchedStepIds.add(stepId);
  return nextTouchedStepIds;
};

const createCustomIssue = (
  path: PropertyKey[],
  message: string,
): $ZodIssue =>
  ({
    code: 'custom',
    path,
    message,
  }) as unknown as $ZodIssue;

const reviewFlowReducer = (
  state: ReviewFlowState,
  action: ReviewFlowAction,
): ReviewFlowState => {
  switch (action.type) {
    case 'hydrate':
      return hydrateReviewFlowState(state, action.snapshot);
    case 'navigate':
      if (action.stepId === state.currentStepId) {
        return state;
      }

      return {
        ...state,
        currentStepId: action.stepId,
        touchedStepIds: markTouched(state.touchedStepIds, state.currentStepId),
      };
    case 'set_current':
      if (action.stepId === state.currentStepId) {
        return state;
      }

      return {
        ...state,
        currentStepId: action.stepId,
      };
    case 'set_locked':
      return {
        ...state,
        isLocked: action.value,
      };
    case 'update_title':
      return {
        ...state,
        metadataDraft: {
          ...state.metadataDraft,
          title: action.value,
        },
        metadataDirty: {
          ...state.metadataDirty,
          title: true,
        },
      };
    case 'update_keywords':
      return {
        ...state,
        metadataDraft: {
          ...state.metadataDraft,
          keywords: action.value,
        },
        metadataDirty: {
          ...state.metadataDirty,
          keywords: true,
        },
      };
    case 'update_category':
      return {
        ...state,
        metadataDraft: {
          ...state.metadataDraft,
          category: action.value,
        },
        metadataDirty: {
          ...state.metadataDirty,
          category: true,
        },
      };
    case 'update_factcheck_selection':
      return {
        ...state,
        metadataDraft: {
          ...state.metadataDraft,
          factcheckSelection: action.value,
        },
        metadataDirty: {
          ...state.metadataDirty,
          factcheck: true,
        },
      };
    case 'update_factcheck_value':
      return {
        ...state,
        metadataDraft: {
          ...state.metadataDraft,
          factcheckValue: action.value,
        },
        metadataDirty: {
          ...state.metadataDirty,
          factcheck: true,
        },
      };
    case 'update_answer':
      return {
        ...state,
        answerDraft: updateAnswerTemplateValue(
          state.answerDraft,
          action.questionId,
          action.fieldId,
          action.value,
        ),
      };
    case 'mark_metadata_saved':
      return {
        ...state,
        metadataDirty: {
          ...state.metadataDirty,
          [action.step]: false,
        },
        metadataSaved: {
          ...state.metadataSaved,
          [action.step]: true,
        },
      };
    case 'mark_review_answers_saved':
      return {
        ...state,
        savedReviewAnswers: action.data,
      };
    case 'set_final_comment':
      return {
        ...state,
        finalCommentDraft: action.value,
      };
    case 'mark_comment_saved':
      return {
        ...state,
        isCommentSaved: true,
      };
    case 'mark_step_touched':
      return {
        ...state,
        touchedStepIds: markTouched(state.touchedStepIds, action.stepId),
      };
    default:
      return state;
  }
};

export const useReviewFlow = ({
  reviewTemplate,
  caseData,
  isSubmitted,
  isReviewTemplateFetching,
  userId,
}: UseReviewFlowOptions) => {
  const supabase = createClient();

  const snapshot = useMemo(
    () =>
      buildReviewFlowSnapshot({
        caseData,
        reviewTemplate,
        isSubmitted,
        isReviewTemplateFetching,
        userId,
      }),
    [caseData, isReviewTemplateFetching, isSubmitted, reviewTemplate, userId],
  );

  const [state, dispatch] = useReducer(
    reviewFlowReducer,
    snapshot,
    createInitialReviewFlowState,
  );

  useEffect(() => {
    dispatch({ type: 'hydrate', snapshot });
  }, [snapshot]);

  const {
    saveTitle,
    saveKeywords,
    saveCategory,
    saveFactcheck,
    isTitlePending,
    isKeywordsPending,
    isCategoryPending,
    isFactcheckPending,
  } = useMetadataSave({
    supabase,
    caseId: caseData.id,
    userId,
  });

  const effectiveHasTitle = state.metadataSaved.title;
  const effectiveHasKeywords = state.metadataSaved.keywords;
  const effectiveHasCategory = state.metadataSaved.category;
  const effectiveHasFactcheckStepSaved = state.metadataSaved.factcheck;
  const effectiveCaseCategory = effectiveHasCategory
    ? state.metadataDraft.category
    : snapshot.caseCategory;
  const effectiveShouldSkipReviewQuestions =
    effectiveHasFactcheckStepSaved &&
    state.metadataDraft.factcheckSelection === 'yes';
  const effectiveMetadataComplete =
    effectiveHasTitle && effectiveHasKeywords && effectiveHasCategory;
  const effectiveFinalStepEnabled =
    effectiveMetadataComplete &&
    (effectiveShouldSkipReviewQuestions || snapshot.isTemplateSchemaValid);

  const resolvedReviewTemplate = useMemo(
    () =>
      resolveReviewTemplateConditions(state.answerDraft, effectiveCaseCategory),
    [effectiveCaseCategory, state.answerDraft],
  );

  const shownReviewTemplateQuestions = useMemo(
    () => filterShownQuestions(resolvedReviewTemplate),
    [resolvedReviewTemplate],
  );

  const shownQuestionIds = useMemo(
    () => new Set(shownReviewTemplateQuestions.map((question) => question.id)),
    [shownReviewTemplateQuestions],
  );

  const touchedQuestionIds = useMemo(
    () =>
      new Set(
        [...state.touchedStepIds].filter((stepId) => shownQuestionIds.has(stepId)),
      ),
    [shownQuestionIds, state.touchedStepIds],
  );

  const inProgressReviewAnswerData = useMemo(
    () => buildInProgressReviewAnswerData(state.answerDraft),
    [state.answerDraft],
  );

  const isValidForSubmission = useMemo(() => {
    const validationResult = validateSubmittedReviewAnswer(
      inProgressReviewAnswerData,
      effectiveCaseCategory,
    );
    return validationResult.success;
  }, [effectiveCaseCategory, inProgressReviewAnswerData]);

  const questionsValidationState = useMemo(
    () =>
      getQuestionsValidationState(
        resolvedReviewTemplate,
        inProgressReviewAnswerData,
        effectiveCaseCategory,
        touchedQuestionIds,
      ),
    [
      effectiveCaseCategory,
      inProgressReviewAnswerData,
      resolvedReviewTemplate,
      touchedQuestionIds,
    ],
  );

  const titleIssues = useMemo<$ZodIssue[]>(() => {
    if (effectiveHasTitle) return [];
    const result = caseTitleSchema.safeParse(state.metadataDraft.title);
    return result.success ? [] : result.error.issues;
  }, [effectiveHasTitle, state.metadataDraft.title]);

  const keywordsIssues = useMemo<$ZodIssue[]>(() => {
    if (effectiveHasKeywords) return [];
    const result = caseKeywordsSchema.safeParse(state.metadataDraft.keywords);
    return result.success ? [] : result.error.issues;
  }, [effectiveHasKeywords, state.metadataDraft.keywords]);

  const categoryIssues = useMemo<$ZodIssue[]>(() => {
    if (effectiveHasCategory) return [];
    const result = caseCategorySchema.safeParse(state.metadataDraft.category);
    return result.success ? [] : result.error.issues;
  }, [effectiveHasCategory, state.metadataDraft.category]);

  const factcheckIssues = useMemo<$ZodIssue[]>(() => {
    if (effectiveHasFactcheckStepSaved) return [];

    if (!state.metadataDraft.factcheckSelection) {
      return [
        createCustomIssue(
          ['hasFactcheck'],
          'Bitte wähle aus, ob bereits ein Faktencheck existiert.',
        ),
      ];
    }

    const result = caseFactcheckSchema.safeParse({
      hasFactcheck: state.metadataDraft.factcheckSelection === 'yes',
      value:
        state.metadataDraft.factcheckSelection === 'yes'
          ? state.metadataDraft.factcheckValue.trim() || null
          : null,
    });

    return result.success ? [] : result.error.issues;
  }, [
    effectiveHasFactcheckStepSaved,
    state.metadataDraft.factcheckSelection,
    state.metadataDraft.factcheckValue,
  ]);

  const titleStatus: ReviewStepStatus = effectiveHasTitle
    ? 'success'
    : state.touchedStepIds.has(METADATA_STEP_TITLE) && titleIssues.length > 0
      ? 'error'
      : 'incomplete';

  const keywordsStatus: ReviewStepStatus = effectiveHasKeywords
    ? 'success'
    : state.touchedStepIds.has(METADATA_STEP_KEYWORDS) &&
        keywordsIssues.length > 0
      ? 'error'
      : 'incomplete';

  const categoryStatus: ReviewStepStatus = effectiveHasCategory
    ? 'success'
    : state.touchedStepIds.has(METADATA_STEP_CATEGORY) &&
        categoryIssues.length > 0
      ? 'error'
      : 'incomplete';

  const factcheckStatus: ReviewStepStatus = effectiveHasFactcheckStepSaved
    ? 'success'
    : state.touchedStepIds.has(METADATA_STEP_FACTCHECK) &&
        factcheckIssues.length > 0
      ? 'error'
      : 'incomplete';

  const commentStatus: ReviewStepStatus =
    snapshot.hasUserComment ||
    state.isCommentSaved ||
    state.touchedStepIds.has(COMMENT_STEP)
      ? 'success'
      : undefined;

  const submitBlockers = useMemo(() => {
    const blockers: string[] = [];

    if (!effectiveFinalStepEnabled) {
      blockers.push('final_step_disabled');
    }

    if (!effectiveShouldSkipReviewQuestions && !isValidForSubmission) {
      blockers.push('review_incomplete');
    }

    return blockers;
  }, [
    effectiveFinalStepEnabled,
    effectiveShouldSkipReviewQuestions,
    isValidForSubmission,
  ]);

  const allSteps = useMemo<ReviewStep[]>(() => {
    const reviewSteps: ReviewStep[] = [
      {
        id: METADATA_STEP_TITLE,
        label: 'Titel des Falls',
        description: effectiveHasTitle
          ? 'Bitte prüfe den Titel, der für diesen Fall vergeben wurde. Wenn der Titel den Fall gut beschreibt, klicke auf "Der Titel passt". Falls nicht, klicke auf "Titel beanstanden", damit der Titel von unserer Moderation geprüft werden kann.'
          : 'Vergib einen klaren und prägnanten Titel, damit der Fall später schnell verstanden und wiedergefunden werden kann.',
        fieldTitle: 'Titel',
        primaryActionLabel: effectiveHasTitle ? 'Der Titel passt' : 'Speichern',
        disputeActionLabel: 'Titel beanstanden',
        isIndented: false,
        status: titleStatus,
        kind: 'metadata',
        isComplete: effectiveHasTitle,
      },
      {
        id: METADATA_STEP_KEYWORDS,
        label: 'Stichwörter',
        description: effectiveHasKeywords
          ? 'Bitte prüfe die Stichwörter, die für diesen Fall bereits vergeben wurden. Wenn die Stichwörter den Fall gut beschreiben, klicke auf "Die Stichwörter passen". Falls nicht, klicke auf "Stichwörter beanstanden", damit die Stichwörter von unserer Moderation geprüft werden können.'
          : 'Ergänze passende Stichwörter, die den Inhalt des Falls treffend beschreiben und die Einordnung erleichtern.',
        primaryActionLabel: effectiveHasKeywords
          ? 'Die Stichwörter passen'
          : 'Speichern',
        disputeActionLabel: 'Stichwörter beanstanden',
        isIndented: false,
        status: keywordsStatus,
        kind: 'metadata',
        isComplete: effectiveHasKeywords,
      },
      {
        id: METADATA_STEP_CATEGORY,
        label: 'Kategorie',
        description: effectiveHasCategory
          ? 'Bitte prüfe die Kategorie, die für diesen Fall vergeben wurde. Wenn die Kategorie den Fall gut einordnet, klicke auf "Die Kategorie passt". Falls nicht, klicke auf "Kategorie beanstanden", damit die Kategorie von unserer Moderation geprüft werden kann.'
          : 'Wähle die passende Kategorie für den Fall. So werden die richtigen Bewertungskriterien für alle Reviewer angezeigt.',
        fieldTitle: 'Kategorie des Falls',
        primaryActionLabel: effectiveHasCategory
          ? 'Die Kategorie passt'
          : 'Speichern',
        disputeActionLabel: 'Kategorie beanstanden',
        isIndented: false,
        status: categoryStatus,
        kind: 'metadata',
        isComplete: effectiveHasCategory,
      },
      {
        id: METADATA_STEP_FACTCHECK,
        label: 'Faktencheck',
        description:
          'Gib an, ob für diesen Fall bereits ein Faktencheck existiert. Wenn ja, kannst du ihn im nächsten Feld ergänzen.',
        fieldTitle: 'Hat der Fall bereits einen Faktencheck?',
        primaryActionLabel: effectiveHasFactcheckStepSaved
          ? 'Faktencheck passt'
          : 'Speichern',
        disputeActionLabel: 'Einspruch erheben',
        isIndented: false,
        status: factcheckStatus,
        kind: 'metadata',
        isComplete: effectiveHasFactcheckStepSaved,
      },
      ...(!effectiveShouldSkipReviewQuestions
        ? shownReviewTemplateQuestions.map((question) => {
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

    if (effectiveHasFactcheckStepSaved) {
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
        status: state.isLocked
          ? 'success'
          : submitBlockers.length > 0
            ? 'incomplete'
            : undefined,
        kind: 'submit',
        isComplete:
          state.isLocked ||
          (effectiveFinalStepEnabled &&
            (effectiveShouldSkipReviewQuestions || isValidForSubmission)),
      });
    }

    return reviewSteps;
  }, [
    commentStatus,
    effectiveFinalStepEnabled,
    effectiveHasCategory,
    effectiveHasFactcheckStepSaved,
    effectiveHasKeywords,
    effectiveHasTitle,
    effectiveShouldSkipReviewQuestions,
    factcheckStatus,
    isValidForSubmission,
    keywordsStatus,
    questionsValidationState,
    shownReviewTemplateQuestions,
    state.isLocked,
    submitBlockers.length,
    titleStatus,
    categoryStatus,
  ]);

  const reachableSteps = useMemo(
    () => buildReachableSteps(allSteps),
    [allSteps],
  );

  const repairedCurrentStepId = useMemo(
    () =>
      repairCurrentStepId({
        currentStepId: state.currentStepId,
        allSteps,
        reachableSteps,
      }),
    [allSteps, reachableSteps, state.currentStepId],
  );

  useEffect(() => {
    if (repairedCurrentStepId !== state.currentStepId) {
      dispatch({ type: 'set_current', stepId: repairedCurrentStepId });
    }
  }, [repairedCurrentStepId, state.currentStepId]);

  const currentStep =
    reachableSteps.find((step) => step.id === repairedCurrentStepId) ??
    reachableSteps[0] ??
    null;
  const currentStepIndex = reachableSteps.findIndex(
    (step) => step.id === repairedCurrentStepId,
  );
  const currentQuestion =
    currentStep?.kind === 'question' ? currentStep.question : null;

  const hasUnsavedReviewAnswers =
    JSON.stringify(inProgressReviewAnswerData) !==
    JSON.stringify(state.savedReviewAnswers);
  const displayedKeywords = useMemo(() => {
    if (!effectiveHasKeywords) {
      return snapshot.existingKeywords;
    }

    const mergedKeywords = [...snapshot.existingKeywords];
    state.metadataDraft.keywords.forEach((keyword) => {
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
  }, [
    effectiveHasKeywords,
    snapshot.existingKeywords,
    state.metadataDraft.keywords,
  ]);
  const hasUnsavedChanges =
    buildMetadataDirtyState(state.metadataDirty) ||
    hasUnsavedReviewAnswers ||
    (!snapshot.hasUserComment &&
      !state.isCommentSaved &&
      state.finalCommentDraft.trim().length > 0);

  useUnsavedChangesWarning({
    hasUnsavedChanges,
    isActive: !state.isLocked,
  });

  const { saveInProgress, submitReview, isSavingPending, isSubmitting } =
    useReviewSubmission({
      supabase,
      caseId: caseData.id,
      onSubmitSuccess: () => {
        dispatch({ type: 'set_locked', value: true });
      },
    });

  const { saveFinalComment, isSavingFinalComment } = useSaveFinalComment({
    supabase,
    caseId: caseData.id,
    userId,
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
  });

  const navigateToStep = useCallback(
    (stepId: string) => {
      if (state.isLocked) return;
      if (!reachableSteps.some((step) => step.id === stepId)) return;
      dispatch({ type: 'navigate', stepId });
    },
    [reachableSteps, state.isLocked],
  );

  const goPrev = useCallback(() => {
    if (state.isLocked) return;
    if (currentStepIndex <= 0) return;
    const previousStep = reachableSteps[currentStepIndex - 1];
    if (previousStep) {
      dispatch({ type: 'navigate', stepId: previousStep.id });
    }
  }, [currentStepIndex, reachableSteps, state.isLocked]);

  const goNext = useCallback(() => {
    if (state.isLocked) return;
    if (currentStepIndex < 0 || currentStepIndex >= reachableSteps.length - 1) {
      return;
    }

    const nextStep = reachableSteps[currentStepIndex + 1];
    if (nextStep) {
      dispatch({ type: 'navigate', stepId: nextStep.id });
    }
  }, [currentStepIndex, reachableSteps, state.isLocked]);

  const markCurrentStepTouched = useCallback(() => {
    const stepId = currentStep?.id ?? repairedCurrentStepId;
    if (stepId) {
      dispatch({ type: 'mark_step_touched', stepId });
    }
  }, [currentStep?.id, repairedCurrentStepId]);

  const handleSaveTitle = useCallback(async () => {
    markCurrentStepTouched();
    if (titleIssues.length > 0) {
      return;
    }

    const didSave = await saveTitle(state.metadataDraft.title);
    if (!didSave) {
      return;
    }

    dispatch({ type: 'mark_metadata_saved', step: 'title' });
    dispatch({ type: 'navigate', stepId: METADATA_STEP_KEYWORDS });
  }, [
    markCurrentStepTouched,
    saveTitle,
    state.metadataDraft.title,
    titleIssues.length,
  ]);

  const handleSaveKeywords = useCallback(async () => {
    markCurrentStepTouched();
    if (keywordsIssues.length > 0) {
      return;
    }

    const didSave = await saveKeywords(state.metadataDraft.keywords);
    if (!didSave) {
      return;
    }

    dispatch({ type: 'mark_metadata_saved', step: 'keywords' });
    dispatch({ type: 'navigate', stepId: METADATA_STEP_CATEGORY });
  }, [
    keywordsIssues.length,
    markCurrentStepTouched,
    saveKeywords,
    state.metadataDraft.keywords,
  ]);

  const handleSaveCategory = useCallback(async () => {
    markCurrentStepTouched();
    if (categoryIssues.length > 0 || !state.metadataDraft.category) {
      return;
    }

    const didSave = await saveCategory(state.metadataDraft.category);
    if (!didSave) {
      return;
    }

    dispatch({ type: 'mark_metadata_saved', step: 'category' });
    dispatch({ type: 'navigate', stepId: METADATA_STEP_FACTCHECK });
  }, [
    categoryIssues.length,
    markCurrentStepTouched,
    saveCategory,
    state.metadataDraft.category,
  ]);

  const getNextStepAfterFactcheck = useCallback(() => {
    if (state.metadataDraft.factcheckSelection === 'yes') {
      return COMMENT_STEP;
    }

    return shownReviewTemplateQuestions[0]?.id ?? COMMENT_STEP;
  }, [shownReviewTemplateQuestions, state.metadataDraft.factcheckSelection]);

  const handleSaveFactcheck = useCallback(async () => {
    markCurrentStepTouched();
    if (factcheckIssues.length > 0 || !state.metadataDraft.factcheckSelection) {
      return;
    }

    const didSave = await saveFactcheck({
      hasFactcheck: state.metadataDraft.factcheckSelection === 'yes',
      value:
        state.metadataDraft.factcheckSelection === 'yes'
          ? state.metadataDraft.factcheckValue
          : null,
    });

    if (!didSave) {
      return;
    }

    dispatch({ type: 'mark_metadata_saved', step: 'factcheck' });
    dispatch({ type: 'navigate', stepId: getNextStepAfterFactcheck() });
  }, [
    factcheckIssues.length,
    getNextStepAfterFactcheck,
    markCurrentStepTouched,
    saveFactcheck,
    state.metadataDraft.factcheckSelection,
    state.metadataDraft.factcheckValue,
  ]);

  const handleSaveInProgress = useCallback(async () => {
    const didSave = await saveInProgress({
      data: inProgressReviewAnswerData,
      userId,
    });

    if (didSave) {
      dispatch({
        type: 'mark_review_answers_saved',
        data: inProgressReviewAnswerData,
      });
    }
  }, [inProgressReviewAnswerData, saveInProgress, userId]);

  const handleSaveFinalComment = useCallback(async () => {
    const didSave = await saveFinalComment(
      state.finalCommentDraft,
      effectiveFinalStepEnabled,
    );

    if (didSave) {
      dispatch({ type: 'mark_comment_saved' });
    }
  }, [effectiveFinalStepEnabled, saveFinalComment, state.finalCommentDraft]);

  const handleSubmitReview = useCallback(async () => {
    reachableSteps.forEach((step) => {
      if (!step.isComplete) {
        dispatch({ type: 'mark_step_touched', stepId: step.id });
      }
    });

    if (submitBlockers.length > 0) {
      return;
    }

    const didSubmit = await submitReview({
      userId,
      caseCategory: effectiveCaseCategory,
      hasFactcheck: effectiveShouldSkipReviewQuestions,
      inProgressReviewAnswerData,
    });

    if (!didSubmit) {
      return;
    }

    dispatch({
      type: 'mark_review_answers_saved',
      data: inProgressReviewAnswerData,
    });
    dispatch({ type: 'set_locked', value: true });
    dispatch({ type: 'set_current', stepId: SUBMIT_STEP });
  }, [
    effectiveCaseCategory,
    effectiveShouldSkipReviewQuestions,
    inProgressReviewAnswerData,
    reachableSteps,
    submitBlockers.length,
    submitReview,
    userId,
  ]);

  return {
    metadataDraft: state.metadataDraft,
    currentStep,
    currentQuestion,
    currentStepId: repairedCurrentStepId,
    steps: reachableSteps,
    navigation: {
      items: reachableSteps.map((step) => ({
        id: step.id,
        label: step.label,
        isIndented: step.isIndented,
        status: step.status,
      })),
      currentStepId: repairedCurrentStepId,
      canGoPrev: currentStepIndex > 0 && !state.isLocked,
      canGoNext:
        currentStepIndex >= 0 &&
        currentStepIndex < reachableSteps.length - 1 &&
        !state.isLocked,
      goPrev,
      goNext,
      selectStep: navigateToStep,
    },
    dialog: {
      isDisputeDialogOpen,
      setIsDisputeDialogOpen,
      disputingField,
      openDisputeDialog,
      handleDisputeSuccess,
    },
    questionsValidationState,
    touchedQuestionIds,
    hasTitle: effectiveHasTitle,
    hasKeywords: effectiveHasKeywords,
    hasCategory: effectiveHasCategory,
    hasFactcheckStepSaved: effectiveHasFactcheckStepSaved,
    shouldSkipReviewQuestions: effectiveShouldSkipReviewQuestions,
    isFinalStepEnabled: effectiveFinalStepEnabled,
    isValidForSubmission,
    hasUserComment: snapshot.hasUserComment,
    displayedFinalComment: snapshot.hasUserComment
      ? snapshot.latestUserComment
      : state.finalCommentDraft,
    isFinalCommentInputDisabled:
      !effectiveFinalStepEnabled || snapshot.hasUserComment || state.isCommentSaved,
    isLocked: state.isLocked,
    isLastStep: currentStepIndex === reachableSteps.length - 1,
    hasUnsavedChanges,
    hasUnsavedReviewAnswers,
    existingKeywords: displayedKeywords,
    keywordDraftKeywords: effectiveHasKeywords ? [] : state.metadataDraft.keywords,
    titleIssues: state.touchedStepIds.has(METADATA_STEP_TITLE) ? titleIssues : [],
    keywordsIssues: state.touchedStepIds.has(METADATA_STEP_KEYWORDS)
      ? keywordsIssues
      : [],
    categoryIssues: state.touchedStepIds.has(METADATA_STEP_CATEGORY)
      ? categoryIssues
      : [],
    factcheckIssues: state.touchedStepIds.has(METADATA_STEP_FACTCHECK)
      ? factcheckIssues
      : [],
    reviewTemplateWithAnswersValues: state.answerDraft,
    handleTitleChange: (value: string) =>
      dispatch({ type: 'update_title', value }),
    handleKeywordsChange: (value: string[]) =>
      dispatch({ type: 'update_keywords', value }),
    handleCategoryChange: (value: CaseCategoryValue | null) =>
      dispatch({ type: 'update_category', value }),
    handleFactcheckSelectionChange: (value: FactcheckSelection) =>
      dispatch({ type: 'update_factcheck_selection', value }),
    handleFactcheckValueChange: (value: string) =>
      dispatch({ type: 'update_factcheck_value', value }),
    handleFieldValueChange: (
      questionId: string,
      fieldId: string,
      value: Field['answer_value'],
    ) => dispatch({ type: 'update_answer', questionId, fieldId, value }),
    handleFinalCommentChange: (value: string) =>
      dispatch({ type: 'set_final_comment', value }),
    handleSaveTitle,
    handleSaveKeywords,
    handleSaveCategory,
    handleSaveFactcheck,
    handleSaveInProgress,
    handleSaveFinalComment,
    handleSubmitReview,
    handleConfirmCurrentStep: goNext,
    handleNextStep: goNext,
    isTitlePending,
    isKeywordsPending,
    isCategoryPending,
    isFactcheckPending,
    isSavingPending,
    isSubmitting,
    isSavingFinalComment,
    debug: {
      allStepIds: allSteps.map((step) => step.id),
      reachableStepIds: reachableSteps.map((step) => step.id),
      submitBlockers,
      repairedCurrentStepId,
    },
  };
};
