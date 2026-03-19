import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';

export type ReviewStepStatus = 'error' | 'success' | 'incomplete' | undefined;

export type MetadataStep = {
  id: string;
  label: string;
  description: string;
  helpUrl?: string;
  fieldTitle?: string;
  primaryActionLabel?: string;
  disputeActionLabel?: string;
  isIndented: boolean;
  status: ReviewStepStatus;
  kind: 'metadata';
  isComplete: boolean;
};

export type QuestionStep = {
  id: string;
  label: string;
  helpUrl?: string;
  isIndented: boolean;
  status: ReviewStepStatus;
  kind: 'question';
  isComplete: boolean;
  question: NonNullable<ReviewTemplate>[number];
};

export type FinalCommentStep = {
  id: string;
  label: string;
  description: string;
  helpUrl?: string;
  isIndented: boolean;
  status: ReviewStepStatus;
  kind: 'final-comment';
  isComplete: boolean;
};

export type ReviewStep = MetadataStep | QuestionStep | FinalCommentStep;
