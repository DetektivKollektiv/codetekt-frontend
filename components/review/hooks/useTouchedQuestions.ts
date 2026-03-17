import { useEffect, useRef, useState } from 'react';

interface UseTouchedQuestionsOptions {
  currentQuestionId: string;
}

export const useTouchedQuestions = ({
  currentQuestionId,
}: UseTouchedQuestionsOptions) => {
  const [touchedQuestionIds, setTouchedQuestionIds] = useState<Set<string>>(
    new Set(),
  );
  const previousQuestionIdRef = useRef(currentQuestionId);

  useEffect(() => {
    const previousQuestionId = previousQuestionIdRef.current;
    if (previousQuestionId && previousQuestionId !== currentQuestionId) {
      setTouchedQuestionIds((prev) => new Set([...prev, previousQuestionId]));
    }
    previousQuestionIdRef.current = currentQuestionId;
  }, [currentQuestionId]);

  return {
    touchedQuestionIds,
  };
};
