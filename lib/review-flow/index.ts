import {
  METADATA_STEP_TITLE,
  SUBMIT_STEP,
} from '@/lib/constants';
import { Case } from '@/lib/queries/getCase';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import {
  caseCategorySchema,
  CaseCategoryValue,
} from '@/lib/schemas/case-metadata-schemas';
import { InProgressReviewAnswer } from '@/lib/schemas/review-schemas';
import { reviewTemplateSchema } from '@/lib/schemas/template-schemas';
import { ReviewStep } from '@/lib/types';
import { getCaseKeywords } from '@/lib/utils/get-case-keywords';
import { buildInProgressReviewAnswerData } from '@/lib/utils/review-validation';
import { areStringArraysEqual, isDeepEqual } from './equality';

export type FactcheckSelection = 'yes' | 'no' | null;

export interface MetadataDraftState {
  title: string;
  userKeywords: string[];
  category: CaseCategoryValue | null;
  factcheckSelection: FactcheckSelection;
  factcheckValue: string;
}

export interface MetadataDirtyState {
  title: boolean;
  keywords: boolean;
  category: boolean;
  factcheck: boolean;
}

export interface ReviewFlowSnapshot {
  caseId: string;
  reviewTemplate: NonNullable<ReviewTemplate>;
  isSubmitted: boolean;
  isReviewTemplateFetching: boolean;
  userId?: string;
  hasTitle: boolean;
  hasCaseKeywords: boolean;
  hasUserKeywords: boolean;
  hasCategory: boolean;
  hasFactcheckStepSaved: boolean;
  shouldSkipReviewQuestions: boolean;
  isMetadataComplete: boolean;
  caseCategory: CaseCategoryValue | null;
  caseKeywords: string[];
  userKeywords: string[];
  metadataInitialDraft: MetadataDraftState;
  hasUserComment: boolean;
  latestUserComment: string;
  isTemplateSchemaValid: boolean;
  isFinalStepEnabled: boolean;
}

export interface ReviewFlowState {
  caseId: string;
  currentStepId: string;
  isLocked: boolean;
  metadataDraft: MetadataDraftState;
  metadataDirty: MetadataDirtyState;
  metadataSaved: MetadataDirtyState;
  answerDraft: NonNullable<ReviewTemplate>;
  savedReviewAnswers: InProgressReviewAnswer;
  finalCommentDraft: string;
  touchedStepIds: Set<string>;
  isCommentSaved: boolean;
}

const EMPTY_DIRTY_STATE: MetadataDirtyState = {
  title: false,
  keywords: false,
  category: false,
  factcheck: false,
};

const hasSameKeywords = (left: string[], right: string[]) => {
  return areStringArraysEqual(left, right);
};

const hasSameFactcheckDraft = (
  left: Pick<MetadataDraftState, 'factcheckSelection' | 'factcheckValue'>,
  right: Pick<MetadataDraftState, 'factcheckSelection' | 'factcheckValue'>,
) =>
  left.factcheckSelection === right.factcheckSelection &&
  left.factcheckValue === right.factcheckValue;

export const getInitialTitle = (caseData: NonNullable<Case>) => {
  const caseTitle = caseData.case_titles?.value?.trim();
  if (caseTitle) {
    return caseData.case_titles?.value ?? '';
  }

  const openGraphTitle = caseData.open_graph_data?.og_title?.trim();
  if (openGraphTitle) {
    return caseData.open_graph_data?.og_title ?? '';
  }

  return '';
};

export const initializeAnswerTemplate = (
  template: NonNullable<ReviewTemplate>,
): NonNullable<ReviewTemplate> =>
  template.map((question) => ({
    ...question,
    fields: question.fields.map((field) => ({
      ...field,
      answer_value: field.initial_answer_value ?? field.answer_value,
    })) as typeof question.fields,
  })) as NonNullable<ReviewTemplate>;

export const mergeAnswerTemplates = (
  incomingTemplate: NonNullable<ReviewTemplate>,
  currentTemplate: NonNullable<ReviewTemplate>,
): NonNullable<ReviewTemplate> => {
  const currentFieldValues = new Map<string, unknown>();

  currentTemplate.forEach((question) => {
    question.fields.forEach((field) => {
      if ('answer_value' in field) {
        currentFieldValues.set(field.id, field.answer_value);
      }
    });
  });

  return incomingTemplate.map((question) => ({
    ...question,
    fields: question.fields.map((field) => {
      if (!currentFieldValues.has(field.id)) {
        return field;
      }

      return {
        ...field,
        answer_value: currentFieldValues.get(field.id),
      } as typeof field;
    }) as typeof question.fields,
  })) as NonNullable<ReviewTemplate>;
};

const getLatestUserComment = (
  caseData: NonNullable<Case>,
  userId?: string,
): string => {
  if (!userId) {
    return '';
  }

  const userComments =
    caseData.case_comments?.filter((comment) => comment.author_id === userId) ??
    [];

  if (userComments.length === 0) {
    return '';
  }

  const latestUserComment = userComments.reduce((latestComment, currentComment) => {
    const latestTimestamp = latestComment.created_at
      ? new Date(latestComment.created_at).getTime()
      : 0;
    const currentTimestamp = currentComment.created_at
      ? new Date(currentComment.created_at).getTime()
      : 0;

    return currentTimestamp > latestTimestamp ? currentComment : latestComment;
  });

  return latestUserComment.content ?? '';
};

export const buildReviewFlowSnapshot = ({
  caseData,
  reviewTemplate,
  isSubmitted,
  isReviewTemplateFetching,
  userId,
}: {
  caseData: NonNullable<Case>;
  reviewTemplate: NonNullable<ReviewTemplate>;
  isSubmitted: boolean;
  isReviewTemplateFetching: boolean;
  userId?: string;
}): ReviewFlowSnapshot => {
  const userKeywords = userId
    ? (caseData.case_keywords?.find(
        (keywordSet) => keywordSet.created_by === userId,
      )?.values ?? [])
    : [];
  const caseKeywords = getCaseKeywords(caseData);
  const parsedCaseCategory = caseCategorySchema.safeParse(
    caseData.case_categories?.value,
  );
  const caseCategory = parsedCaseCategory.success ? parsedCaseCategory.data : null;
  const hasTitle = !!caseData.case_titles;
  const hasCaseKeywords = caseKeywords.length > 0;
  const hasUserKeywords = userKeywords.length > 0 && Boolean(userId);
  const hasCategory = !!caseData.case_categories;
  const hasFactcheckStepSaved = !!caseData.case_factchecks;
  const shouldSkipReviewQuestions =
    caseData.case_factchecks?.has_factcheck === true;
  const isMetadataComplete = hasTitle && hasCaseKeywords && hasCategory;
  const isTemplateSchemaValid =
    reviewTemplateSchema.array().safeParse(reviewTemplate).success;
  const latestUserComment = getLatestUserComment(caseData, userId);
  const hasUserComment = latestUserComment.length > 0;

  return {
    caseId: caseData.id,
    reviewTemplate,
    isSubmitted,
    isReviewTemplateFetching,
    userId,
    hasTitle,
    hasCaseKeywords,
    hasUserKeywords,
    hasCategory,
    hasFactcheckStepSaved,
    shouldSkipReviewQuestions,
    isMetadataComplete,
    caseCategory,
    caseKeywords,
    userKeywords,
    metadataInitialDraft: {
      title: getInitialTitle(caseData),
      userKeywords,
      category:
        (caseData.case_categories?.value as CaseCategoryValue | null) ?? null,
      factcheckSelection:
        caseData.case_factchecks?.has_factcheck === true
          ? 'yes'
          : caseData.case_factchecks?.has_factcheck === false
            ? 'no'
            : null,
      factcheckValue: caseData.case_factchecks?.value ?? '',
    },
    hasUserComment,
    latestUserComment,
    isTemplateSchemaValid,
    isFinalStepEnabled:
      isMetadataComplete &&
      (shouldSkipReviewQuestions || isTemplateSchemaValid),
  };
};

export const createInitialReviewFlowState = (
  snapshot: ReviewFlowSnapshot,
): ReviewFlowState => {
  const answerDraft = initializeAnswerTemplate(snapshot.reviewTemplate);

  return {
    caseId: snapshot.caseId,
    currentStepId: snapshot.isSubmitted ? SUBMIT_STEP : METADATA_STEP_TITLE,
    isLocked: snapshot.isSubmitted,
    metadataDraft: snapshot.metadataInitialDraft,
    metadataDirty: EMPTY_DIRTY_STATE,
    metadataSaved: {
      title: snapshot.hasTitle,
      keywords: snapshot.hasCaseKeywords,
      category: snapshot.hasCategory,
      factcheck: snapshot.hasFactcheckStepSaved,
    },
    answerDraft,
    savedReviewAnswers: buildInProgressReviewAnswerData(answerDraft),
    finalCommentDraft: '',
    touchedStepIds: new Set<string>(),
    isCommentSaved: snapshot.hasUserComment,
  };
};

export const hydrateReviewFlowState = (
  previousState: ReviewFlowState,
  snapshot: ReviewFlowSnapshot,
): ReviewFlowState => {
  if (previousState.caseId !== snapshot.caseId) {
    return createInitialReviewFlowState(snapshot);
  }

  const incomingAnswerDraft = initializeAnswerTemplate(snapshot.reviewTemplate);
  const mergedAnswerDraft = mergeAnswerTemplates(
    incomingAnswerDraft,
    previousState.answerDraft,
  );

  const nextTitleDirty =
    previousState.metadataDirty.title &&
    previousState.metadataDraft.title !== snapshot.metadataInitialDraft.title;
  const nextKeywordsDirty =
    previousState.metadataDirty.keywords &&
    !hasSameKeywords(
      previousState.metadataDraft.userKeywords,
      snapshot.metadataInitialDraft.userKeywords,
    );
  const nextCategoryDirty =
    previousState.metadataDirty.category &&
    previousState.metadataDraft.category !== snapshot.metadataInitialDraft.category;
  const nextFactcheckDirty =
    previousState.metadataDirty.factcheck &&
    !hasSameFactcheckDraft(
      {
        factcheckSelection: previousState.metadataDraft.factcheckSelection,
        factcheckValue: previousState.metadataDraft.factcheckValue,
      },
      {
        factcheckSelection: snapshot.metadataInitialDraft.factcheckSelection,
        factcheckValue: snapshot.metadataInitialDraft.factcheckValue,
      },
    );

  const hasUnsavedReviewAnswers = !isDeepEqual(
    buildInProgressReviewAnswerData(previousState.answerDraft),
    previousState.savedReviewAnswers,
  );

  return {
    ...previousState,
    currentStepId: snapshot.isSubmitted ? SUBMIT_STEP : previousState.currentStepId,
    isLocked: previousState.isLocked || snapshot.isSubmitted,
    metadataDraft: {
      title: nextTitleDirty
        ? previousState.metadataDraft.title
        : snapshot.metadataInitialDraft.title,
      userKeywords: nextKeywordsDirty
        ? previousState.metadataDraft.userKeywords
        : snapshot.metadataInitialDraft.userKeywords,
      category: nextCategoryDirty
        ? previousState.metadataDraft.category
        : snapshot.metadataInitialDraft.category,
      factcheckSelection: nextFactcheckDirty
        ? previousState.metadataDraft.factcheckSelection
        : snapshot.metadataInitialDraft.factcheckSelection,
      factcheckValue: nextFactcheckDirty
        ? previousState.metadataDraft.factcheckValue
        : snapshot.metadataInitialDraft.factcheckValue,
    },
    metadataDirty: {
      title: nextTitleDirty,
      keywords: nextKeywordsDirty,
      category: nextCategoryDirty,
      factcheck: nextFactcheckDirty,
    },
    metadataSaved: {
      title: previousState.metadataSaved.title || snapshot.hasTitle,
      keywords: previousState.metadataSaved.keywords || snapshot.hasCaseKeywords,
      category: previousState.metadataSaved.category || snapshot.hasCategory,
      factcheck:
        previousState.metadataSaved.factcheck || snapshot.hasFactcheckStepSaved,
    },
    answerDraft: mergedAnswerDraft,
    savedReviewAnswers: hasUnsavedReviewAnswers
      ? previousState.savedReviewAnswers
      : buildInProgressReviewAnswerData(mergedAnswerDraft),
    finalCommentDraft: snapshot.hasUserComment
      ? snapshot.latestUserComment
      : previousState.finalCommentDraft,
    isCommentSaved: previousState.isCommentSaved || snapshot.hasUserComment,
  };
};

export const updateAnswerTemplateValue = (
  template: NonNullable<ReviewTemplate>,
  questionId: string,
  fieldId: string,
  value: unknown,
): NonNullable<ReviewTemplate> =>
  template.map((question) => {
    if (question.id !== questionId) {
      return question;
    }

    return {
      ...question,
      fields: question.fields.map((field) => {
        if (field.id !== fieldId) {
          return field;
        }

        return {
          ...field,
          answer_value: value,
        } as typeof field;
      }) as typeof question.fields,
    };
  }) as NonNullable<ReviewTemplate>;

export const buildReachableSteps = (steps: ReviewStep[]): ReviewStep[] => {
  const firstBlockingIndex = steps.findIndex((step) => !step.isComplete);

  if (firstBlockingIndex === -1) {
    return steps;
  }

  return steps.slice(0, firstBlockingIndex + 1);
};

export const repairCurrentStepId = ({
  currentStepId,
  allSteps,
  reachableSteps,
}: {
  currentStepId: string;
  allSteps: ReviewStep[];
  reachableSteps: ReviewStep[];
}) => {
  if (reachableSteps.some((step) => step.id === currentStepId)) {
    return currentStepId;
  }

  const currentStepIndex = allSteps.findIndex((step) => step.id === currentStepId);
  if (currentStepIndex >= 0) {
    for (let index = currentStepIndex; index >= 0; index -= 1) {
      const step = allSteps[index];
      if (step && reachableSteps.some((candidate) => candidate.id === step.id)) {
        return step.id;
      }
    }
  }

  return reachableSteps[0]?.id ?? METADATA_STEP_TITLE;
};

export const buildMetadataDirtyState = (
  metadataDirty: MetadataDirtyState,
): boolean =>
  metadataDirty.title ||
  metadataDirty.keywords ||
  metadataDirty.category ||
  metadataDirty.factcheck;
