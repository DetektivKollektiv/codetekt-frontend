import {
  setCaseCategoryMutation,
} from '@/lib/queries/setCaseCategory';
import type { SetCaseCategoryData } from '@/lib/queries/setCaseCategory';
import {
  setCaseFactcheckMutation,
} from '@/lib/queries/setCaseFactcheck';
import type { SetCaseFactcheckData } from '@/lib/queries/setCaseFactcheck';
import {
  setCaseKeywordsMutation,
} from '@/lib/queries/setCaseKeywords';
import type { SetCaseKeywordsData } from '@/lib/queries/setCaseKeywords';
import {
  setCaseTitleMutation,
} from '@/lib/queries/setCaseTitle';
import type { SetCaseTitleData } from '@/lib/queries/setCaseTitle';
import { getCase } from '@/lib/queries/getCase';
import type { Case } from '@/lib/queries/getCase';
import {
  caseCategorySchema,
  caseFactcheckSchema,
  caseTitleSchema,
  userKeywordsSchema,
} from '@/lib/schemas/case-metadata-schemas';
import type {
  CaseCategoryValue,
  CaseFactcheckValue,
} from '@/lib/schemas/case-metadata-schemas';
import type { Database } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UseMetadataSaveOptions {
  supabase: SupabaseClient<Database>;
  caseId: string;
  userId?: string;
}

interface MetadataSaveMutations {
  mutateTitleAsync: (data: SetCaseTitleData) => Promise<unknown>;
  mutateKeywordsAsync: (data: SetCaseKeywordsData) => Promise<unknown>;
  mutateCategoryAsync: (data: SetCaseCategoryData) => Promise<unknown>;
  mutateFactcheckAsync: (data: SetCaseFactcheckData) => Promise<unknown>;
}

type SingleMetadataField = 'title' | 'category' | 'factcheck';

const METADATA_STALE_CONFLICT_MESSAGE =
  'In der Zwischenzeit hat ein anderer Nutzer den Fall weiter bearbeitet. Der aktuelle Stand wurde geladen.';
const METADATA_STALE_REFRESH_FAILED_MESSAGE =
  'In der Zwischenzeit hat ein anderer Nutzer den Fall weiter bearbeitet. Der aktuelle Stand konnte nicht geladen werden. Bitte lade die Seite neu.';

const getErrorValue = (
  error: unknown,
  key: 'code' | 'message' | 'details',
) => {
  if (typeof error !== 'object' || error === null || !(key in error)) {
    return undefined;
  }

  const value = (error as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
};

const getSaveErrorMessage = (error: unknown, fallback: string) =>
  getErrorValue(error, 'message') ?? fallback;

const isUniqueConstraintError = (error: unknown, constraintName: string) => {
  if (getErrorValue(error, 'code') !== '23505') {
    return false;
  }

  return [getErrorValue(error, 'message'), getErrorValue(error, 'details')]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.includes(constraintName));
};

const getKeywordsSaveErrorMessage = (error: unknown) => {
  if (getErrorValue(error, 'code') === '23505') {
    return 'Du hast bereits Stichwörter für diesen Fall erstellt';
  }

  return getSaveErrorMessage(error, 'Fehler beim Speichern der Stichwörter');
};

const getRequiredUserId = (userId?: string) => {
  if (userId) return userId;
  toast.error('Du musst angemeldet sein');
  return null;
};

const createMetadataSaveHandlers = ({
  caseId,
  userId,
  mutations,
  refreshCaseAfterConflict,
}: {
  caseId: string;
  userId?: string;
  mutations: MetadataSaveMutations;
  refreshCaseAfterConflict: () => Promise<Case>;
}) => {
  const handleStaleConflict = async (field: SingleMetadataField) => {
    const freshCase = await refreshCaseAfterConflict().catch(() => null);
    const hasFreshValue =
      field === 'title'
        ? !!freshCase?.case_titles
        : field === 'category'
          ? !!freshCase?.case_categories
          : !!freshCase?.case_factchecks;

    if (!hasFreshValue) return false;

    toast.error(METADATA_STALE_CONFLICT_MESSAGE);
    return true;
  };

  const saveTitle = async (value: string): Promise<boolean> => {
    const authorId = getRequiredUserId(userId);
    if (!authorId) return false;
    const result = caseTitleSchema.safeParse(value);
    if (!result.success) return false;

    try {
      await mutations.mutateTitleAsync({ caseId, value: result.data, userId: authorId });
      return true;
    } catch (error) {
      if (
        isUniqueConstraintError(error, 'case_titles_case_id_unique') &&
        (await handleStaleConflict('title'))
      ) {
        return false;
      }

      if (isUniqueConstraintError(error, 'case_titles_case_id_unique')) {
        toast.error(METADATA_STALE_REFRESH_FAILED_MESSAGE);
        return false;
      }

      toast.error(getSaveErrorMessage(error, 'Fehler beim Speichern des Titels'));
      return false;
    }
  };

  const saveKeywords = async (values: string[]): Promise<boolean> => {
    const authorId = getRequiredUserId(userId);
    if (!authorId) return false;
    const result = userKeywordsSchema.safeParse(values);
    if (!result.success) return false;

    try {
      await mutations.mutateKeywordsAsync({ caseId, values: result.data, userId: authorId });
      return true;
    } catch {
      return false;
    }
  };

  const saveCategory = async (value: CaseCategoryValue): Promise<boolean> => {
    const authorId = getRequiredUserId(userId);
    if (!authorId) return false;
    const result = caseCategorySchema.safeParse(value);
    if (!result.success) return false;

    try {
      await mutations.mutateCategoryAsync({ caseId, value: result.data, userId: authorId });
      return true;
    } catch (error) {
      if (
        isUniqueConstraintError(error, 'case_categories_case_id_unique') &&
        (await handleStaleConflict('category'))
      ) {
        return false;
      }

      if (isUniqueConstraintError(error, 'case_categories_case_id_unique')) {
        toast.error(METADATA_STALE_REFRESH_FAILED_MESSAGE);
        return false;
      }

      toast.error(getSaveErrorMessage(error, 'Fehler beim Speichern der Kategorie'));
      return false;
    }
  };

  const saveFactcheck = async (value: CaseFactcheckValue): Promise<boolean> => {
    const authorId = getRequiredUserId(userId);
    if (!authorId) return false;
    const result = caseFactcheckSchema.safeParse({
      hasFactcheck: value.hasFactcheck,
      value: value.hasFactcheck ? value.value?.trim() || null : null,
    });
    if (!result.success) return false;

    try {
      await mutations.mutateFactcheckAsync({
        caseId,
        ...result.data,
        userId: authorId,
      });
      return true;
    } catch (error) {
      if (await handleStaleConflict('factcheck')) {
        return false;
      }

      toast.error(
        getSaveErrorMessage(error, 'Fehler beim Speichern des Faktenchecks'),
      );
      return false;
    }
  };

  return { saveTitle, saveKeywords, saveCategory, saveFactcheck };
};

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

  const refreshCaseAfterConflict = async () => {
    const { data, error } = await getCase(supabase, caseId);
    if (error) throw error;

    queryClient.setQueryData(['case', caseId], data);
    await queryClient.invalidateQueries({ queryKey: ['review-template', caseId] });

    return data;
  };

  const { mutateAsync: mutateTitleAsync, isPending: isTitlePending } =
    useMutation({
    ...setCaseTitleMutation(supabase),
    onSuccess: async () => {
      await invalidateCase();
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
    });

  const { mutateAsync: mutateFactcheckAsync, isPending: isFactcheckPending } =
    useMutation({
      ...setCaseFactcheckMutation(supabase),
      onSuccess: async () => {
        await invalidateCase();
      },
    });

  const saveHandlers = createMetadataSaveHandlers({
    caseId,
    userId,
    mutations: {
      mutateTitleAsync,
      mutateKeywordsAsync,
      mutateCategoryAsync,
      mutateFactcheckAsync,
    },
    refreshCaseAfterConflict,
  });

  return {
    ...saveHandlers,
    isTitlePending,
    isKeywordsPending,
    isCategoryPending,
    isFactcheckPending,
  };
};
