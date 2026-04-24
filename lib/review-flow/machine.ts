import { SUBMIT_STEP } from '@/lib/constants';
import type { Field } from '@/lib/schemas/field-schemas';
import type { InProgressReviewAnswer } from '@/lib/schemas/review-schemas';
import type { CaseCategoryValue } from '@/lib/schemas/case-metadata-schemas';
import {
  hydrateReviewFlowState,
  updateAnswerTemplateValue,
} from './index';
import type {
  FactcheckSelection,
  ReviewFlowSnapshot,
  ReviewFlowState,
} from './index';
import type { MetadataStepKey } from './validation';

export const REVIEW_FLOW_PHASES = [
  'metadata',
  'questions',
  'comment',
  'submit',
] as const;

export const REVIEW_FLOW_TRANSITIONS = {
  HYDRATE: 'merge server snapshot; never unlock an already locked review',
  NAVIGATE: 'move to enabled step; touch the step being left',
  REPAIR_CURRENT_STEP: 'move current step after dynamic step changes',
  UPDATE_METADATA: 'edit unlocked metadata draft and mark field dirty',
  UPDATE_ANSWER: 'edit unlocked answer draft immutably',
  METADATA_SAVE_SUCCEEDED: 'mark metadata saved and advance',
  REVIEW_ANSWERS_SAVE_SUCCEEDED: 'replace saved answer baseline',
  COMMENT_SAVE_SUCCEEDED: 'mark local comment saved',
  STEPS_TOUCHED: 'mark explicit steps as touched',
  SUBMIT_ATTEMPTED: 'touch all incomplete steps',
  SUBMIT_SUCCEEDED: 'save answers, lock review, jump to submit',
} as const;

export type ReviewFlowEvent =
  | { type: 'HYDRATE'; snapshot: ReviewFlowSnapshot }
  | { type: 'NAVIGATE'; stepId: string; enabledStepIds: readonly string[] }
  | { type: 'REPAIR_CURRENT_STEP'; stepId: string }
  | { type: 'UPDATE_TITLE'; value: string }
  | { type: 'UPDATE_KEYWORDS'; value: string[] }
  | { type: 'UPDATE_CATEGORY'; value: CaseCategoryValue | null }
  | { type: 'UPDATE_FACTCHECK_SELECTION'; value: FactcheckSelection }
  | { type: 'UPDATE_FACTCHECK_VALUE'; value: string }
  | {
      type: 'UPDATE_ANSWER';
      questionId: string;
      fieldId: string;
      value: Field['answer_value'];
    }
  | { type: 'METADATA_SAVE_SUCCEEDED'; step: MetadataStepKey; nextStepId: string }
  | { type: 'REVIEW_ANSWERS_SAVE_SUCCEEDED'; data: InProgressReviewAnswer }
  | { type: 'SET_FINAL_COMMENT'; value: string }
  | { type: 'COMMENT_SAVE_SUCCEEDED' }
  | { type: 'STEPS_TOUCHED'; stepIds: readonly string[] }
  | { type: 'SUBMIT_ATTEMPTED'; incompleteStepIds: readonly string[] }
  | { type: 'SUBMIT_SUCCEEDED'; data: InProgressReviewAnswer };

const touchSteps = (
  touchedStepIds: Set<string>,
  stepIds: readonly string[],
) => {
  const nextTouchedStepIds = new Set(touchedStepIds);
  stepIds.forEach((stepId) => nextTouchedStepIds.add(stepId));
  return nextTouchedStepIds;
};

const touchCurrentStep = (state: ReviewFlowState) =>
  touchSteps(state.touchedStepIds, [state.currentStepId]);

export const transitionReviewFlow = (
  state: ReviewFlowState,
  event: ReviewFlowEvent,
): ReviewFlowState => {
  switch (event.type) {
    case 'HYDRATE':
      return hydrateReviewFlowState(state, event.snapshot);
    case 'NAVIGATE':
      if (
        state.isLocked ||
        event.stepId === state.currentStepId ||
        !event.enabledStepIds.includes(event.stepId)
      ) {
        return state;
      }

      return {
        ...state,
        currentStepId: event.stepId,
        touchedStepIds: touchCurrentStep(state),
      };
    case 'REPAIR_CURRENT_STEP':
      return event.stepId === state.currentStepId
        ? state
        : { ...state, currentStepId: event.stepId };
    case 'UPDATE_TITLE':
      if (state.isLocked) return state;
      return {
        ...state,
        metadataDraft: { ...state.metadataDraft, title: event.value },
        metadataDirty: { ...state.metadataDirty, title: true },
      };
    case 'UPDATE_KEYWORDS':
      if (state.isLocked) return state;
      return {
        ...state,
        metadataDraft: { ...state.metadataDraft, userKeywords: event.value },
        metadataDirty: { ...state.metadataDirty, keywords: event.value.length > 0 },
      };
    case 'UPDATE_CATEGORY':
      if (state.isLocked) return state;
      return {
        ...state,
        metadataDraft: { ...state.metadataDraft, category: event.value },
        metadataDirty: { ...state.metadataDirty, category: true },
      };
    case 'UPDATE_FACTCHECK_SELECTION':
      if (state.isLocked) return state;
      return {
        ...state,
        metadataDraft: {
          ...state.metadataDraft,
          factcheckSelection: event.value,
        },
        metadataDirty: { ...state.metadataDirty, factcheck: true },
      };
    case 'UPDATE_FACTCHECK_VALUE':
      if (state.isLocked) return state;
      return {
        ...state,
        metadataDraft: { ...state.metadataDraft, factcheckValue: event.value },
        metadataDirty: { ...state.metadataDirty, factcheck: true },
      };
    case 'UPDATE_ANSWER':
      if (state.isLocked) return state;
      return {
        ...state,
        answerDraft: updateAnswerTemplateValue(
          state.answerDraft,
          event.questionId,
          event.fieldId,
          event.value,
        ),
      };
    case 'METADATA_SAVE_SUCCEEDED':
      if (state.isLocked) return state;
      return {
        ...state,
        currentStepId: event.nextStepId,
        touchedStepIds: touchCurrentStep(state),
        metadataDirty: { ...state.metadataDirty, [event.step]: false },
        metadataSaved: { ...state.metadataSaved, [event.step]: true },
      };
    case 'REVIEW_ANSWERS_SAVE_SUCCEEDED':
      return { ...state, savedReviewAnswers: event.data };
    case 'SET_FINAL_COMMENT':
      return state.isLocked ? state : { ...state, finalCommentDraft: event.value };
    case 'COMMENT_SAVE_SUCCEEDED':
      return { ...state, isCommentSaved: true };
    case 'STEPS_TOUCHED':
      return {
        ...state,
        touchedStepIds: touchSteps(state.touchedStepIds, event.stepIds),
      };
    case 'SUBMIT_ATTEMPTED':
      return {
        ...state,
        touchedStepIds: touchSteps(state.touchedStepIds, event.incompleteStepIds),
      };
    case 'SUBMIT_SUCCEEDED':
      return {
        ...state,
        currentStepId: SUBMIT_STEP,
        isLocked: true,
        savedReviewAnswers: event.data,
      };
    default:
      return state;
  }
};
