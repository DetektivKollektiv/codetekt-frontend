import { setCaseCategoryMutation } from '@/lib/queries/setCaseCategory';
import { setCaseFactcheckMutation } from '@/lib/queries/setCaseFactcheck';
import { setCaseKeywordsMutation } from '@/lib/queries/setCaseKeywords';
import { setCaseTitleMutation } from '@/lib/queries/setCaseTitle';
import {
  caseCategorySchema,
  CaseCategoryValue,
  caseFactcheckSchema,
  CaseFactcheckValue,
  caseKeywordsSchema,
  caseTitleSchema,
} from '@/lib/schemas/case-metadata-schemas';
import { Database } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UseMetadataSaveOptions {
  supabase: SupabaseClient<Database>;
  caseId: string;
  userId?: string;
}

export const useMetadataSave = ({
  supabase,
  caseId,
  userId,
}: UseMetadataSaveOptions) => {
  const queryClient = useQueryClient();

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

  const { mutateAsync: mutateTitleAsync, isPending: isTitlePending } =
    useMutation({
    ...setCaseTitleMutation(supabase),
    onSuccess: async () => {
      await invalidateCase();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Speichern des Titels');
    },
  });

  const { mutateAsync: mutateKeywordsAsync, isPending: isKeywordsPending } =
    useMutation({
      ...setCaseKeywordsMutation(supabase),
      onSuccess: async () => {
        await invalidateCase();
      },
      onError: (error: unknown) => {
        toast.error(getKeywordsSaveErrorMessage(error));
      },
    });

  const { mutateAsync: mutateCategoryAsync, isPending: isCategoryPending } =
    useMutation({
      ...setCaseCategoryMutation(supabase),
      onSuccess: async () => {
        await invalidateCase();
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Fehler beim Speichern der Kategorie');
      },
    });

  const { mutateAsync: mutateFactcheckAsync, isPending: isFactcheckPending } =
    useMutation({
      ...setCaseFactcheckMutation(supabase),
      onSuccess: async () => {
        await invalidateCase();
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Fehler beim Speichern des Faktenchecks');
      },
    });

  const saveTitle = async (value: string): Promise<boolean> => {
    if (!userId) {
      toast.error('Du musst angemeldet sein');
      return false;
    }
    const result = caseTitleSchema.safeParse(value);
    if (!result.success) {
      return false;
    }
    try {
      await mutateTitleAsync({ caseId, value: result.data, userId });
      return true;
    } catch {
      return false;
    }
  };

  const saveKeywords = async (values: string[]): Promise<boolean> => {
    if (!userId) {
      toast.error('Du musst angemeldet sein');
      return false;
    }
    const result = caseKeywordsSchema.safeParse(values);
    if (!result.success) {
      return false;
    }
    try {
      await mutateKeywordsAsync({ caseId, values: result.data, userId });
      return true;
    } catch {
      return false;
    }
  };

  const saveCategory = async (value: CaseCategoryValue): Promise<boolean> => {
    if (!userId) {
      toast.error('Du musst angemeldet sein');
      return false;
    }
    const result = caseCategorySchema.safeParse(value);
    if (!result.success) {
      return false;
    }
    try {
      await mutateCategoryAsync({ caseId, value: result.data, userId });
      return true;
    } catch {
      return false;
    }
  };

  const saveFactcheck = async (value: CaseFactcheckValue): Promise<boolean> => {
    if (!userId) {
      toast.error('Du musst angemeldet sein');
      return false;
    }

    const normalizedValue = value.hasFactcheck
      ? value.value?.trim() || null
      : null;
    const result = caseFactcheckSchema.safeParse({
      hasFactcheck: value.hasFactcheck,
      value: normalizedValue,
    });

    if (!result.success) {
      return false;
    }

    try {
      await mutateFactcheckAsync({
        caseId,
        hasFactcheck: result.data.hasFactcheck,
        value: result.data.value,
        userId,
      });
      return true;
    } catch {
      return false;
    }
  };

  return {
    saveTitle,
    saveKeywords,
    saveCategory,
    saveFactcheck,
    isTitlePending,
    isKeywordsPending,
    isCategoryPending,
    isFactcheckPending,
  };
};
