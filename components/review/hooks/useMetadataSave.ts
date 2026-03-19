import { setCaseCategoryMutation } from '@/lib/queries/setCaseCategory';
import { setCaseKeywordsMutation } from '@/lib/queries/setCaseKeywords';
import { setCaseTitleMutation } from '@/lib/queries/setCaseTitle';
import {
  caseCategorySchema,
  CaseCategoryValue,
  caseKeywordsSchema,
  caseTitleSchema,
} from '@/lib/schemas/case-metadata-schemas';
import { Database } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { $ZodIssue } from 'zod/v4/core';

interface UseMetadataSaveOptions {
  supabase: SupabaseClient<Database>;
  caseId: string;
  userId?: string;
  onStepComplete: (step: 'title' | 'keywords' | 'category') => void;
}

export const useMetadataSave = ({
  supabase,
  caseId,
  userId,
  onStepComplete,
}: UseMetadataSaveOptions) => {
  const queryClient = useQueryClient();
  const [titleIssues, setTitleIssues] = useState<$ZodIssue[]>([]);
  const [keywordsIssues, setKeywordsIssues] = useState<$ZodIssue[]>([]);
  const [categoryIssues, setCategoryIssues] = useState<$ZodIssue[]>([]);

  const invalidateCase = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['case', caseId] }),
      queryClient.invalidateQueries({ queryKey: ['review-template', caseId] }),
    ]);
  };

  const getKeywordsSaveErrorMessage = (error: unknown) => {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === '23505'
    ) {
      return 'Du hast bereits Stichwörter für diesen Fall erstellt';
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      return (error as { message: string }).message;
    }

    return 'Fehler beim Speichern der Stichwörter';
  };

  const { mutate: mutateTitle, isPending: isTitlePending } = useMutation({
    ...setCaseTitleMutation(supabase),
    onSuccess: async () => {
      setTitleIssues([]);
      await invalidateCase();
      onStepComplete('title');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Speichern des Titels');
    },
  });

  const { mutate: mutateKeywords, isPending: isKeywordsPending } = useMutation({
    ...setCaseKeywordsMutation(supabase),
    onSuccess: async () => {
      setKeywordsIssues([]);
      await invalidateCase();
      onStepComplete('keywords');
    },
    onError: (error: unknown) => {
      toast.error(getKeywordsSaveErrorMessage(error));
    },
  });

  const { mutate: mutateCategory, isPending: isCategoryPending } = useMutation({
    ...setCaseCategoryMutation(supabase),
    onSuccess: async () => {
      setCategoryIssues([]);
      await invalidateCase();
      onStepComplete('category');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Speichern der Kategorie');
    },
  });

  const setTitle = (value: string) => {
    if (!userId) {
      toast.error('Du musst angemeldet sein');
      return;
    }
    const result = caseTitleSchema.safeParse(value);
    if (!result.success) {
      setTitleIssues(result.error.issues);
      return;
    }
    setTitleIssues([]);
    mutateTitle({ caseId, value: result.data, userId });
  };

  const setKeywords = (values: string[]) => {
    if (!userId) {
      toast.error('Du musst angemeldet sein');
      return;
    }
    const result = caseKeywordsSchema.safeParse(values);
    if (!result.success) {
      setKeywordsIssues(result.error.issues);
      return;
    }
    setKeywordsIssues([]);
    mutateKeywords({ caseId, values: result.data, userId });
  };

  const setCategory = (value: CaseCategoryValue) => {
    if (!userId) {
      toast.error('Du musst angemeldet sein');
      return;
    }
    const result = caseCategorySchema.safeParse(value);
    if (!result.success) {
      setCategoryIssues(result.error.issues);
      return;
    }
    setCategoryIssues([]);
    mutateCategory({ caseId, value: result.data, userId });
  };

  return {
    setTitle,
    setKeywords,
    setCategory,
    isTitlePending,
    isKeywordsPending,
    isCategoryPending,
    titleIssues,
    keywordsIssues,
    categoryIssues,
  };
};
