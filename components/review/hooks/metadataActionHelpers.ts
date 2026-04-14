import type { ReviewFlowEvent } from '@/lib/review-flow/machine';
import type { MetadataStepKey } from '@/lib/review-flow/validation';
import type { Dispatch } from 'react';

interface RunMetadataSaveOptions {
  dispatch: Dispatch<ReviewFlowEvent>;
  currentStepId: string;
  issues: unknown[];
  step: MetadataStepKey;
  nextStepId: string;
  save: () => Promise<boolean>;
}

export const runMetadataSave = async ({
  dispatch,
  currentStepId,
  issues,
  step,
  nextStepId,
  save,
}: RunMetadataSaveOptions) => {
  dispatch({ type: 'STEPS_TOUCHED', stepIds: [currentStepId] });
  if (issues.length > 0) return;

  const didSave = await save();
  if (!didSave) return;

  dispatch({ type: 'METADATA_SAVE_SUCCEEDED', step, nextStepId });
};
