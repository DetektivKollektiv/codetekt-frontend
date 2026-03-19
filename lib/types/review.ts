import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';

export type ReviewStepStatus = 'error' | 'success' | 'incomplete' | undefined;

type BaseReviewStep = {
  id: string;
  label: string;
  helpUrl?: string;
  isIndented: boolean;
  status: ReviewStepStatus;
  isComplete: boolean;
};

type DescribedReviewStep = BaseReviewStep & {
  description: string;
};

export type MetadataStep = DescribedReviewStep & {
  fieldTitle?: string;
  primaryActionLabel?: string;
  disputeActionLabel?: string;
  kind: 'metadata';
};

export type QuestionStep = BaseReviewStep & {
  kind: 'question';
  question: NonNullable<ReviewTemplate>[number];
};

export type TerminalStepKind = 'comment' | 'submit';

export type TerminalStep = DescribedReviewStep & {
  kind: TerminalStepKind;
};

export type ReviewStep = MetadataStep | QuestionStep | TerminalStep;
