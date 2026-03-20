import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

interface NavigableStep {
  id: string;
  isComplete: boolean;
}

interface UseReviewNavigationOptions<TStep extends NavigableStep> {
  steps: TStep[];
  currentStepId: string;
  setCurrentStepId: Dispatch<SetStateAction<string>>;
}

export const useReviewNavigation = <TStep extends NavigableStep>({
  steps,
  currentStepId,
  setCurrentStepId,
}: UseReviewNavigationOptions<TStep>) => {
  const firstIncompleteStepId = useMemo(
    () =>
      steps.find((step) => !step.isComplete)?.id ??
      steps[steps.length - 1]?.id ??
      '',
    [steps],
  );

  useEffect(() => {
    if (steps.length === 0) return;

    const hasCurrentStep = steps.some((step) => step.id === currentStepId);
    if (!hasCurrentStep) {
      setCurrentStepId(firstIncompleteStepId);
    }
  }, [currentStepId, firstIncompleteStepId, steps]);

  const currentStep = useMemo(
    () => steps.find((step) => step.id === currentStepId) ?? steps[0] ?? null,
    [currentStepId, steps],
  );

  const isLastStep = useMemo(
    () =>
      currentStep !== null &&
      steps.findIndex((step) => step.id === currentStep.id) ===
        steps.length - 1,
    [currentStep, steps],
  );

  const setNextStep = useCallback(() => {
    const currentStepIndex = steps.findIndex(
      (step) => step.id === currentStepId,
    );
    if (currentStepIndex < 0 || currentStepIndex >= steps.length - 1) {
      return;
    }

    const nextStep = steps[currentStepIndex + 1];
    if (nextStep) {
      setCurrentStepId(nextStep.id);
    }
  }, [currentStepId, steps]);

  const handleNavClick = useCallback(
    (stepId: string) => {
      setCurrentStepId(stepId);
    },
    [setCurrentStepId],
  );

  return {
    currentStepId,
    currentStep,
    isLastStep,
    setNextStep,
    handleNavClick,
  };
};
