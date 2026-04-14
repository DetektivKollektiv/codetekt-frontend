import { describe, expect, it } from 'vitest';
import {
  COMMENT_STEP,
  METADATA_STEP_CATEGORY,
  METADATA_STEP_FACTCHECK,
  METADATA_STEP_KEYWORDS,
  METADATA_STEP_TITLE,
  SUBMIT_STEP,
} from '@/lib/constants';
import { Case } from '@/lib/queries/getCase';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { Field } from '@/lib/schemas/field-schemas';
import {
  buildReachableSteps,
  buildReviewFlowSnapshot,
  createInitialReviewFlowState,
  getInitialTitle,
  hydrateReviewFlowState,
  initializeAnswerTemplate,
  mergeAnswerTemplates,
  repairCurrentStepId,
  ReviewFlowState,
} from '..';
import {
  REVIEW_FLOW_TRANSITIONS,
  transitionReviewFlow,
} from '../machine';
import {
  getEffectiveReviewFlowState,
  getIncompleteStepIds,
  getNextStepAfterFactcheck,
  getSubmitBlockers,
  mergeKeywordsCaseInsensitive,
  selectReviewFlow,
} from '../selectors';
import {
  buildFactcheckSavePayload,
  validateMetadataDraft,
} from '../validation';
import { validateSubmittedReviewAnswer } from '@/lib/utils/review-validation';

type Template = NonNullable<ReviewTemplate>;
type Question = Template[number];

const userId = 'user-1';

const makeCase = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'case-1',
    case_titles: null,
    open_graph_data: null,
    case_keywords: [],
    case_categories: null,
    case_factchecks: null,
    case_comments: [],
    ...overrides,
  }) as unknown as NonNullable<Case>;

const completeCase = (overrides: Record<string, unknown> = {}) =>
  makeCase({
    case_titles: { value: 'A precise existing title' },
    case_keywords: [{ created_by: userId, values: ['alpha'] }],
    case_categories: { value: 'satire' },
    case_factchecks: { has_factcheck: false, value: null },
    ...overrides,
  });

const trafficField = (
  id: string,
  answerValue: Field['answer_value'] = 1,
  overrides: Partial<Field> = {},
) =>
  ({
    id,
    type: 'traffic-light',
    question: id,
    shortTip: '',
    options: [
      { id: `${id}-0`, color: 'red', value: 0 },
      { id: `${id}-1`, color: 'green', value: 1 },
    ],
    answer_value: answerValue,
    initial_answer_value: answerValue,
    ...overrides,
  }) as Field;

const question = (
  id: string,
  fields: Field[] = [trafficField('content_language')],
  metadata: Partial<Question['metadata']> = {},
) =>
  ({
    id,
    metadata: {
      title: id,
      text: `${id} text`,
      help_url: '',
      indent_level: 0,
      ...metadata,
    },
    fields,
  }) as Question;

const snapshot = ({
  caseData = completeCase(),
  template = [] as Template,
  submitted = false,
}: {
  caseData?: NonNullable<Case>;
  template?: Template;
  submitted?: boolean;
} = {}) =>
  buildReviewFlowSnapshot({
    caseData,
    reviewTemplate: template,
    isSubmitted: submitted,
    isReviewTemplateFetching: false,
    userId,
  });

const initialState = (flowSnapshot = snapshot()) =>
  createInitialReviewFlowState(flowSnapshot);

const patchState = (
  state: ReviewFlowState,
  patch: Partial<ReviewFlowState>,
): ReviewFlowState => ({
  ...state,
  ...patch,
});

describe('R1 - phases and step order', () => {
  it('builds metadata, visible questions, comment and submit in order', () => {
    const flowSnapshot = snapshot({
      caseData: completeCase({ case_categories: { value: 'report' } }),
      template: [
        question('question-a', [trafficField('content_language')]),
        question('question-b', [trafficField('content_accuracy')]),
      ],
    });

    const selection = selectReviewFlow(initialState(flowSnapshot), flowSnapshot);

    expect(selection.allSteps.map((step) => step.id)).toEqual([
      METADATA_STEP_TITLE,
      METADATA_STEP_KEYWORDS,
      METADATA_STEP_CATEGORY,
      METADATA_STEP_FACTCHECK,
      'question-a',
      'question-b',
      COMMENT_STEP,
      SUBMIT_STEP,
    ]);
  });

  it('does not expose comment and submit before factcheck is complete', () => {
    const flowSnapshot = snapshot({
      caseData: completeCase({ case_factchecks: null }),
      template: [question('question-a')],
    });
    const selection = selectReviewFlow(initialState(flowSnapshot), flowSnapshot);

    expect(selection.allSteps.map((step) => step.id)).not.toContain(COMMENT_STEP);
    expect(selection.allSteps.map((step) => step.id)).not.toContain(SUBMIT_STEP);
  });
});

describe('R2 - linear reachability', () => {
  it('keeps only steps up to the first incomplete step reachable', () => {
    const flowSnapshot = snapshot({
      caseData: completeCase({
        case_keywords: [],
        case_categories: null,
        case_factchecks: null,
      }),
    });
    const selection = selectReviewFlow(initialState(flowSnapshot), flowSnapshot);

    expect(selection.reachableSteps.map((step) => step.id)).toEqual([
      METADATA_STEP_TITLE,
      METADATA_STEP_KEYWORDS,
    ]);
  });

  it('ignores navigation to a non-reachable step', () => {
    const state = initialState(
      snapshot({
        caseData: completeCase({
          case_keywords: [],
          case_categories: null,
          case_factchecks: null,
        }),
      }),
    );

    const nextState = transitionReviewFlow(state, {
      type: 'NAVIGATE',
      stepId: SUBMIT_STEP,
      reachableStepIds: [METADATA_STEP_TITLE, METADATA_STEP_KEYWORDS],
    });

    expect(nextState.currentStepId).toBe(METADATA_STEP_TITLE);
  });
});

describe('R3 - entry and current step repair', () => {
  it('enters submitted reviews on the submit step', () => {
    const flowSnapshot = snapshot({ submitted: true });
    expect(initialState(flowSnapshot).currentStepId).toBe(SUBMIT_STEP);
  });

  it('repairs an unreachable current step by searching backwards', () => {
    const steps = [
      { id: 'a', isComplete: true },
      { id: 'b', isComplete: false },
      { id: 'c', isComplete: true },
    ] as ReturnType<typeof buildReachableSteps>;
    const reachableSteps = buildReachableSteps(steps);

    expect(
      repairCurrentStepId({
        currentStepId: 'c',
        allSteps: steps,
        reachableSteps,
      }),
    ).toBe('b');
  });
});

describe('R4 - locking', () => {
  it('blocks navigation and editing while locked', () => {
    const flowSnapshot = snapshot();
    const state = patchState(initialState(flowSnapshot), {
      isLocked: true,
      currentStepId: METADATA_STEP_TITLE,
    });

    const navigated = transitionReviewFlow(state, {
      type: 'NAVIGATE',
      stepId: METADATA_STEP_KEYWORDS,
      reachableStepIds: [METADATA_STEP_TITLE, METADATA_STEP_KEYWORDS],
    });
    const edited = transitionReviewFlow(state, {
      type: 'UPDATE_TITLE',
      value: 'Changed title',
    });

    expect(navigated.currentStepId).toBe(METADATA_STEP_TITLE);
    expect(edited.metadataDraft.title).toBe(state.metadataDraft.title);
  });

  it('submit success locks the review and hydration never unlocks it', () => {
    const flowSnapshot = snapshot();
    const submitted = transitionReviewFlow(initialState(flowSnapshot), {
      type: 'SUBMIT_SUCCEEDED',
      data: {},
    });
    const hydrated = hydrateReviewFlowState(submitted, {
      ...flowSnapshot,
      isSubmitted: false,
    });

    expect(submitted.isLocked).toBe(true);
    expect(submitted.currentStepId).toBe(SUBMIT_STEP);
    expect(hydrated.isLocked).toBe(true);
  });
});

describe('R5 - metadata common rules', () => {
  it('does not calculate saved metadata issues and exposes review labels', () => {
    const flowSnapshot = snapshot();
    const selection = selectReviewFlow(initialState(flowSnapshot), flowSnapshot);

    expect(selection.metadataIssues.title).toEqual([]);
    expect(selection.allSteps[0]).toMatchObject({
      id: METADATA_STEP_TITLE,
      status: 'success',
      disputeActionLabel: 'Titel beanstanden',
    });
  });

  it('shows validation errors only after touch and advances after save success', () => {
    const flowSnapshot = snapshot({
      caseData: makeCase({ open_graph_data: { og_title: '' } }),
    });
    const state = initialState(flowSnapshot);
    const untouched = selectReviewFlow(state, flowSnapshot);
    const touched = transitionReviewFlow(state, {
      type: 'STEPS_TOUCHED',
      stepIds: [METADATA_STEP_TITLE],
    });
    const saved = transitionReviewFlow(touched, {
      type: 'METADATA_SAVE_SUCCEEDED',
      step: 'title',
      nextStepId: METADATA_STEP_KEYWORDS,
    });

    expect(untouched.visibleMetadataIssues.title).toEqual([]);
    expect(selectReviewFlow(touched, flowSnapshot).visibleMetadataIssues.title)
      .not.toHaveLength(0);
    expect(saved.metadataSaved.title).toBe(true);
    expect(saved.currentStepId).toBe(METADATA_STEP_KEYWORDS);
  });
});

describe('R5.1 - title', () => {
  it('uses server title, then open graph title, then empty string', () => {
    expect(
      getInitialTitle(
        makeCase({
          case_titles: { value: 'Server title' },
          open_graph_data: { og_title: 'Open graph title' },
        }),
      ),
    ).toBe('Server title');
    expect(
      getInitialTitle(
        makeCase({
          open_graph_data: { og_title: 'Open graph title' },
        }),
      ),
    ).toBe('Open graph title');
    expect(getInitialTitle(makeCase())).toBe('');
  });
});

describe('R5.2 - keywords', () => {
  it('counts only current-user keywords as complete and aggregates all keywords', () => {
    const flowSnapshot = snapshot({
      caseData: completeCase({
        case_keywords: [
          { created_by: 'other-user', values: ['Alpha'] },
          { created_by: userId, values: [] },
        ],
      }),
    });
    const selection = selectReviewFlow(initialState(flowSnapshot), flowSnapshot);

    expect(flowSnapshot.hasKeywords).toBe(false);
    expect(selection.displayedKeywords).toEqual(['Alpha']);
    expect(mergeKeywordsCaseInsensitive(['Alpha'], ['alpha', 'Beta'])).toEqual([
      'Alpha',
      'Beta',
    ]);
  });
});

describe('R5.3 - category', () => {
  it('requires a selected category and uses saved draft as effective category', () => {
    const flowSnapshot = snapshot({
      caseData: completeCase({ case_categories: { value: 'report' } }),
    });
    const state = patchState(initialState(flowSnapshot), {
      metadataDraft: {
        ...initialState(flowSnapshot).metadataDraft,
        category: 'opinion',
      },
      metadataSaved: {
        ...initialState(flowSnapshot).metadataSaved,
        category: true,
      },
    });

    expect(
      validateMetadataDraft({
        metadataDraft: { ...state.metadataDraft, category: null },
        metadataSaved: { ...state.metadataSaved, category: false },
      }).category,
    ).not.toHaveLength(0);
    expect(getEffectiveReviewFlowState(state, flowSnapshot).caseCategory).toBe(
      'opinion',
    );
  });
});

describe('R5.4 - factcheck', () => {
  it('requires a selection and discards free text for no', () => {
    const flowSnapshot = snapshot({
      caseData: completeCase({ case_factchecks: null }),
    });
    const state = initialState(flowSnapshot);

    expect(
      validateMetadataDraft({
        metadataDraft: state.metadataDraft,
        metadataSaved: state.metadataSaved,
      }).factcheck[0]?.message,
    ).toContain('Faktencheck');
    expect(buildFactcheckSavePayload('no', 'https://example.com')).toEqual({
      hasFactcheck: false,
      value: null,
    });
    expect(buildFactcheckSavePayload('yes', 'https://example.com')).toEqual({
      hasFactcheck: true,
      value: 'https://example.com',
    });
  });
});

describe('R6 - skipping review questions', () => {
  it('skips questions when a saved factcheck exists and selection is yes', () => {
    const flowSnapshot = snapshot({
      caseData: completeCase({
        case_factchecks: {
          has_factcheck: true,
          value: 'https://example.com/factcheck',
        },
      }),
      template: [question('question-a')],
    });
    const selection = selectReviewFlow(initialState(flowSnapshot), flowSnapshot);

    expect(selection.allSteps.map((step) => step.id)).not.toContain('question-a');
    expect(
      getNextStepAfterFactcheck({
        factcheckSelection: 'yes',
        shownQuestions: [question('question-a')],
      }),
    ).toBe(COMMENT_STEP);
  });
});

describe('R7 - dynamic review template', () => {
  it('resolves conditional question visibility, indentation and help URLs', () => {
    const flowSnapshot = snapshot({
      caseData: completeCase({ case_categories: { value: 'report' } }),
      template: [
        question('driver', [trafficField('content_language', 1)]),
        question(
          'conditional',
          [
            trafficField('content_accuracy', 1, {
              is_shown: [
                {
                  field_id: 'content_language',
                  operator: '===',
                  value: 1,
                },
              ],
            }),
          ],
          { indent_level: 1, help_url: 'https://example.com/help' },
        ),
      ],
    });
    const selection = selectReviewFlow(initialState(flowSnapshot), flowSnapshot);
    const conditional = selection.allSteps.find(
      (step) => step.id === 'conditional',
    );

    expect(conditional).toMatchObject({
      isIndented: true,
      helpUrl: 'https://example.com/help',
    });
  });
});

describe('R8 - review question validation', () => {
  it('returns incomplete before touch, error after touch, and fails without category', () => {
    const flowSnapshot = snapshot({
      caseData: completeCase({ case_categories: { value: 'report' } }),
      template: [
        question('question-a', [
          trafficField(
            'content_language',
            Number.NaN as unknown as Field['answer_value'],
          ),
        ]),
      ],
    });
    const state = initialState(flowSnapshot);
    const touched = transitionReviewFlow(state, {
      type: 'STEPS_TOUCHED',
      stepIds: ['question-a'],
    });

    expect(
      selectReviewFlow(state, flowSnapshot).questionsValidationState.get(
        'question-a',
      )?.type,
    ).toBe('incomplete');
    expect(
      selectReviewFlow(touched, flowSnapshot).questionsValidationState.get(
        'question-a',
      )?.type,
    ).toBe('error');
    expect(validateSubmittedReviewAnswer({}, null).success).toBe(false);
  });
});

describe('R9 - answer draft and template merge', () => {
  it('initializes from initial answers and preserves user values on merge', () => {
    const incoming = initializeAnswerTemplate([
      question('question-a', [
        trafficField('content_language', 1),
        trafficField('content_accuracy', 0),
      ]),
    ]);
    const current = initializeAnswerTemplate([
      question('question-a', [trafficField('content_language', 4)]),
    ]);
    const merged = mergeAnswerTemplates(incoming, current);

    expect(merged[0]?.fields[0]?.answer_value).toBe(4);
    expect(merged[0]?.fields[1]?.answer_value).toBe(0);
  });

  it('keeps unsaved local answers through hydration', () => {
    const flowSnapshot = snapshot({
      template: [question('question-a', [trafficField('content_language', 1)])],
    });
    const edited = transitionReviewFlow(initialState(flowSnapshot), {
      type: 'UPDATE_ANSWER',
      questionId: 'question-a',
      fieldId: 'content_language',
      value: 4,
    });
    const hydrated = hydrateReviewFlowState(
      edited,
      snapshot({
        template: [
          question('question-a', [trafficField('content_language', 0)]),
        ],
      }),
    );

    expect(hydrated.answerDraft[0]?.fields[0]?.answer_value).toBe(4);
  });
});

describe('R10 - comment', () => {
  it('is complete, disabled after server comment, and success after touch', () => {
    const withServerComment = snapshot({
      caseData: completeCase({
        case_comments: [
          {
            author_id: userId,
            content: 'A stored final comment',
            created_at: '2024-01-01T00:00:00.000Z',
          },
        ],
      }),
    });
    const serverSelection = selectReviewFlow(
      initialState(withServerComment),
      withServerComment,
    );
    const withoutComment = snapshot();
    const touched = transitionReviewFlow(initialState(withoutComment), {
      type: 'STEPS_TOUCHED',
      stepIds: [COMMENT_STEP],
    });
    const touchedComment = selectReviewFlow(
      touched,
      withoutComment,
    ).allSteps.find((step) => step.id === COMMENT_STEP);

    expect(serverSelection.displayedFinalComment).toBe('A stored final comment');
    expect(serverSelection.isFinalCommentInputDisabled).toBe(true);
    expect(touchedComment).toMatchObject({ isComplete: true, status: 'success' });
  });
});

describe('R11 - submit', () => {
  it('reports final-step and review-incomplete blockers', () => {
    expect(
      getSubmitBlockers({
        finalStepEnabled: false,
        shouldSkipReviewQuestions: false,
        isValidForSubmission: false,
      }),
    ).toEqual(['final_step_disabled', 'review_incomplete']);
  });

  it('touches incomplete steps before submit', () => {
    const flowSnapshot = snapshot({
      caseData: completeCase({ case_categories: { value: 'report' } }),
      template: [
        question('question-a', [trafficField('content_language', null)]),
      ],
    });
    const selection = selectReviewFlow(initialState(flowSnapshot), flowSnapshot);
    const submitted = transitionReviewFlow(initialState(flowSnapshot), {
      type: 'SUBMIT_ATTEMPTED',
      incompleteStepIds: getIncompleteStepIds(selection.reachableSteps),
    });

    expect(submitted.touchedStepIds.has('question-a')).toBe(true);
  });
});

describe('R12 - touched mechanism', () => {
  it('touches the step being left and ignores hidden touched questions', () => {
    const flowSnapshot = snapshot({
      caseData: completeCase({
        case_keywords: [],
        case_categories: null,
        case_factchecks: null,
      }),
      template: [
        question('hidden-question', [
          trafficField('content_language', null, { is_shown: false }),
        ]),
      ],
    });
    const state = patchState(initialState(flowSnapshot), {
      metadataSaved: {
        title: true,
        keywords: false,
        category: false,
        factcheck: false,
      },
      currentStepId: METADATA_STEP_TITLE,
      touchedStepIds: new Set(['hidden-question']),
    });
    const navigated = transitionReviewFlow(state, {
      type: 'NAVIGATE',
      stepId: METADATA_STEP_KEYWORDS,
      reachableStepIds: [METADATA_STEP_TITLE, METADATA_STEP_KEYWORDS],
    });

    expect(navigated.touchedStepIds.has(METADATA_STEP_TITLE)).toBe(true);
    expect(selectReviewFlow(state, flowSnapshot).touchedQuestionIds.size).toBe(0);
  });
});

describe('R13 - dirty state and warning', () => {
  it('tracks metadata dirty state and disables the warning when locked', () => {
    const flowSnapshot = snapshot();
    const edited = transitionReviewFlow(initialState(flowSnapshot), {
      type: 'UPDATE_TITLE',
      value: 'A changed local title',
    });
    const locked = patchState(edited, { isLocked: true });

    expect(selectReviewFlow(edited, flowSnapshot).hasUnsavedChanges).toBe(true);
    expect(
      selectReviewFlow(edited, flowSnapshot).isUnsavedChangesWarningActive,
    ).toBe(true);
    expect(
      selectReviewFlow(locked, flowSnapshot).isUnsavedChangesWarningActive,
    ).toBe(false);
  });
});

describe('R14 - hydration and server sync', () => {
  it('resets state when the case changes', () => {
    const firstSnapshot = snapshot();
    const secondSnapshot = {
      ...firstSnapshot,
      caseId: 'case-2',
      metadataInitialDraft: {
        ...firstSnapshot.metadataInitialDraft,
        title: 'Second case title',
      },
    };

    expect(
      hydrateReviewFlowState(initialState(firstSnapshot), secondSnapshot)
        .caseId,
    ).toBe('case-2');
  });

  it('keeps dirty local metadata unless the server catches up', () => {
    const flowSnapshot = snapshot({
      caseData: makeCase({ open_graph_data: { og_title: '' } }),
    });
    const dirty = transitionReviewFlow(initialState(flowSnapshot), {
      type: 'UPDATE_TITLE',
      value: 'A local valid title',
    });
    const serverCaughtUp = snapshot({
      caseData: makeCase({
        case_titles: { value: 'A local valid title' },
      }),
    });
    const hydrated = hydrateReviewFlowState(dirty, serverCaughtUp);

    expect(hydrated.metadataDirty.title).toBe(false);
    expect(hydrated.metadataSaved.title).toBe(true);
  });

  it('overwrites comment drafts from server comments', () => {
    const flowSnapshot = snapshot();
    const withDraft = transitionReviewFlow(initialState(flowSnapshot), {
      type: 'SET_FINAL_COMMENT',
      value: 'local draft',
    });
    const withServerComment = snapshot({
      caseData: completeCase({
        case_comments: [
          {
            author_id: userId,
            content: 'server comment',
            created_at: '2024-01-01T00:00:00.000Z',
          },
        ],
      }),
    });

    expect(
      hydrateReviewFlowState(withDraft, withServerComment).finalCommentDraft,
    ).toBe('server comment');
  });
});

describe('R15 - effective values', () => {
  it('combines server and local state for category, metadata and final enablement', () => {
    const flowSnapshot = snapshot({
      caseData: completeCase({
        case_categories: { value: 'report' },
        case_factchecks: {
          has_factcheck: true,
          value: 'https://example.com/factcheck',
        },
      }),
    });
    const state = patchState(initialState(flowSnapshot), {
      metadataDraft: {
        ...initialState(flowSnapshot).metadataDraft,
        category: 'opinion',
      },
      metadataSaved: {
        title: true,
        keywords: true,
        category: true,
        factcheck: true,
      },
    });
    const effective = getEffectiveReviewFlowState(state, flowSnapshot);

    expect(effective.caseCategory).toBe('opinion');
    expect(effective.metadataComplete).toBe(true);
    expect(effective.shouldSkipReviewQuestions).toBe(true);
    expect(effective.finalStepEnabled).toBe(true);
    expect(REVIEW_FLOW_TRANSITIONS.NAVIGATE).toContain('reachable');
  });
});
